import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";
import { generateAdminNotificationEmail } from "./email-template.ts";

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
    
    // Format current date with Paris timezone (UTC+1 or UTC+2 with daylight saving)
    const now = new Date();
    // Create a date object with the Paris timezone
    const parisTime = new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris'
    }).format(now);
    
    // Get the admin URL from environment variable
    const adminUrl = Deno.env.get('ADMIN_URL') || '#';
    
    // Generate the HTML email content
    const htmlContent = generateAdminNotificationEmail(
      order_data,
      parisTime,
      adminUrl
    );
    
    // Generate plain text version for better compatibility
    const plainTextContent = `Nouvelle Commande de Change: ${order_data.order_id}
Une nouvelle commande de change de devises a été reçue avec les détails suivants :
Numéro de commande : ${order_data.order_id}
Nom, Prénom : ${order_data.first_name} ${order_data.last_name}
Email : ${order_data.email || 'Non fourni'}
Numéro de téléphone : ${order_data.phone || 'Non fourni'}
Type d'opération : ${order_data.operation_type}
Montant d'échange : ${order_data.from_amount} ${order_data.from_currency} → ${order_data.to_amount} ${order_data.to_currency}
Taux appliqué : ${order_data.taux}
Date de commande : ${parisTime}
Remarques client : ${order_data.remarques || 'Aucune remarque'}
Veuillez traiter cette commande dans les plus brefs délais.
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