import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";
import { generateOrderConfirmationEmail } from "./email-template.ts";

// Get SMTP credentials from environment variables
const SMTP_HOST = Deno.env.get("SMTP_HOST") || "";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "465");
const SMTP_USER = Deno.env.get("SMTP_USER") || "";
const SMTP_PASS = Deno.env.get("SMTP_PASS") || "";
const FROM_EMAIL = SMTP_USER;
const WEBSITE_URL = Deno.env.get("WEBSITE_URL") || "http://localhost:3000";

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
    
    // Generate the HTML email content
    const htmlContent = generateOrderConfirmationEmail(
      order_data,
      formattedExpiration,
      WEBSITE_URL
    );
    
    // Generate plain text version for better compatibility
    const plainTextContent = `Commande Confirmée - Paris Exchange
Bonjour ${order_data.first_name} ${order_data.last_name},
Nous avons le plaisir de vous informer que votre commande de change de devises a été confirmée.
IMPORTANT:
Votre commande est disponible pour récupération dès maintenant et jusqu'à ${formattedExpiration} (24 heures).
Passé ce délai, votre commande devra être réservée à nouveau.
Détails de votre commande:
Numéro de commande : ${order_data.order_id}
Type d'opération : ${order_data.operation_type}
Montant d'échange : ${order_data.from_amount} ${order_data.from_currency} → ${order_data.to_amount} ${order_data.to_currency}
Taux appliqué : ${order_data.taux}
Prochaine étape:
Présentez-vous à notre agence pour récupérer votre commande.
Des questions ? Contactez-nous
${WEBSITE_URL}/contact
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
      content: plainTextContent,
      html: htmlContent,
      contentType: "multipart/alternative",
      headers: {
        "MIME-Version": "1.0"
      }
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