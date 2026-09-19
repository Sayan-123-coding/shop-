import { supabase } from '../lib/supabase';

export const categoryService = {
  /**
   * Get all categories for a shop
   */
  async getCategories(shopId) {
    if (!shopId) throw new Error('shopId is required');
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        parent:parent_id (
          id,
          name
        )
      `)
      .eq('shop_id', shopId)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get single category by ID
   */
  async getCategoryById(id, shopId) {
    if (!shopId) throw new Error('shopId is required');
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('shop_id', shopId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new category
   */
  async createCategory(categoryData, shopId) {
    if (!shopId) throw new Error('shopId is required');
    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...categoryData, shop_id: shopId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update existing category
   */
  async updateCategory(id, shopId, updates) {
    if (!shopId) throw new Error('shopId is required');
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('shop_id', shopId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete category
   */
  async deleteCategory(id, shopId) {
    if (!shopId) throw new Error('shopId is required');
    
    // Check if any products use this category before deleting
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)
      .eq('shop_id', shopId);
      
    if (countError) throw countError;
    if (count > 0) {
      throw new Error(`Cannot delete category because it contains ${count} products.`);
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('shop_id', shopId);

    if (error) throw error;
    return true;
  }
};
