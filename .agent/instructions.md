# Project Overview: RoadRunnerBD E-commerce

This project is a high-performance, modern e-commerce platform built for a specific client (the "Admin"). It features a public storefront and a password-protected admin dashboard.

## Core Features

### 1. Storefront (Public)
- **Brand Assets:** 
  - **Logo:** Use a temporary placeholder; to be replaced by the user.
  - **Hero Banner:** Use a temporary placeholder; to be replaced by the user.
- **Responsive Navigation:** Slick, modern dark-themed navigation.
- **Product Discovery:** 
  - Real-time "fuzzy" search dropdown implemented natively in Navbar for both Desktop and Mobile viewports.
  - Category filtering grid with Framer Motion animations.
- **Product Details:** 
  - Price displayed in BDT.
  - Multiple image support with a main display and a slick carousel.
- **WhatsApp Integration:** A "Buy on WhatsApp" button that sends a pre-filled message with the product link to the admin.

### 2. Admin Dashboard (Protected)
- **Dashboard Home:** An overview section showing total product count and alerts for "Out of Stock" items.
- **Internal Auth:** Simple password-based entry (environment variable `ADMIN_PASS`) with a **Logout** feature.
- **Session Management:** Password cached in the browser for a seamless experience.
- **Product Management (CRUD):** 
  - Create, Read, Update, and Delete products.
  - Admin view features Real-time Debounced Search for quickly managing large inventory grids.
  - Upload multiple images (Cloudflare R2), with the ability to define a specific "Cover" image from the gallery array.
  - **Storage Warning:** Show a clear warning if R2 free tier limits are approached/exceeded, prompting the admin to delete older pictures.
  - Assign/Unassign categories.
  - **Deletion Logic:** Deletions MUST use custom React Modals (no `window.confirm`) and cascade explicitly through backend join tables (`product_categories`) to prevent Foreign Key blocks.
- **Category Management (CRUD):** 
  - Manage categories independently.
  - Link/unlink products and categories.

## Goal
To provide a premium-feel shopping experience for users and a simple, powerful management tool for the admin.
