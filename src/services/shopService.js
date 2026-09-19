import { supabase } from '../lib/supabase';

export const shopService = {
  /**
   * Get shop by ID
   */
  async getShopById(shopId) {
    if (!shopId) throw new Error('shopId is required');
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update shop details
   */
  async updateShop(shopId, updates) {
    if (!shopId) throw new Error('shopId is required');
    const { data, error } = await supabase
      .from('shops')
      .update(updates)
      .eq('id', shopId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
