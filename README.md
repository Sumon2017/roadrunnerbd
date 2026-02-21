This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 🎨 Customizing Branding

This project is built with easy branding customization in mind. You can swap the logo and hero banner without changing the code:

- **Logo**: Place your logo file in `public/logo.png`.
- **Hero Banner**: Place your banner image in `public/hero-banner.jpg`.

The components in `src/components/Branding` will automatically detect these files and display them with a premium dark-mode aesthetic.

## Cloudflare Image Cleanup Cron Job

Orphaned images (uploaded during product creation but never saved) can be cleaned up automatically using a secret API route.
You can trigger this route manually, or set it up via Vercel Cron or Upstash by passing your `CRON_SECRET`.

To trigger manually via CLI:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/cleanup-images
```
Or via URL explicitly:
```bash
curl "https://yourdomain.com/api/cron/cleanup-images?secret=YOUR_CRON_SECRET"
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
