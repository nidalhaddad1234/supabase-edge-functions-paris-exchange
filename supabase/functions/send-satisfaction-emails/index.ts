import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateSatisfactionEmail } from "./email-template.ts";

// Get SMTP credentials from environment variables
const SMTP_HOST = Deno.env.get("SMTP_HOST") || "";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "465");
const SMTP_USER = Deno.env.get("SMTP_USER") || "";
const SMTP_PASS = Deno.env.get("SMTP_PASS") || "";
const FROM_EMAIL = SMTP_USER;
const FROM_NAME = "Paris Exchange";

// Get Supabase credentials
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Get website and tracking URLs
const WEBSITE_URL = Deno.env.get("WEBSITE_URL") || "http://localhost:3000";
const GOOGLE_REVIEW_URL = Deno.env.get("GOOGLE_REVIEW_URL") || "https://g.page/r/YOUR-GOOGLE-BUSINESS-ID/review";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper function to generate a unique tracking ID
function generateTrackingId(orderId: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${orderId}-${timestamp}-${randomStr}`;
}

// Handler for the Deno server
Deno.serve(async (req) => {
  // For handling CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    // Default parameters
    let batchSize = 50;
    let testMode = false;
    let specificOrderId: string | null = null;
    
    // Parse request parameters, if any
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.batch_size && typeof body.batch_size === "number") {
          batchSize = Math.min(body.batch_size, 100); // Limit to 100 max
        }
        if (body.test_mode === true) {
          testMode = true;
        }
        if (body.order_id && typeof body.order_id === "string") {
          specificOrderId = body.order_id;
        }
      } catch (e) {
        // If JSON parsing fails, use default parameters
        console.error("Failed to parse request body, using default parameters:", e.message);
      }
    }

    console.log(`Starting satisfaction email job with params: batchSize=${batchSize}, testMode=${testMode}, specificOrderId=${specificOrderId || "none"}`);

    // Query database for eligible orders
    let query = supabase
      .from("orders")
      .select("*")
      .eq("satisfaction_email_sent", false)
      .eq("status", "completed");
      
    // If a specific order ID is provided, only process that one
    if (specificOrderId) {
      query = query.eq("order_id", specificOrderId);
    } else {
      // Only get orders that were completed at least 24 hours ago but not more than 7 days ago
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      query = query
        .lt("created_at", oneDayAgo.toISOString())
        .gt("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false });
    }
    
    // Limit the number of orders to process in this batch
    query = query.limit(batchSize);
    
    const { data: orders, error } = await query;
    
    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }
    
    console.log(`Found ${orders?.length || 0} orders to process`);
    
    if (!orders || orders.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No orders to process",
          emails_sent: 0,
          test_mode: testMode,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Initialize SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: true,
        auth: {
          username: SMTP_USER,
          password: SMTP_PASS,
        }
      }
    });
    
    // Keep track of results
    const results = {
      success: 0,
      failed: 0,
      orders: [] as Array<{
        order_id: string;
        email: string;
        success: boolean;
        error?: string;
        tracking_id?: string;
      }>,
    };
    
    // Process each order
    for (const order of orders) {
      try {
        console.log(`Processing order ${order.order_id} for ${order.email}`);
        
        // Generate a unique tracking ID for this email
        const trackingId = generateTrackingId(order.order_id);
        
        // Generate email content
        const emailHtml = generateSatisfactionEmail(
          order,
          trackingId,
          WEBSITE_URL,
          GOOGLE_REVIEW_URL
          // Remove the SUPABASE_URL parameter
        );
        
        // Generate plain text version for better compatibility
        const plainTextContent = `Votre avis nous intéresse - Paris Exchange

Bonjour ${order.first_name},

Nous espérons que vous êtes satisfait(e) de votre récente opération de change chez Paris Exchange.

Rappel de votre commande :
Référence : ${order.order_id}
Opération : ${order.operation_type} - ${order.from_amount} ${order.from_currency} → ${order.to_amount} ${order.to_currency}

Pouvez-vous évaluer votre expérience avec nous ? Cela ne prendra qu'une seconde :

1 étoile: Déçu(e) - ${WEBSITE_URL}/feedback?rating=1&order=${order.order_id}
2 étoiles: Moyen - ${WEBSITE_URL}/feedback?rating=2&order=${order.order_id}
3 étoiles: Satisfait(e) - ${WEBSITE_URL}/feedback?rating=3&order=${order.order_id}
4 étoiles: Très bien - ${WEBSITE_URL}/feedback?rating=4&order=${order.order_id}
5 étoiles: Excellent - ${GOOGLE_REVIEW_URL}

Merci de nous aider à améliorer nos services !
`;
        
        // In test mode, don't actually send emails
        if (!testMode) {
          // Send the email
          await client.send({
            from: { name: FROM_NAME, email: FROM_EMAIL },
            to: order.email,
            subject: `Votre avis sur votre expérience Paris Exchange (${order.order_id})`,
            content: plainTextContent,
            html: emailHtml,
            contentType: "multipart/alternative",
            headers: {
              "MIME-Version": "1.0"
            }
          });
          
          // Update the database to mark the email as sent
          const { error: updateError } = await supabase
            .from("orders")
            .update({ satisfaction_email_sent: true })
            .eq("id", order.id);
            
          if (updateError) {
            throw new Error(`Failed to update database: ${updateError.message}`);
          }
          
          // Also store the tracking information in a separate table if it exists
          try {
            await supabase
              .from("email_tracking")
              .insert({
                tracking_id: trackingId,
                order_id: order.order_id,
                email_type: "satisfaction",
                recipient: order.email,
                sent_at: new Date().toISOString(),
                opens: 0,
                clicks: 0,
                rating: null,
              });
          } catch (trackingError) {
            // Don't fail if tracking table doesn't exist, just log it
            console.warn(`Could not insert tracking data: ${trackingError.message}`);
          }
        }
        
        results.success++;
        results.orders.push({
          order_id: order.order_id,
          email: order.email,
          success: true,
          tracking_id: trackingId,
        });
        
        console.log(`Successfully processed satisfaction email for order ${order.order_id}`);
      } catch (orderError) {
        console.error(`Failed to process order ${order.order_id}:`, orderError);
        
        results.failed++;
        results.orders.push({
          order_id: order.order_id,
          email: order.email,
          success: false,
          error: orderError.message,
        });
      }
    }
    
    // Close SMTP connection
    await client.close();
    
    console.log(`Job completed. Sent: ${results.success}, Failed: ${results.failed}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.success + results.failed} orders`,
        emails_sent: results.success,
        emails_failed: results.failed,
        test_mode: testMode,
        details: results.orders,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in satisfaction email job:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to process satisfaction emails",
        error: error.message,
        stack: error.stack,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
