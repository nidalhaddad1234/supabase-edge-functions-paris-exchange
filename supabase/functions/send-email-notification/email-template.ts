// email-template.ts for Admin Notification
// Updated implementation using the shared email-base.ts components

// Use a relative import path to the shared module
import { 
  COLORS, 
  createBaseEmailTemplate, 
  createAdminHeader, 
  createAdminFooter,
  getOperationTypeColor,
  createButton,
  createPanel,
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

// Generate the HTML email template for admin notifications
export function generateAdminNotificationEmail(
  order_data: OrderData,
  parisTime: string,
  adminUrl: string
): string {
  const operationTypeColor = getOperationTypeColor(order_data.operation_type);
  const operationTypeStyle = `color: ${operationTypeColor}; font-weight: bold;`;
  const currentYear = new Date().getFullYear();
  
  // Main content of the email
  const content = `${createAdminHeader("NOUVELLE COMMANDE")}
    <!-- Main content area -->
    <tr>
      <td align="left" valign="top" style="padding: 20px 40px;">
        <!-- Page title -->
        <h1 style="color: #1e3a8a; margin-top: 15px; font-size: 22px; text-align: center; border-bottom: 1px solid #eaeaea; padding-bottom: 15px;">
          Nouvelle Commande de Change: ${order_data.order_id}
        </h1>
        <!-- Introduction -->
        <p>Une nouvelle commande de change de devises a été reçue avec les détails suivants :</p>
        <!-- Customer details panel -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.light}; padding: 20px; border-radius: 5px; margin: 15px 0; border: 1px solid ${COLORS.border};">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tbody>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-weight: bold; width: 200px; color: ${COLORS.secondary};">Numéro de commande :</td>
                          <td>${order_data.order_id}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-weight: bold; width: 200px; color: ${COLORS.secondary};">Nom, Prénom :</td>
                          <td>${order_data.first_name} ${order_data.last_name}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-weight: bold; width: 200px; color: ${COLORS.secondary};">Email :</td>
                          <td>${order_data.email || 'Non fourni'}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-weight: bold; width: 200px; color: ${COLORS.secondary};">Numéro de téléphone :</td>
                          <td>${order_data.phone || 'Non fourni'}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-weight: bold; width: 200px; color: ${COLORS.secondary};">Type d'opération :</td>
                          <td><span style="${operationTypeStyle}">${order_data.operation_type}</span></td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
        <!-- Exchange info panel -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.lightBlue}; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #bee3f8; border-left: 4px solid ${COLORS.primary};">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tbody>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-weight: bold; width: 200px; color: ${COLORS.secondary};">Montant d'échange :</td>
                          <td>${order_data.from_amount} ${order_data.from_currency} → ${order_data.to_amount} ${order_data.to_currency}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-weight: bold; width: 200px; color: ${COLORS.secondary};">Taux appliqué :</td>
                          <td>${order_data.taux}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-weight: bold; width: 200px; color: ${COLORS.secondary};">Date de commande :</td>
                          <td>${parisTime}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
        <!-- Remarks panel -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.lightRed}; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #fed7d7; border-left: 4px solid ${COLORS.danger};">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-weight: bold; width: 200px; color: ${COLORS.secondary};">Remarques client :</td>
                  <td>${order_data.remarques || 'Aucune remarque'}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p>Veuillez traiter cette commande dans les plus brefs délais.</p>
        <!-- Call to action button -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                <tr>
                  <td align="center" style="border-radius: 5px; background-color: ${COLORS.primary};">
                    <a href="${adminUrl}" target="_blank" style="border: none; border-radius: 5px; display: inline-block; font-size: 14px; font-weight: bold; color: ${COLORS.white}; padding: 12px 25px; text-decoration: none; text-transform: none;">Confirmer la commande</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${createAdminFooter({ year: currentYear })}`;
  
  return createBaseEmailTemplate(content, { 
    title: "Nouvelle Commande - Paris Exchange" 
  });
}