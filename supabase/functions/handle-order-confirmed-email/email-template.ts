// CSS styles for email template
export const emailStyles = `
body{font-family:'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#333333;margin:0;padding:0;background-color:#f5f5f5}
.email-container{max-width:600px;margin:0 auto;background-color:#ffffff;padding:0;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
.header{background-color:#2c5282;padding:20px;border-radius:8px 8px 0 0;text-align:center;color:white}
.logo-area{display:inline-block;background-color:rgba(255,255,255,0.9);width:60px;height:60px;border-radius:50%;line-height:60px;text-align:center;color:#2c5282;font-weight:bold;font-size:20px;margin-right:15px;vertical-align:middle}
.brand-name{display:inline-block;vertical-align:middle;font-size:24px;font-weight:bold}
.content{padding:20px 40px}
.success-banner{background-color:#ebf8ff;padding:15px;margin-bottom:20px;border-radius:8px;text-align:center;position:relative}
.check-circle{display:inline-block;width:40px;height:40px;background-color:#38a169;border-radius:50%;color:white;text-align:center;line-height:40px;font-weight:bold;font-size:20px;margin-right:10px;vertical-align:middle}
.success-title{display:inline-block;color:#333366;font-size:20px;font-weight:bold;vertical-align:middle}
.notice{background-color:#fff5f5;padding:20px;margin:20px 0;border-radius:8px;border:2px solid #fed7d7;position:relative}
.notice::before{content:"";position:absolute;left:0;top:0;bottom:0;width:8px;background-color:#e53e3e;border-radius:4px 0 0 4px}
.important{color:#e53e3e;font-size:18px;font-weight:bold;margin-bottom:10px;margin-left:10px}
.notice-text{margin-left:10px}
.order-details{background-color:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;border:1px solid #edf2f7}
.details-title{color:#2c5282;font-size:20px;font-weight:bold;margin-bottom:15px}
.details-divider{height:1px;background-color:#e2e8f0;margin:15px 0}
.detail-row{display:flex;justify-content:space-between;margin-bottom:15px}
.detail-label{font-weight:bold}
.detail-value{color:#4a5568;text-align:right}
.exchange-box{background-color:#ebf8ff;padding:15px;border-radius:6px;text-align:center;margin:15px 0}
.exchange-text{font-weight:bold}
.exchange-rate{text-align:center;color:#4a5568;font-size:14px;margin-top:10px}
.next-steps{background-color:#f0fff4;padding:20px;border-radius:8px;margin:20px 0;border:1px solid #c6f6d5}
.next-steps-title{color:#38a169;font-size:18px;font-weight:bold;margin-bottom:10px}
.contact-info{text-align:center;margin:25px 0}
.contact-title{color:#2c5282;font-weight:bold;margin-bottom:5px}
.contact-details{color:#4a5568}
.contact-link{color:#3182ce;text-decoration:underline}
.footer{margin-top:20px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;color:#a0aec0;font-size:12px}
@media screen and (max-width:550px){.content{padding:15px}.detail-row{flex-direction:column}.detail-value{text-align:left;margin-top:5px}}
`;

// Interface for the order data
export interface OrderData {
  order_id: string;
  first_name: string;
  last_name: string;
  operation_type: string;
  from_amount: string | number;
  from_currency: string;
  to_amount: string | number;
  to_currency: string;
  taux: string | number;
  email?: string;
  phone?: string;
  remarques?: string;
}

// Helper function to get operation type color
export function getOperationTypeColor(operationType: string): string {
  const upperType = (operationType || "").toUpperCase();
  if (upperType === "VENTE") return "#e53e3e"; // Red color
  if (upperType === "ACHAT") return "#38a169"; // Green color
  return "#4a5568"; // Default color
}

// Generate the HTML email template
export function generateOrderConfirmationEmail(
  order_data: OrderData,
  formattedExpiration: string,
  websiteUrl: string
): string {
  const operationTypeColor = getOperationTypeColor(order_data.operation_type);
  const currentYear = new Date().getFullYear();
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Commande Confirmée - Paris Exchange</title>
<style>${emailStyles}</style>
</head>
<body>
<div class="email-container">
<div class="header">
<div class="logo-area">PE</div>
<div class="brand-name">Paris Exchange</div>
</div>
<div class="content">
<div class="success-banner">
<div class="check-circle">✓</div>
<div class="success-title">Votre commande est confirmée !</div>
</div>
<p>Bonjour ${order_data.first_name} ${order_data.last_name},</p>
<p>Nous avons le plaisir de vous informer que votre commande de change de devises a été confirmée.</p>
<div class="notice">
<div class="important">IMPORTANT</div>
<div class="notice-text">
<p>Votre commande est disponible pour récupération dès maintenant et jusqu'à <strong>${formattedExpiration}</strong> (24 heures).</p>
<p>Passé ce délai, votre commande devra être réservée à nouveau.</p>
</div>
</div>
<div class="order-details">
<div class="details-title">Détails de votre commande</div>
<div class="details-divider"></div>
<div class="detail-row">
<div class="detail-label">Numéro de commande :</div>
<div class="detail-value">${order_data.order_id}</div>
</div>
<div class="detail-row">
<div class="detail-label">Type d'opération :</div>
<div class="detail-value" style="color:${operationTypeColor};font-weight:bold">${order_data.operation_type}</div>
</div>
<div class="exchange-box">
<div class="exchange-text">${order_data.from_amount} ${order_data.from_currency} → ${order_data.to_amount} ${order_data.to_currency}</div>
</div>
<div class="exchange-rate">Taux appliqué: ${order_data.taux}</div>
</div>
<div class="next-steps">
<div class="next-steps-title">Prochaine étape</div>
<p>Présentez-vous à notre agence pour récupérer votre commande.</p>
</div>
<div class="contact-info">
<div class="contact-title">Des questions ? Contactez-nous</div>
<div class="contact-details">
<a href="${websiteUrl}/contact" class="contact-link">Visitez notre page de contact</a>
</div>
</div>
<div class="footer">
<p>Ceci est un message automatique, merci de ne pas y répondre directement.</p>
<p>© ${currentYear} Paris Exchange. Tous droits réservés.</p>
</div>
</div>
</div>
</body>
</html>`;
}