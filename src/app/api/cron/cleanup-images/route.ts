import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

// Helper to extract the R2 key from the full public URL
function extractR2Key(url: string): string | null {
    if (!url || !url.startsWith(R2_PUBLIC_URL)) return null;
    return url.replace(`${R2_PUBLIC_URL}/`, '');
}

export async function GET(req: NextRequest) {
    // 1. Basic Security: Check for a secret token either via Authorization header or query param.
    // Upstash QStash or Vercel Cron usually send a Bearer token.
    const authHeader = req.headers.get('authorization');
    const secretParams = req.nextUrl.searchParams.get('secret');

    // We expect an environment variable called CRON_SECRET to be set
    const expectedSecret = process.env.CRON_SECRET;

    // If running in development without a secret, allow it for testing, else enforce secure access
    if (expectedSecret) {
        if (
            authHeader !== `Bearer ${expectedSecret}` &&
            secretParams !== expectedSecret
        ) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    } else if (process.env.NODE_ENV === 'production') {
        // Failing safe: if production and no secret is configured, deny everything
        return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
    }

    try {
        // 2. Fetch all active image URLs from the database
        const { data: products, error: dbError } = await supabaseAdmin
            .from('products')
            .select('images');

        if (dbError) throw dbError;

        // Flatten the images array and extract the raw R2 keys
        const activeKeys = new Set<string>();
        for (const product of products) {
            if (product.images && Array.isArray(product.images)) {
                for (const imgUrl of product.images) {
                    const key = extractR2Key(imgUrl);
                    if (key) activeKeys.add(key);
                }
            }
        }

        // 3. List all objects in the Cloudflare R2 bucket
        let isTruncated = true;
        let continuationToken: string | undefined = undefined;
        let totalDeleted = 0;

        // Define a "buffer" time: Don't delete files uploaded in the last 2 hours
        // This prevents deleting a file an admin JUST uploaded before they clicked "Save Product"
        const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
        const now = new Date();

        while (isTruncated) {
            const listCommand = new ListObjectsV2Command({
                Bucket: R2_BUCKET_NAME,
                ContinuationToken: continuationToken,
                Prefix: 'products/', // Assuming all uploads go into the products/ folder
            });

            const response: any = await r2Client.send(listCommand);
            const Contents = response.Contents;
            const IsTruncated = response.IsTruncated;
            const NextContinuationToken = response.NextContinuationToken;

            if (!Contents || Contents.length === 0) {
                break;
            }

            const keysToDelete: { Key: string }[] = [];

            for (const object of Contents) {
                if (!object.Key) continue;

                // Check if the object is NOT in the database
                if (!activeKeys.has(object.Key)) {
                    // Check if the object is older than the buffer time
                    if (object.LastModified) {
                        const ageMs = now.getTime() - object.LastModified.getTime();
                        if (ageMs > TWO_HOURS_MS) {
                            keysToDelete.push({ Key: object.Key });
                        }
                    } else {
                        // If no LastModified data, delete it to be safe (unlikely with R2)
                        keysToDelete.push({ Key: object.Key });
                    }
                }
            }

            // 4. Delete the orphaned objects in bulk
            if (keysToDelete.length > 0) {
                // S3 DeleteObjects allows a maximum of 1000 keys per request
                const deleteCommand = new DeleteObjectsCommand({
                    Bucket: R2_BUCKET_NAME,
                    Delete: {
                        Objects: keysToDelete,
                        Quiet: true,
                    },
                });

                await r2Client.send(deleteCommand);
                totalDeleted += keysToDelete.length;
            }

            isTruncated = IsTruncated ?? false;
            continuationToken = NextContinuationToken;
        }

        return NextResponse.json({
            success: true,
            message: `Bucket sweep complete. Deleted ${totalDeleted} orphaned images.`
        });

    } catch (error: unknown) {
        console.error('Sweep cleanup error:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: 'Cleanup failed: ' + message }, { status: 500 });
    }
}
