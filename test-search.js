const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testSearch(queryText) {
    console.log(`Testing search for: "${queryText}"`);

    // 1. Test ILIKE
    const { data: ilikeData, error: ilikeError } = await supabase
        .from('products')
        .select('name')
        .ilike('name', `%${queryText}%`);

    console.log('ILIKE Results:', ilikeError ? ilikeError : ilikeData);

    // 2. Test TextSearch (if configured)
    const { data: tsData, error: tsError } = await supabase
        .from('products')
        .select('name')
        .textSearch('name', queryText);

    console.log('TextSearch Results:', tsError ? tsError.message : tsData);

    // 3. See all products to know what we are comparing against
    if (!ilikeData || ilikeData.length === 0) {
        const { data: allData } = await supabase.from('products').select('name').limit(5);
        console.log('Sample Products in DB:', allData);
    }
}

testSearch('o');
