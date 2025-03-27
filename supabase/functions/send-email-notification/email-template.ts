// CSS styles for email template
export const emailStyles = `
body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
}
.email-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    padding: 30px;
    border: 2px solid #3182ce;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.header {
    padding-bottom: 20px;
    border-bottom: 1px solid #eaeaea;
    text-align: center;
}
.header-badge {
    background-color: #2c5282;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-weight: bold;
    display: inline-block;
    margin: 0 auto;
}
h1 {
    color: #1e3a8a;
    margin-top: 25px;
    font-size: 22px;
    text-align: center;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 15px;
}
.order-details {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 5px;
    margin: 15px 0;
    border: 1px solid #edf2f7;
}
.detail-row {
    display: flex;
    margin-bottom: 12px;
    flex-wrap: wrap;
}
.label {
    font-weight: bold;
    width: 200px;
    color: #4a5568;
}
.value {
    flex: 1;
}
.exchange-info {
    background-color: #ebf8ff;
    padding: 15px;
    border-radius: 5px;
    margin: 15px 0;
    border: 1px solid #bee3f8;
    border-left: 4px solid #3182ce;
}
.action-links {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 25px;
    gap: 15px;
}
.action-link {
    display: inline-block;
    color: #fff;
    background-color: #3182ce;
    font-weight: bold;
    text-decoration: none;
    font-size: 14px;
    padding: 10px 20px;
    border-radius: 5px;
    text-align: center;
    width: 220px;
}
.action-link.secondary {
    background-color: #718096;
    color: #fff;
}
.remarks {
    background-color: #fff5f5;
    padding: 15px;
    border-radius: 5px;
    margin: 15px 0;
    border: 1px solid #fed7d7;
    border-left: 4px solid #e53e3e;
}
.footer {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eaeaea;
    font-size: 0.9em;
    color: #718096;
    text-align: center;
}
.operation-vente {
    color: #e53e3e;
    font-weight: bold;
}
.operation-achat {
    color: #38a169;
    font-weight: bold;
}
@media screen and (max-width: 550px) {
    .email-container {
        padding: 15px;
    }
    .detail-row {
        flex-direction: column;
    }
    .label {
        width: 100%;
        margin-bottom: 5px;
    }
    .action-link {
        width: 80%;
    }
}
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
export function getOperationTypeStyle(operationType: string): string {
  const upperType = (operationType || "").toUpperCase();
  if (upperType === "VENTE") {
    return "color: #e53e3e; font-weight: bold;"; // Red color
  } else if (upperType === "ACHAT") {
    return "color: #38a169; font-weight: bold;"; // Green color
  }
  return "";
}

// Generate the HTML email template for admin notifications
export function generateAdminNotificationEmail(
  order_data: OrderData,
  parisTime: string,
  adminUrl: string
): string {
  const operationTypeStyle = getOperationTypeStyle(order_data.operation_type);
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nouvelle Commande - Paris Exchange</title>
<style>${emailStyles}</style>
</head>
<body>
<div class="email-container">
<div class="header">
<div class="header-badge">NOUVELLE COMMANDE</div>
</div>
<h1>Nouvelle Commande de Change: ${order_data.order_id}</h1>
<p>Une nouvelle commande de change de devises a été reçue avec les détails suivants :</p>
<div class="order-details">
<div class="detail-row">
<span class="label">Numéro de commande :</span>
<span class="value">${order_data.order_id}</span>
</div>
<div class="detail-row">
<span class="label">Nom, Prénom :</span>
<span class="value">${order_data.first_name} ${order_data.last_name}</span>
</div>
<div class="detail-row">
<span class="label">Email :</span>
<span class="value">${order_data.email}</span>
</div>
<div class="detail-row">
<span class="label">Numéro de téléphone :</span>
<span class="value">${order_data.phone}</span>
</div>
<div class="detail-row">
<span class="label">Type d'opération :</span>
<span class="value"><span style="${operationTypeStyle}">${order_data.operation_type}</span></span>
</div>
</div>
<div class="exchange-info">
<div class="detail-row">
<span class="label">Montant d'échange :</span>
<span class="value">${order_data.from_amount} ${order_data.from_currency} → ${order_data.to_amount} ${order_data.to_currency}</span>
</div>
<div class="detail-row">
<span class="label">Taux appliqué :</span>
<span class="value">${order_data.taux}</span>
</div>
<div class="detail-row">
<span class="label">Date de commande :</span>
<span class="value">${parisTime}</span>
</div>
</div>
<div class="remarks">
<div class="detail-row">
<span class="label">Remarques client :</span>
<span class="value">${order_data.remarques || 'Aucune remarque'}</span>
</div>
</div>
<p>Veuillez traiter cette commande dans les plus brefs délais.</p>
<div class="action-links">
<a href="${adminUrl}" class="action-link">Confirmer la commande</a>
</div>
<div class="footer">
<p>Ce message a été généré automatiquement par le système Paris Exchange.</p>
<p>Si vous avez des questions, veuillez contacter l'administrateur système.</p>
</div>
</div>
</body>
</html>`;
}
