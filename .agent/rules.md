# Project Standards & Rules: RoadRunnerBD

This document serves as the absolute "Source of Truth" for maintaining the premium quality and architectural integrity of RoadRunnerBD.

## 1. Design & Aesthetic System
- **Theme:** Strictly **Dark Mode** with high-contrast elements.
- **Aesthetic:** High-end glassmorphism, vibrant accents, and clean typography.
- **Responsiveness:** All pages MUST be mobile-first and responsive up to 4K displays.
- **Visual Feedback:** 
    - Use `lucide-react` for iconography.
    - Use `framer-motion` for every page transition and meaningful micro-interaction.
    - Every CRUD action must trigger a toast/confirmation for the user.
    - **CRITICAL:** NEVER use native `window.confirm()` or `alert()` for primary interaction flows. They are often silently blocked by mobile browsers and testing suites. Build custom React state modals instead.

## 2. Technical Stack
- **Framework:** Next.js (App Router).
- **Styling:** Tailwind CSS with custom background-blur utilities.
- **Animations:** Framer Motion.
- **Icons:** Lucide React.
- **Database:** Supabase (Public Schema).
- **Storage:** Cloudflare R2 (S3 Compatible).

## 3. Component & Code Standards
- **Component Pattern:** Arrow functions with `React.FC` typing for functional components.
- **Interfaces:** Every component must have a clearly defined TypeScript interface for its props.
- **File Naming:** 
    - Components: PascalCase (e.g., `ProductGallery.tsx`).
    - Hooks/Utils: camelCase (e.g., `useLocalStorage.ts`).
- **Currency:** Use `৳` (BDT) for all pricing. Use monospaced fonts for prices to ensure alignment.
- **No Placeholders:** Real-world assets (via `generate_image`) or high-quality placeholder URLs must be used.

## 4. Admin & Security
- **Authentication:** Password-protected gatekeeper via `ADMIN_PASS` stored in `.env`.
- **Session Management:** Passwords are cached in `localStorage` for convenience but validated on every server mutation.
- **Database Access:** 
    - Public UI: Use `supabase` (Anon Key) for read-only RLS-protected queries.
    - Admin UI: Mutations must go through API routes using `supabaseAdmin` (Service Role Key).

## 5. Media & Storage Logic
- **Cloudflare R2:** Used for all product images.
- **Usage Guard:** The system tracks usage and blocks uploads if the 1GB/limit (or specified meta) is reached to prevent cost overruns.
- **WhatsApp Integration:** 
    - Link Format: `https://wa.me/[PHONE]?text=[MSG]`
    - Pre-filled messages MUST include the product name and current page URL.

## 6. SEO & Metadata
- **Dynamic SEO:** Every product page must implement `generateMetadata` for dynamic Title, Description, and OG:Image.
- **Rich Previews:** Ensure images are passed as absolute URLs to satisfy social platform scrapers.

## 7. Performance & Scalability
- **Pagination:** Every list (Storefront, Admin Products/Categories) MUST be paginated.
- **Hardware Acceleration:** Prefer CSS transitions and `transform` properties for smooth 60FPS animations.
- **Zero CLS:** Elements should have pre-defined aspects (e.g., `aspect-[3/4]`) to prevent layout shifts during image loading.
