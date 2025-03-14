import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";

// Get SMTP credentials from environment variables
const SMTP_HOST = Deno.env.get("SMTP_HOST") || "";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "465");
const SMTP_USER = Deno.env.get("SMTP_USER") || "";
const SMTP_PASS = Deno.env.get("SMTP_PASS") || "";
const FROM_EMAIL = SMTP_USER;

Deno.serve(async (req) => {
  try {
    // Log headers for debugging
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    // Get the raw body text first for debugging
    const rawText = await req.text();
    console.log("Raw request body:", rawText);
    
    // Try to parse JSON
    let body;
    try {
      body = JSON.parse(rawText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to parse JSON: ${parseError.message}`,
          rawBody: rawText
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    console.log("Parsed payload:", body);
    
    const { to, subject, order_data } = body;
    
    if (!to || !subject || !order_data) {
      throw new Error("Missing required fields: to, subject, or order_data");
    }
    
    console.log(`Preparing to send email to: ${to}`);
    
    // Create email HTML content
    const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #333366; }
          .order-details { background-color: #f8f8f8; padding: 15px; border-radius: 5px; }
          .detail-row { margin-bottom: 10px; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>New Currency Exchange Order: ${order_data.order_id}</h1>
          <p>A new currency exchange order has been received with the following details:</p>
          <div class="order-details">
            <div class="detail-row">
              <span class="label">Numero de commande:</span> ${order_data.order_id}
            </div>
            <div class="detail-row">
              <span class="label">Nom, Prenom:</span> ${order_data.first_name} ${order_data.last_name}
            </div>
            <div class="detail-row">
              <span class="label">Email:</span> ${order_data.email}
            </div>
            <div class="detail-row">
              <span class="label">Numero de telephone:</span> ${order_data.phone}
            </div>
            <div class="detail-row">
              <span class="label">Type d'operation:</span> ${order_data.operation_type}
            </div>
            <div class="detail-row">
              <span class="label">Exchange:</span> ${order_data.from_amount} ${order_data.from_currency} ➔ ${order_data.to_amount} ${order_data.to_currency}
            </div>
            // <div class="detail-row">
            //   <span class="label">Delivery Method:</span> ${order_data.delivery_method}
            // </div>
              <div class="detail-row">
              <span class="label">Remarques:</span> ${order_data.remarques}
            </div>
            <div class="detail-row">
              <span class="label">TAUX:</span> ${order_data.taux}
            </div>
          </div>
          <p>Please process this order promptly.</p>
        </div>
      </body>
    </html>
    `;
    
    // Create a new SMTP client
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
    
    // Send the email
    await client.send({
      from: FROM_EMAIL,
      to: to,
      subject: subject,
      content: "Please view this email with an HTML-compatible client.",
      html: htmlContent,
    });
    
    // Close the client connection
    await client.close();
    
    console.log("Email sent successfully");
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email notification sent successfully",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to send email:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});