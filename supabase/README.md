# Supabase Database Foundation

This directory contains the database schema for the Shoe Store Digital Catalogue + Admin CMS.

## 1. Tables Overview

- **`shops`**: Stores global configuration for the store (name, business type, contact info, theme settings).
- **`admin_users`**: Links Supabase `auth.users` to a specific `shop_id`. Defines admin roles (`admin`, `superadmin`).
- **`categories`**: Stores product categories, supporting hierarchical structures via `parent_id`. Includes visibility toggles.
- **`products`**: The core catalogue table. Contains fixed price, availability state, and a JSONB column (`attributes_json`) for flexible fields like size, colour, material, and gender.
- **`product_images`**: Links multiple images to a product, supporting ordering and primary image selection.

## 2. Row Level Security (RLS) Strategy

The database uses strict Row Level Security (RLS) to enforce our unauthenticated public / authenticated admin model:

- **Public Access (Unauthenticated)**:
  - Can `SELECT` from `shops`.
  - Can `SELECT` from `categories` where `is_visible = true`.
  - Can `SELECT` from `products` where `is_published = true` and `availability != 'hidden'`.
  - Can `SELECT` from `product_images` linked to visible products.
  - Cannot `INSERT`, `UPDATE`, or `DELETE` anything.
  
- **Admin Access (Authenticated)**:
  - Authorized via the `is_admin(shop_id)` security definer function, which checks if `auth.uid()` exists in the `admin_users` table for that specific shop.
  - Admins have full CRUD (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) capabilities scoped **only** to the data belonging to their `shop_id`.

## 3. Bootstrapping the First Admin

Because RLS prevents arbitrary users from granting themselves admin rights, the first admin must be manually bootstrapped:

1. Sign up a user in the frontend (or create one directly in the Supabase Auth dashboard).
2. Get the new user's UUID from the `auth.users` table.
3. Get the UUID of the target shop from the `shops` table.
4. Manually run an `INSERT` in the Supabase SQL editor:
   ```sql
   INSERT INTO admin_users (user_id, shop_id, role) 
   VALUES ('<USER_UUID>', '<SHOP_UUID>', 'admin');
   ```

## 4. Product Image Storage

A Supabase Storage bucket named `product-images` is configured for holding all catalogue images.
- **Public Read**: Anyone can read objects in the bucket, allowing the frontend to easily display product images.
- **Admin Write**: Only users who exist in the `admin_users` table can upload, update, or delete images in this bucket.
- **Recommended Path Structure**: `shop/{shop_id}/products/{product_id}/{filename}`

## 5. How to Run `schema.sql`

1. Open your Supabase Dashboard.
2. Navigate to the **SQL Editor** on the left sidebar.
3. Create a New Query.
4. Copy the entire contents of `schema.sql` and paste it into the editor.
5. (Optional) Uncomment the Seed Data section at the bottom to initialize a demo shop.
6. Click **Run**. The script is idempotent and safe to run multiple times.

## 6. Environment Variables

Your React application requires the following environment variables (defined in your local `.env`):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```

## 7. Security Notes

- **Never expose the `service_role` key** in the frontend or public repositories.
- RLS handles all data isolation; do not attempt to enforce data visibility solely in the frontend.
- The `is_admin()` helper function is created as `SECURITY DEFINER` with `search_path = public` to safely check the `admin_users` table without risking search path injection attacks.
