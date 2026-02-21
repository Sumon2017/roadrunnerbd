import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { r2Client, R2_BUCKET_NAME, extractR2Key } from '@/lib/r2';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

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
        // 2. Fetch all active image URLs from the database (Products)
        const { data: products, error: productsError } = await supabaseAdmin
            .from('products')
            .select('images');

        if (productsError) throw productsError;

        // Fetch category images if they have media attached
        const { data: categories, error: categoriesError } = await supabaseAdmin
            .from('categories')
            .select('image_url'); // Assume column might exist or will exist

        if (categoriesError && categoriesError.code !== '42703') { // Ignore missing column error for now
            throw categoriesError;
        }

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

        if (categories) {
            for (const category of categories) {
                if (category.image_url) {
                    const key = extractR2Key(category.image_url);
                    if (key) activeKeys.add(key);
                }
            }
        }

        // 3. List all objects in the Cloudflare R2 bucket
        let isTruncated = true;
        let continuationToken: string | undefined = undefined;
        let totalDeleted = 0;

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
                    keysToDelete.push({ Key: object.Key });
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
