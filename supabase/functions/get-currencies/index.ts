import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
Deno.serve(async (req)=>{
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase URL or Service Role Key');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Fetch data from YODA API
    const yodaApiUrl = Deno.env.get('YODA_API_URL');
    const yodaApiKey = Deno.env.get('YODA_API_KEY');
    if (!yodaApiUrl || !yodaApiKey) {
      throw new Error('Missing Yoda API URL or API Key');
    }
    const response = await fetch(yodaApiUrl, {
      headers: {
        'X-Api-Key': yodaApiKey,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`YODA API request failed with status ${response.status}`);
    }
    const data = await response.json();
    // Function to round to 4 decimals
    const round4 = (num)=>Number(Math.round(num + 'e4') + 'e-4');
    // Transform data for Supabase
    const currencies = data.map((currency)=>({
        iso: currency.iso,
        name: currency.name,
        web_buy_rate: round4(currency.webBuyRate),
        web_sell_rate: round4(currency.webSellRate),
        base: currency.base,
        country: currency.country,
        country_iso2: currency.countryIso2,
        smallest_cut: currency.smallestCut
      }));
    // Delete existing data (Optional, if you want to clear out data before inserting)
    const { error: deleteError } = await supabase.from('currencies').delete().neq('iso', '') // Delete all records where 'iso' is not empty
    ;
    if (deleteError) {
      throw new Error(`Failed to delete existing data: ${deleteError.message}`);
    }
    // Insert new data into the 'currencies' table
    const { data: insertedData, error: insertError } = await supabase.from('currencies').insert(currencies).select();
    if (insertError) {
      throw new Error(`Failed to insert data: ${insertError.message}`);
    }
    return new Response(JSON.stringify({
      success: true,
      message: 'Currencies updated successfully',
      count: currencies.length,
      data: insertedData
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
