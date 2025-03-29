// email-template.ts for Satisfaction Survey
// Updated implementation using the shared email-base.ts components

// Use an absolute import path to the shared module
import { 
  COLORS, 
  createBaseEmailTemplate, 
  createHeader, 
  createFooter,
  createPanel,
  createStarRating
} from "/shared/email-base.ts";

// Interface for the order data
export interface OrderData {
  id: string;
  order_id: string;
  first_name: string;
  last_name: string;
  email: string;
  operation_type: string;
  from_amount: number;
  from_currency: string;
  to_amount: number;
  to_currency: string;
  created_at: string;
}

// Generate the HTML email template for satisfaction surveys
export function generateSatisfactionEmail(
  order: OrderData,
  trackingId: string,
  websiteUrl: string,
  googleReviewUrl: string,
): string {
  const currentYear = new Date().getFullYear();
  
  // Format the order date in a friendly format
  const orderDate = new Date(order.created_at);
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(orderDate);
  
  // Use your domain for tracking URLs
  const trackingPixelUrl = `${websiteUrl}/api/email/track?id=${trackingId}&e=open&t=${Date.now()}`;
  
  // Generate star rating URLs with tracking parameters
  const starUrls = [];
  for (let i = 1; i <= 5; i++) {
    // For the 5-star rating, direct to Google review page
    const targetUrl = (i === 5) 
      ? googleReviewUrl 
      : `${websiteUrl}/feedback?rating=${i}&order=${order.order_id}&tid=${trackingId}`;
    
    // Add tracking parameters using your domain
    const trackingUrl = `${websiteUrl}/api/email/track?id=${trackingId}&e=click&rating=${i}&redirect=${encodeURIComponent(targetUrl)}`;
    starUrls.push(trackingUrl);
  }
  
  // Order summary content for the panel
  const orderSummaryContent = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="font-size: 16px; font-weight: bold; color: ${COLORS.primary}; padding-bottom: 10px;">
          Rappel de votre commande :
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 5px;">
          <span style="font-weight: bold;">Référence :</span> ${order.order_id}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 5px;">
          <span style="font-weight: bold;">Date :</span> ${formattedDate}
        </td>
      </tr>
      <tr>
        <td>
          <span style="font-weight: bold;">Opération :</span> ${order.operation_type} - ${order.from_amount} ${order.from_currency} → ${order.to_amount} ${order.to_currency}
        </td>
      </tr>
    </table>
  `;
  
  // Main content of the email
  const content = `
    ${createHeader()}
    
    <!-- Main content area -->
    <tr>
      <td align="left" valign="top" style="padding: 20px 40px;">
        <!-- Title -->
        <div style="color: ${COLORS.primary}; font-size: 22px; font-weight: bold; margin-bottom: 20px; text-align: center;">
          Comment s'est passée votre expérience ?
        </div>
        
        <!-- Greeting -->
        <p>Bonjour ${order.first_name},</p>
        <p>Nous espérons que vous êtes satisfait(e) de votre récente opération de change chez Paris Exchange.</p>
        
        <!-- Order summary panel -->
        ${createPanel(orderSummaryContent)}
        
        <!-- Satisfaction survey introduction -->
        <p style="font-weight: bold;">
          Pouvez-vous évaluer votre expérience avec nous ? Cela ne prendra qu'une seconde :
        </p>
        
        <!-- Star ratings -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
          <tr>
            ${createStarRating(1, "Déçu(e)", starUrls[0])}
            ${createStarRating(2, "Moyen", starUrls[1])}
            ${createStarRating(3, "Satisfait(e)", starUrls[2])}
            ${createStarRating(4, "Très bien", starUrls[3])}
            ${createStarRating(5, "Excellent", starUrls[4])}
          </tr>
        </table>
        
        <!-- Thank you note -->
        <p style="font-style: italic; text-align: center; color: ${COLORS.secondary}; margin: 25px 0;">
          Merci de nous aider à améliorer nos services !
        </p>
      </td>
    </tr>
    
    ${createFooter({ year: currentYear })}
    
    <!-- Tracking pixel (invisible) -->
    <img src="${trackingPixelUrl}" alt="" style="width: 1px; height: 1px; display: block;" />
  `;
  
  return createBaseEmailTemplate(content, { 
    title: "Votre avis nous intéresse - Paris Exchange" 
  });
}