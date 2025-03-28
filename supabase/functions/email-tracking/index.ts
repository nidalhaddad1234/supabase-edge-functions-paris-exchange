import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get Supabase credentials
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Deno.serve(async (req) => {
  try {
    // Parse URL and query parameters
    const url = new URL(req.url);
    const id = url.searchParams.get("id"); // tracking ID
    const event = url.searchParams.get("e"); // event type: open or click
    const rating = url.searchParams.get("rating"); // rating value (if applicable)
    const redirect = url.searchParams.get("redirect"); // redirect URL (if applicable)
    const timestamp = new Date().toISOString();
    
    if (!id || !event) {
      throw new Error("Missing required parameters");
    }
    
    console.log(`Tracking event: ${event} for ID: ${id}`);
    
    // Update the tracking record in the database
    if (event === "open") {
      // First get the current value
      const { data } = await supabase
        .from("email_tracking")
        .select("opens")
        .eq("tracking_id", id)
        .single();
      
      const currentOpens = data?.opens || 0;
      
      // Then update with incremented value
      await supabase
        .from("email_tracking")
        .update({
          opens: currentOpens + 1,
          last_open_at: timestamp
        })
        .eq("tracking_id", id);
    } else if (event === "click") {
      // First get the current value
      const { data } = await supabase
        .from("email_tracking")
        .select("clicks")
        .eq("tracking_id", id)
        .single();
      
      const currentClicks = data?.clicks || 0;
      
      // Prepare update data
      const updateData: Record<string, any> = {
        clicks: currentClicks + 1,
        last_click_at: timestamp
      };
      
      // If a rating was provided, update it
      if (rating && /^[1-5]$/.test(rating)) {
        updateData.rating = parseInt(rating, 10);
      }
      
      // Update the record
      await supabase
        .from("email_tracking")
        .update(updateData)
        .eq("tracking_id", id);
    }
    
    // For open events, return a 1x1 transparent PNG
    if (event === "open") {
      // Base64 encoded 1x1 transparent PNG
      const TRANSPARENT_PIXEL = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      const binaryPixel = Uint8Array.from(atob(TRANSPARENT_PIXEL), c => c.charCodeAt(0));
      
      return new Response(binaryPixel, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }
    
    // For click events, redirect to the specified URL
    if (event === "click" && redirect) {
      return new Response(null, {
        status: 302,
        headers: {
          "Location": redirect,
        },
      });
    }
    
    // Default response if no specific handling was done
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Tracking error:", error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
