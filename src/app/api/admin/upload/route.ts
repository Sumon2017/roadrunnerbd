import { NextRequest, NextResponse } from 'next/server';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    // 1. Check Admin Auth (Simple check based on password header for now)
    const adminPass = req.headers.get('admin-password');
    if (adminPass !== process.env.ADMIN_PASS) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 2. Storage Limit Check limits file size to stay under Vercel's 4.5MB payload limit
        const MAX_SIZE = 4 * 1024 * 1024; // 4MB
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large (max 4MB)' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExtension = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExtension}`;
        const key = `products/${fileName}`;

        // 3. Upload to R2
        await r2Client.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: file.type,
            })
        );

        const publicUrl = `${R2_PUBLIC_URL}/${key}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            key: key
        });
    } catch (error: unknown) {
        console.error('Upload error:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: 'Upload failed: ' + message }, { status: 500 });
    }
}
