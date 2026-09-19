import { supabase } from '../lib/supabase';

export const productService = {
  /**
   * Get all products for a shop with category names
   */
  async getProducts(shopId) {
    if (!shopId) throw new Error('shopId is required');
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories (name),
        product_images (image_url, is_primary)
      `)
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get a single product by ID with its images
   */
  async getProductById(id, shopId) {
    if (!shopId) throw new Error('shopId is required');
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (*)
      `)
      .eq('id', id)
      .eq('shop_id', shopId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new product
   */
  async createProduct(productData, shopId) {
    if (!shopId) throw new Error('shopId is required');
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...productData, shop_id: shopId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing product
   */
  async updateProduct(id, shopId, updates) {
    if (!shopId) throw new Error('shopId is required');
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .eq('shop_id', shopId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a product
   */
  async deleteProduct(id, shopId) {
    if (!shopId) throw new Error('shopId is required');
    
    // Deleting the product will automatically cascade and delete product_images rows,
    // but it will NOT delete the actual files in Storage. 
    // We should ideally clean up storage, but for this demo, we'll let Supabase 
    // delete the row and we can write a backend function to clean storage later,
    // or we can manually delete the files here.
    
    // First fetch images to get their storage paths
    const { data: images } = await supabase
      .from('product_images')
      .select('storage_path')
      .eq('product_id', id);

    // Delete product row (cascades to product_images)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('shop_id', shopId);

    if (error) throw error;

    // Best effort cleanup of storage
    if (images && images.length > 0) {
      const paths = images.map(img => img.storage_path).filter(Boolean);
      if (paths.length > 0) {
        await supabase.storage.from('product-images').remove(paths);
      }
    }

    return true;
  },

  /**
   * Update product availability
   */
  async updateProductAvailability(id, shopId, availability) {
    return this.updateProduct(id, shopId, { availability });
  },

  /**
   * Upload multiple images for a product and handle partial failures securely.
   * Returns { successCount, failedFiles }
   */
  async uploadProductImages(shopId, productId, files) {
    if (!shopId || !productId || !files || files.length === 0) return { successCount: 0, failedFiles: [] };

    let successCount = 0;
    const failedFiles = [];
    const uploadedStoragePaths = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Generate unique filename to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `shop/${shopId}/products/${productId}/${fileName}`;

      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          console.error('[IMAGE UPLOAD DEBUG]', {
            message: uploadError?.message,
            name: uploadError?.name,
            statusCode: uploadError?.statusCode,
            error: uploadError?.error,
            filePath: filePath.replace(/[0-9a-fA-F-]{36}/g, '<UUID>')
          });
          throw uploadError;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        // Insert into product_images
        const { error: dbError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: publicUrlData.publicUrl,
            storage_path: filePath,
            display_order: i,
            is_primary: i === 0 && successCount === 0 // Make first successful image primary if none exist
          });

        if (dbError) {
          // If DB insert fails, cleanup the orphaned uploaded file
          await supabase.storage.from('product-images').remove([filePath]);
          throw dbError;
        }

        uploadedStoragePaths.push(filePath);
        successCount++;
      } catch (err) {
        console.error("Failed to upload image:", file.name, err);
        failedFiles.push(file.name);
      }
    }

    return { successCount, failedFiles };
  },

  /**
   * Delete a single product image
   */
  async deleteProductImage(imageId, storagePath) {
    // Remove from DB first
    const { error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (dbError) throw dbError;

    // Then remove from storage if it exists
    if (storagePath) {
      await supabase.storage.from('product-images').remove([storagePath]);
    }

    return true;
  }
};
