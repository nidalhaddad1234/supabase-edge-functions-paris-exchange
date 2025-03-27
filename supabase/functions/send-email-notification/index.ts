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