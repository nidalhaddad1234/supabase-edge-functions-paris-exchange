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
    
    console.log(`Preparing to send confirmation email to client: ${to}`);
    
    // Get the current date and time
    const now = new Date();
    // Calculate 24 hours from now for pickup expiration
    const pickupExpiration = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const formattedExpiration = pickupExpiration.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Create email HTML content for client confirmation
    const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #333366; }
          .notice { background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .important { color: #c0392b; font-weight: bold; }
          .order-details { background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .detail-row { margin-bottom: 10px; }
          .label { font-weight: bold; }
          .footer { margin-top: 30px; font-size: 0.9em; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Votre commande est confirmée !</h1>
          <p>Bonjour ${order_data.first_name} ${order_data.last_name},</p>
          <p>Nous avons le plaisir de vous informer que votre commande de change de devises a été confirmée.</p>
          
          <div class="notice">
            <p><span class="important">IMPORTANT :</span> Votre commande est disponible pour récupération dès maintenant et jusqu'à <strong>${formattedExpiration}</strong> (24 heures).</p>
            <p>Passé ce délai, votre commande devra être réservée à nouveau.</p>
          </div>
          
          <h2>Détails de votre commande :</h2>
          <div class="order-details">
            <div class="detail-row">
              <span class="label">Numéro de commande :</span> ${order_data.order_id}
            </div>
            <div class="detail-row">
              <span class="label">Type d'opération :</span> ${order_data.operation_type}
            </div>
            <div class="detail-row">
              <span class="label">Devise d'échange :</span> ${order_data.from_amount} ${order_data.from_currency} ➔ ${order_data.to_amount} ${order_data.to_currency}
            </div>
            <div class="detail-row">
              <span class="label">Taux appliqué :</span> ${order_data.taux}
            </div>
          </div>
          
          <p>Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.</p>
          
          <p>Nous vous remercions pour votre confiance.</p>
          
          <div class="footer">
            <p>Ceci est un message automatique, merci de ne pas y répondre directement.</p>
          </div>
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
      content: "Veuillez consulter cet email avec un client compatible HTML.",
      html: htmlContent,
    });
    
    // Close the client connection
    await client.close();
    
    console.log("Confirmation email sent successfully to client");
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Order confirmation email sent successfully to client",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    
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