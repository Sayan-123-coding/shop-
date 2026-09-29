# Product Requirements Document (PRD) - Shoe Store Digital Catalogue

## 1. Product Overview
The project is a digital product catalogue tailored for a shoe store. It features a public-facing storefront for customers to browse products and categories, and a secure admin dashboard for store owners to manage their inventory, categories, and store settings. The backend leverages Supabase for database, authentication, and file storage.

## 2. Technology Stack
**Frontend:**
- **Framework:** React 19 with Vite
- **Routing:** React Router v7 (`react-router-dom`)
- **Styling/UI:** Custom UI components (likely CSS modules or Tailwind based on standard Vite setups), `lucide-react` for icons.
- **Linting:** Oxlint

**Backend (BaaS):**
- **Platform:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth (Email/Password or Magic Link)
- **Storage:** Supabase Storage (for product images, bucket: `product-images`)

## 3. System Architecture & Database Schema
The database is built on PostgreSQL with Row Level Security (RLS) ensuring strict access controls.

**Key Tables:**
- `shops`: Stores core shop information (name, logo, theme, opening hours, contact details). Allows for multi-tenancy or extensive shop customization.
- `admin_users`: Links Supabase `auth.users` to a specific `shop_id` with role-based access (`admin` or `superadmin`).
- `categories`: Hierarchical product categories (supports `parent_id` for nested categories).
- `products`: Core product information (sku, price, brand, availability, published status).
- `product_images`: Associated images for products, including a primary image flag and display ordering.

**Security (RLS):**
- **Public:** Can view shop details, visible categories, published products (not hidden), and associated product images.
- **Admin:** Can manage (CRUD) only the data associated with their specific `shop_id`.
- **Storage:** Public read access for images. Authenticated admins can upload/update/delete images within their shop's designated path (`shop/{shop_id}/products/{product_id}/...`).

## 4. User Flows

### Public Flow (Customers)
1. **Home (`/`)**: Landing page showcasing the store and featured collections.
2. **Collections (`/collections`)**: Browse all available product categories.
3. **Category View (`/collections/:category`)**: View products filtered by a specific category.
4. **Product Details (`/product/:slug`)**: View detailed information, multiple images, pricing, and availability for a specific product.
5. **Informational Pages**: About (`/about`) and Contact (`/contact`).

### Admin Flow (Store Owners)
1. **Authentication (`/admin/login`)**: Public-only route to authenticate admins.
2. **Dashboard (`/admin`)**: Protected route offering an overview of store metrics.
3. **Product Management**: 
   - View list of products (`/admin/products`).
   - Create/Edit products (`/admin/products/new`, `/admin/products/:id/edit`).
4. **Category Management (`/admin/categories`)**: Create and organize product categories.
5. **Store Settings (`/admin/settings`)**: Update shop metadata (logo, theme, contact info).

## 5. Folder Structure
```
shop-/
├── src/
│   ├── assets/       # Static assets (images, fonts)
│   ├── components/   # Reusable React components
│   │   ├── layout/   # Layout wrappers (PublicLayout, AdminLayout)
│   │   ├── product/  # Product-specific components (cards, galleries)
│   │   └── ui/       # Generic UI elements (buttons, inputs, toasts)
│   ├── config/       # Configuration files
│   ├── hooks/        # Custom React hooks (e.g., useAuth)
│   ├── lib/          # Utility functions and Supabase client setup
│   ├── pages/        # Route components (Home, Collections, Admin views, etc.)
│   ├── services/     # API service layers
│   ├── styles/       # Global styles
│   ├── App.jsx       # Main application router and guards
│   └── main.jsx      # Entry point
├── supabase/
│   ├── schema.sql    # Complete PostgreSQL schema definitions and policies
│   └── README.md     # Supabase specific documentation
├── package.json      # Dependencies and scripts
└── vite.config.js    # Vite configuration
```

## 6. Future Development / AI Context
When making changes, the AI should be aware of:
- **Authentication Guards**: `ProtectedRoute` and `PublicOnlyRoute` in `App.jsx` manage access to the `/admin` section.
- **Supabase Integration**: Changes to data models must be reflected in `supabase/schema.sql` (RLS policies may need adjusting) and the frontend `services/` or `hooks/` layer.
- **Multitenancy Architecture**: The database uses `shop_id` across all major tables. All admin mutations must ensure `shop_id` scoping to maintain security.
