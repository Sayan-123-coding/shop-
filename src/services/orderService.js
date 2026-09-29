import { supabase } from '../lib/supabase';

export const orderService = {
  /**
   * Create a new order and its items
   */
  async createOrder(orderData, orderItemData) {
    // 1. Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert order items with the new order's UUID
    const itemToInsert = {
      ...orderItemData,
      order_id: order.id
    };

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert([itemToInsert]);

    if (itemsError) throw itemsError;

    return order;
  },

  /**
   * Get order by order_id (string ID, not UUID) for receipt
   */
  async getOrderByOrderId(orderId) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        shop:shops (name, address, phone, whatsapp, maps_url),
        items:order_items (*)
      `)
      .eq('order_id', orderId)
      .single();

    if (orderError) throw orderError;
    return order;
  }
};
