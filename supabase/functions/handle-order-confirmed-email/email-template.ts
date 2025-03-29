// email-template.ts for Order Confirmation
// Updated implementation using the shared email-base.ts components

// Use a relative import path to the shared module
import { 
  COLORS, 
  createBaseEmailTemplate, 
  createHeader, 
  createFooter,
  getOperationTypeColor,
  createNoticeBox,
  createPanel,
  createSectionTitle,
  createDetailRow
} from "/shared/email-base.ts";

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

// Generate the HTML email template
export function generateOrderConfirmationEmail(
  order_data: OrderData,
  formattedExpiration: string,
  websiteUrl: string
): string {
  const operationTypeColor = getOperationTypeColor(order_data.operation_type);
  const currentYear = new Date().getFullYear();
  
  // Order details content
  const orderDetailsContent = `${createSectionTitle("Détails de votre commande")}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid ${COLORS.border}; padding-top: 15px;">
      <tbody>
        ${createDetailRow("Numéro de commande :", order_data.order_id)}
        ${createDetailRow("Type d'opération :", order_data.operation_type, operationTypeColor)}
      </tbody>
    </table>
    <!-- Exchange box -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.lightBlue}; padding: 15px; border-radius: 6px; margin: 15px 0;">
      <tr>
        <td align="center" style="font-weight: bold;">${order_data.from_amount} ${order_data.from_currency} → ${order_data.to_amount} ${order_data.to_currency}
        </td>
      </tr>
    </table>
    <!-- Exchange rate -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="color: ${COLORS.secondary}; font-size: 14px;">Taux appliqué: ${order_data.taux}</td>
      </tr>
    </table>`;
  
  // Main content of the email
  const content = `${createHeader()}
    <!-- Main content area -->
    <tr>
      <td align="left" valign="top" style="padding: 20px 40px;">
        <!-- Success banner -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.lightBlue}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle" style="background-color: ${COLORS.success}; width: 40px; height: 40px; border-radius: 50%; color: ${COLORS.white}; text-align: center; line-height: 40px; font-weight: bold; font-size: 20px;">
                    ✓
                  </td>
                  <td width="10" style="width: 10px;"></td>
                  <td align="center" valign="middle" style="color: #333366; font-size: 20px; font-weight: bold;">
                    Votre commande est confirmée !
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- Greeting -->
        <p style="margin-top: 0;">Bonjour ${order_data.first_name} ${order_data.last_name},</p>
        <p>Nous avons le plaisir de vous informer que votre commande de change de devises a été confirmée.</p>
        <!-- Important notice -->
        ${createNoticeBox("IMPORTANT", [
          `Votre commande est disponible pour récupération dès maintenant et jusqu'à <strong>${formattedExpiration}</strong> (24 heures).`,
          `Passé ce délai, votre commande devra être réservée à nouveau.`
        ])}
        <!-- Order details panel -->
        ${createPanel(orderDetailsContent)}
        <!-- Next steps panel -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.lightGreen}; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c6f6d5;">
          <tr>
            <td style="color: ${COLORS.success}; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
              Prochaine étape
            </td>
          </tr>
          <tr>
            <td style="padding-top: 10px;">
              <p style="margin: 0;">Présentez-vous à notre agence pour récupérer votre commande.</p>
            </td>
          </tr>
        </table>
        <!-- Contact info -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
          <tr>
            <td align="center" style="color: ${COLORS.primary}; font-weight: bold; margin-bottom: 5px;">
              Des questions ? Contactez-nous
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 5px;">
              <a href="${websiteUrl}/contact" style="color: #3182ce; text-decoration: underline;">Visitez notre page de contact</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${createFooter({ year: currentYear })}`;
  
  return createBaseEmailTemplate(content, { 
    title: "Commande Confirmée - Paris Exchange" 
  });
}