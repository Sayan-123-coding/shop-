import { supabase } from '../lib/supabase';

export const catalogueService = {
  /**
   * Get the active shop information (assuming single tenant demo for now)
   */
  async getShop() {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching shop:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get all visible categories that have at least one published, non-hidden product.
   */
  async getVisibleCategories() {
    // 1. Get all visible categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug, description, display_order')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (catError) throw catError;

    // 2. Get all published, non-hidden products to determine active categories
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('category_id')
      .eq('is_published', true)
      .neq('availability', 'hidden');

    if (prodError) throw prodError;

    const activeCategoryIds = new Set(products.map(p => p.category_id));

    // Filter categories that have at least one product
    return categories.filter(c => activeCategoryIds.has(c.id));
  },

  /**
   * Get all published, non-hidden products
   */
  async getPublishedProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories (name, slug),
        product_images (image_url, is_primary, display_order)
      `)
      .eq('is_published', true)
      .neq('availability', 'hidden')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get all published, non-hidden products by category slug
   */
  async getProductsByCategory(categorySlug) {
    // First, verify the category exists and is visible
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id, name, description')
      .eq('slug', categorySlug)
      .eq('is_visible', true)
      .single();

    if (catError) {
      if (catError.code === 'PGRST116') return { category: null, products: [] };
      throw catError;
    }

    const { data: products, error: prodError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories (name, slug),
        product_images (image_url, is_primary, display_order)
      `)
      .eq('category_id', category.id)
      .eq('is_published', true)
      .neq('availability', 'hidden')
      .order('created_at', { ascending: false });

    if (prodError) throw prodError;

    return { category, products };
  },

  /**
   * Get a single published, non-hidden product by slug
   */
  async getPublishedProductBySlug(slug) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories (name, slug),
        product_images (image_url, is_primary, display_order)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .neq('availability', 'hidden')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    // Sort images by display_order
    if (data.product_images) {
       data.product_images.sort((a, b) => a.display_order - b.display_order);
    }
    return data;
  }
};
