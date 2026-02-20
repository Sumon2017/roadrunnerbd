# Architecture: RoadRunnerBD

## Tech Stack
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS + Vanilla CSS for custom animations.
- **Animations:** Framer Motion for "slick" transitions.
- **Database:** Supabase.
  - *Constraint:* **Strictly use the `roadrunnerbd` schema.** Do not interact with the `public` schema or other parts of the database.
  - *Workflow:* Antigravity provides the SQL; User executes in Supabase SQL Editor.
- **Storage:** Cloudflare R2 (S3-compatible) for hosting product images.
- **Auth:** Simple environment-based `ADMIN_PASS` with `localStorage` persistence.

## Data Model (Supabase)
- **Schema:** `roadrunnerbd` (All tables must be created within this schema).

### Categories Table
- `id`: uuid (primary key)
- `name`: string (unique)
- `slug`: string (unique)
- `order_index`: integer (default: 0)
- `created_at`: timestamp

### Products Table
- `id`: uuid (primary key)
- `name`: string
- `description`: text
- `price`: decimal (BDT)
- `images`: string[] (R2 URLs. **Index 0 is explicitly designated as the Cover Image.**)
- `is_featured`: boolean (default: false)
- `is_out_of_stock`: boolean (default: false)
- `created_at`: timestamp

### product_categories (Join Table)
- `product_id`: uuid (foreign key)
- `category_id`: uuid (foreign key)
  - *Strict Rule:* When deleting a Product or Category from the Admin API, you MUST explicitly `.delete()` matching rows in this join table FIRST. Supabase does not cascade by default, and Foreign Key constraints will silently block parent deletions if links remain.

## Folder Structure
- `src/app/`: Next.js App Router (Public routes & `/admin` dashboard).
- `src/components/`: Reusable UI components (ProductCard, Carousel, Navbar).
- `src/lib/`: Logic for Supabase, R2 client, and Admin Auth helpers.
- `src/hooks/`: Custom React hooks (e.g., `useAdminAuth`).

## Image Strategy
- Images are uploaded to Cloudflare R2.
- URLs are stored in the Supabase `products` table.
- A dedicated API route `/api/upload` handles R2 signatures/uploads.
