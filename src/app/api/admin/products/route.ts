import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

// Helper to extract the R2 key from the full public URL
function extractR2Key(url: string): string | null {
    if (!url || !url.startsWith(R2_PUBLIC_URL)) return null;
    return url.replace(`${R2_PUBLIC_URL}/`, '');
}

export async function POST(req: NextRequest) {
    const adminPass = req.headers.get('admin-password');
    if (adminPass !== process.env.ADMIN_PASS) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { categories, ...productData } = body;

        // 1. Create Product
        const { data: product, error: productError } = await supabaseAdmin
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (productError) throw productError;

        // 2. Link Categories (Join Table)
        if (categories && categories.length > 0) {
            const joinData = categories.map((catId: string) => ({
                product_id: product.id,
                category_id: catId
            }));

            const { error: joinError } = await supabaseAdmin
                .from('product_categories')
                .insert(joinData);

            if (joinError) throw joinError;
        }

        return NextResponse.json({ success: true, product });
    } catch (error: unknown) {
        console.error('Create product error:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const adminPass = req.headers.get('admin-password');
    if (adminPass !== process.env.ADMIN_PASS) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, categories, ...productData } = body;

        if (!id) throw new Error('Product ID required');
        
        // 0. Fetch existing product to compare images
        const { data: existingProduct, error: fetchError } = await supabaseAdmin
            .from('products')
            .select('images')
            .eq('id', id)
            .single();
            
        if (fetchError) throw fetchError;
        
        // Find images that were removed in the edit
        const oldImages = existingProduct?.images || [];
        const newImages = productData.images || [];
        const removedImages = oldImages.filter((img: string) => !newImages.includes(img));
        
        // Delete removed images from R2
        for (const imgUrl of removedImages) {
            const key = extractR2Key(imgUrl);
            if (key) {
                try {
                    await r2Client.send(new DeleteObjectCommand({
                        Bucket: R2_BUCKET_NAME,
                        Key: key,
                    }));
                } catch (e) {
                    console.error(`Failed to delete removed image ${key} from R2:`, e);
                }
            }
        }

        // 1. Update Product
        const { error: productError } = await supabaseAdmin
            .from('products')
            .update(productData)
            .eq('id', id);

        if (productError) throw productError;

        // 2. Update Categories (Simple approach: delete existing and re-insert)
        if (categories) {
            // Delete existing links
            const { error: deleteError } = await supabaseAdmin
                .from('product_categories')
                .delete()
                .eq('product_id', id);

            if (deleteError) throw deleteError;

            // Re-insert new links
            if (categories.length > 0) {
                const joinData = categories.map((catId: string) => ({
                    product_id: id,
                    category_id: catId
                }));

                const { error: joinError } = await supabaseAdmin
                    .from('product_categories')
                    .insert(joinData);

                if (joinError) throw joinError;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Update product error:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const adminPass = req.headers.get('admin-password');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (adminPass !== process.env.ADMIN_PASS) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    try {
        // 0. Fetch product to get images before deleting
        const { data: existingProduct, error: fetchError } = await supabaseAdmin
            .from('products')
            .select('images')
            .eq('id', id)
            .single();
            
        if (fetchError && fetchError.code !== 'PGRST116') {
             throw fetchError;
        }

        // 1. Delete associated category relationships
        const { error: linkError } = await supabaseAdmin
            .from('product_categories')
            .delete()
            .eq('product_id', id);

        if (linkError) throw linkError;

        // 2. Delete the product itself
        const { data: deletedProduct, error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!deletedProduct || deletedProduct.length === 0) {
            throw new Error("Product not found or deletion blocked by RLS policies.");
        }
        
        // 3. Delete all images from R2 associated with this product
        if (existingProduct && existingProduct.images) {
            for (const imgUrl of existingProduct.images) {
                const key = extractR2Key(imgUrl);
                if (key) {
                    try {
                        await r2Client.send(new DeleteObjectCommand({
                            Bucket: R2_BUCKET_NAME,
                            Key: key,
                        }));
                    } catch (e) {
                        console.error(`Failed to delete image ${key} from R2 during product deletion:`, e);
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Delete product error:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
