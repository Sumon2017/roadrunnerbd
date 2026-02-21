import { S3Client } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID!;
const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;

export const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

/**
 * Robustly extracts the R2 key from a URL (absolute or relative).
 * Handles:
 * - Full public URLs (e.g. https://pub-xxx.r2.dev/products/img.jpg)
 * - Relative paths (e.g. /products/img.jpg or products/img.jpg)
 * - Query parameters (e.g. products/img.jpg?v=1)
 * - Leading slashes
 */
export function extractR2Key(url: string | null | undefined): string | null {
    if (!url) return null;

    try {
        let path: string;

        if (url.startsWith('http')) {
            const parsed = new URL(url);
            path = parsed.pathname;
        } else {
            // Remove leading slash if present
            path = url.split('?')[0]; // Strip query params
        }

        // Remove the R2_PUBLIC_URL domain part if it's there (case for relative paths that might already contain it)
        // or just ensure we're looking at the pathname.

        // Final cleanup: remove leading slash and decode URI components
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return decodeURIComponent(cleanPath);
    } catch {
        return null;
    }
}
