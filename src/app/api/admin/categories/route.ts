import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Simple middleware-like check for the admin password
const verifyAdmin = (req: NextRequest) => {
    const adminPass = req.headers.get('admin-password');
    const expectedPass = process.env.ADMIN_PASS || 'harunzaman'; // Fallback for safety
    return adminPass === expectedPass;
};

export async function POST(req: NextRequest) {
    if (!verifyAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { data, error } = await supabaseAdmin
            .from('categories')
            .insert([body])
            .select();

        if (error) throw error;
        return NextResponse.json(data[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    if (!verifyAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, ...updates } = body;

        const { data, error } = await supabaseAdmin
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return NextResponse.json(data[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    if (!verifyAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        // 1. Delete associated category relationships
        const { error: linkError } = await supabaseAdmin
            .from('product_categories')
            .delete()
            .eq('category_id', id);

        if (linkError) throw linkError;

        // 2. Delete the category itself
        const { data: deletedCategory, error } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!deletedCategory || deletedCategory.length === 0) {
            throw new Error("Category not found or deletion blocked by RLS policies.");
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('DELETE Category Error:', error);
        return NextResponse.json({ error: error?.message || 'Unknown server error' }, { status: 500 });
    }
}
