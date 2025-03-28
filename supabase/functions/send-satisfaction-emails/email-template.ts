// CSS styles for satisfaction email template
export const emailStyles = `
body{font-family:'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#333333;margin:0;padding:0;background-color:#f5f5f5}
.email-container{max-width:600px;margin:0 auto;background-color:#ffffff;padding:0;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
.header{background-color:#2c5282;padding:20px;border-radius:8px 8px 0 0;text-align:center;color:white}
.logo-area{display:inline-block;background-color:rgba(255,255,255,0.9);width:60px;height:60px;border-radius:50%;line-height:60px;text-align:center;color:#2c5282;font-weight:bold;font-size:20px;margin-right:15px;vertical-align:middle}
.brand-name{display:inline-block;vertical-align:middle;font-size:24px;font-weight:bold}
.content{padding:20px 40px}
.title{color:#2c5282;font-size:22px;font-weight:bold;margin-bottom:20px;text-align:center}
.satisfaction{margin:25px 0;text-align:center}
.satisfaction-intro{margin-bottom:20px;font-size:16px}
.stars-container{display:flex;justify-content:center;gap:10px;margin:20px 0}
.star-rating{background-color:#f8f9fa;display:inline-block;padding:10px;border-radius:4px;color:#f59e0b;font-size:32px;text-decoration:none;width:40px;height:40px;line-height:40px;transition:transform 0.2s}
.star-rating:hover{transform:scale(1.15);background-color:#fff8e1}
.star-text{display:block;font-size:10px;margin-top:5px;color:#4a5568}
.thank-you{margin:25px 0;font-style:italic;text-align:center;color:#4a5568}
.order-summary{background-color:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0;border:1px solid #edf2f7}
.summary-title{color:#2c5282;font-size:16px;font-weight:bold;margin-bottom:10px}
.summary-detail{margin:5px 0;font-size:14px}
.footer{margin-top:20px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;color:#a0aec0;font-size:12px}
.tracking-pixel{width:1px;height:1px;display:block}
@media screen and (max-width:550px){.content{padding:15px}.stars-container{flex-wrap:wrap}}
`;

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
  // Remove the supabaseUrl parameter since we'll use websiteUrl instead
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
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Votre avis nous intéresse - Paris Exchange</title>
<style>${emailStyles}</style>
</head>
<body>
<div class="email-container">
<div class="header">
<div class="logo-area">PE</div>
<div class="brand-name">Paris Exchange</div>
</div>
<div class="content">
<div class="title">Comment s'est passée votre expérience ?</div>
<p>Bonjour ${order.first_name},</p>
<p>Nous espérons que vous êtes satisfait(e) de votre récente opération de change chez Paris Exchange.</p>
<div class="order-summary">
<div class="summary-title">Rappel de votre commande :</div>
<div class="summary-detail"><strong>Référence :</strong> ${order.order_id}</div>
<div class="summary-detail"><strong>Date :</strong> ${formattedDate}</div>
<div class="summary-detail"><strong>Opération :</strong> ${order.operation_type} - ${order.from_amount} ${order.from_currency} → ${order.to_amount} ${order.to_currency}</div>
</div>
<div class="satisfaction">
<p class="satisfaction-intro">Pouvez-vous évaluer votre expérience avec nous ? Cela ne prendra qu'une seconde :</p>
<div class="stars-container">
<a href="${starUrls[0]}" class="star-rating">★<span class="star-text">Déçu(e)</span></a>
<a href="${starUrls[1]}" class="star-rating">★★<span class="star-text">Moyen</span></a>
<a href="${starUrls[2]}" class="star-rating">★★★<span class="star-text">Satisfait(e)</span></a>
<a href="${starUrls[3]}" class="star-rating">★★★★<span class="star-text">Très bien</span></a>
<a href="${starUrls[4]}" class="star-rating">★★★★★<span class="star-text">Excellent</span></a>
</div>
</div>
<p class="thank-you">Merci de nous aider à améliorer nos services !</p>
<div class="footer">
<p>© ${currentYear} Paris Exchange. Tous droits réservés.</p>
<p>Ceci est un message automatique, merci de ne pas y répondre directement.</p>
</div>
</div>
</div>
<img src="${trackingPixelUrl}" alt="" class="tracking-pixel" />
</body>
</html>`;
}