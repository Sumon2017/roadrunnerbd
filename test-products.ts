import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProducts() {
    console.log('Testing connection to Supabase Products...');
    const { data: products, error } = await supabase.from('products').select('id, name, slug').limit(3);

    if (error) {
        console.error('Error fetching products:', error);
    } else {
        console.log('Sample Products:', products);

        if (products && products.length > 0) {
            const sampleSlug = products[0].slug;
            console.log(`\nTesting single product fetch for slug: ${sampleSlug}`);
            const { data: singleProduct, error: singleError } = await supabase
                .from('products')
                .select('*')
                .eq('slug', sampleSlug)
                .single();

            if (singleError) {
                console.error('Single product fetch failed:', singleError);
            } else {
                console.log('Successfully fetched single product:', singleProduct.name);
            }
        }
    }
}

testProducts();
