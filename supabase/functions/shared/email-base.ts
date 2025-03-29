// email-base.ts
// Shared email template components and utilities for Paris Exchange emails

// Standard colors
export const COLORS = {
  primary: "#2c5282",    // Blue - Primary brand color
  secondary: "#4a5568",  // Gray - Secondary text
  success: "#38a169",    // Green - For success messages and ACHAT operations
  warning: "#f59e0b",    // Amber - For warning messages and stars
  danger: "#e53e3e",     // Red - For important notices and VENTE operations
  light: "#f8f9fa",      // Light gray - Background for panels
  dark: "#333333",       // Dark gray - Main text color
  white: "#ffffff",      // White - Background and text on dark backgrounds
  border: "#e2e8f0",     // Light gray - Borders
  lightBlue: "#ebf8ff",  // Light blue - Success banners, info boxes
  lightRed: "#fff5f5",   // Light red - Important notices
  lightGreen: "#f0fff4"  // Light green - Next steps
};

// Email-safe fonts
export const FONTS = {
  primary: "'Helvetica Neue', Arial, sans-serif",
  fallback: "Arial, sans-serif"
};

// Base email template that wraps all emails
export function createBaseEmailTemplate(content: string, options: { title: string }): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
</head>
<body style="font-family: ${FONTS.primary}; line-height: 1.6; color: ${COLORS.dark}; margin: 0; padding: 0; background-color: #f5f5f5; -webkit-font-smoothing: antialiased;">
  <!-- Email wrapper with max-width -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="min-width: 100%; background-color: #f5f5f5;">
    <tr>
      <td align="center" valign="top" style="padding: 20px 0;">
        <!-- Main email container with width control -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: ${COLORS.white}; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Common header used across emails
export function createHeader(options: { title?: string } = {}): string {
  return `<tr>
    <td align="center" valign="top" style="background-color: ${COLORS.primary}; padding: 20px; border-radius: 8px 8px 0 0; color: ${COLORS.white};">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" valign="middle" style="background-color: rgba(255,255,255,0.9); width: 60px; height: 60px; border-radius: 50%; text-align: center; color: ${COLORS.primary}; font-weight: bold; font-size: 20px;">
            PE
          </td>
          <td width="15" style="width: 15px;"></td>
          <td align="center" valign="middle" style="font-size: 24px; font-weight: bold;">
            Paris Exchange
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// Admin header with notification badge
export function createAdminHeader(badgeText: string): string {
  return `<tr>
    <td align="center" valign="top" style="background-color: ${COLORS.primary}; padding: 20px; border-radius: 8px 8px 0 0; color: ${COLORS.white};">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" valign="middle" style="background-color: rgba(255,255,255,0.9); width: 60px; height: 60px; border-radius: 50%; text-align: center; color: ${COLORS.primary}; font-weight: bold; font-size: 20px;">
            PE
          </td>
          <td width="15" style="width: 15px;"></td>
          <td align="center" valign="middle" style="font-size: 24px; font-weight: bold;">
            Paris Exchange
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td align="center" valign="top" style="padding: 20px;">
      <div style="background-color: ${COLORS.primary}; color: white; padding: 10px 20px; border-radius: 5px; font-weight: bold; display: inline-block; margin: 0 auto;">
        ${badgeText}
      </div>
    </td>
  </tr>`;
}

// Common footer used across emails
export function createFooter(options: { year?: number } = {}): string {
  const year = options.year || new Date().getFullYear();
  
  return `<tr>
    <td align="center" valign="top" style="padding: 20px; border-top: 1px solid ${COLORS.border}; color: #a0aec0; font-size: 12px;">
      <p style="margin: 5px 0;">Ceci est un message automatique, merci de ne pas y répondre directement.</p>
      <p style="margin: 5px 0;">© ${year} Paris Exchange. Tous droits réservés.</p>
    </td>
  </tr>`;
}

// Admin footer with different wording
export function createAdminFooter(options: { year?: number } = {}): string {
  const year = options.year || new Date().getFullYear();
  
  return `<tr>
    <td align="center" valign="top" style="padding: 20px; border-top: 1px solid ${COLORS.border}; color: #718096; font-size: 12px;">
      <p style="margin: 5px 0;">Ce message a été généré automatiquement par le système Paris Exchange.</p>
      <p style="margin: 5px 0;">Si vous avez des questions, veuillez contacter l'administrateur système.</p>
      <p style="margin: 5px 0;">© ${year} Paris Exchange. Tous droits réservés.</p>
    </td>
  </tr>`;
}

// Utility function to get operation type color
export function getOperationTypeColor(operationType: string): string {
  const upperType = (operationType || "").toUpperCase();
  if (upperType === "VENTE") return COLORS.danger; // Red color
  if (upperType === "ACHAT") return COLORS.success; // Green color
  return COLORS.secondary; // Default color
}

// Create a standard button
export function createButton(text: string, url: string, style: 'primary' | 'secondary' = 'primary'): string {
  const backgroundColor = style === 'primary' ? COLORS.primary : COLORS.secondary;
  
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
    <tr>
      <td align="center" style="border-radius: 5px; background-color: ${backgroundColor};">
        <a href="${url}" target="_blank" style="border: none; border-radius: 5px; display: inline-block; font-size: 14px; font-weight: bold; color: ${COLORS.white}; padding: 12px 25px; text-decoration: none; text-transform: none;">${text}</a>
      </td>
    </tr>
  </table>`;
}

// Create a section title
export function createSectionTitle(text: string, color = COLORS.primary): string {
  return `<tr>
    <td style="padding-bottom: 15px; color: ${color}; font-size: 20px; font-weight: bold;">
      ${text}
    </td>
  </tr>`;
}

// Create a detail row (for order details, etc.)
export function createDetailRow(label: string, value: string, valueColor = COLORS.secondary): string {
  return `<tr>
    <td style="padding-bottom: 15px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-weight: bold;">${label}</td>
          <td align="right" style="color: ${valueColor};">${value}</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// Create a notice box (for important messages)
export function createNoticeBox(title: string, messages: string[], color = COLORS.danger, bgColor = COLORS.lightRed): string {
  const messagesHtml = messages.map(msg => `<p style="margin: 5px 0;">${msg}</p>`).join('');
  
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${bgColor}; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #fed7d7;">
    <tr>
      <td style="border-left: 8px solid ${color}; padding-left: 10px;">
        <div style="color: ${color}; font-size: 18px; font-weight: bold; margin-bottom: 10px;">${title}</div>
        ${messagesHtml}
      </td>
    </tr>
  </table>`;
}

// Create a panel (for sections with background)
export function createPanel(content: string, bgColor = COLORS.light, borderColor = COLORS.border, radius = 8): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${bgColor}; padding: 20px; border-radius: ${radius}px; margin: 20px 0; border: 1px solid ${borderColor};">
    <tr>
      <td>
        ${content}
      </td>
    </tr>
  </table>`;
}

// Create star rating elements for satisfaction surveys
export function createStarRating(rating: number, label: string, url: string): string {
  const stars = '★'.repeat(rating);
  
  return `<td align="center" style="padding: 5px;">
    <a href="${url}" style="text-decoration: none; display: block; background-color: ${COLORS.light}; padding: 10px; border-radius: 4px; width: 80px; text-align: center;">
      <div style="color: ${COLORS.warning}; font-size: 24px; margin-bottom: 5px;">${stars}</div>
      <div style="color: ${COLORS.secondary}; font-size: 10px;">${label}</div>
    </a>
  </td>`;
}