// Vendora branded HTML email templates (Brevo SMTP)

const layout = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0"
            style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <tr>
              <td style="background-color:#1e293b;padding:24px 32px;text-align:center;">
                <span style="color:#ffffff;font-size:26px;font-weight:700;letter-spacing:1px;">Vend<span style="color:#3b82f6;">ora</span></span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;">${title}</h2>
                <div style="color:#475569;font-size:15px;line-height:1.6;">${bodyHtml}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;text-align:center;">
                &copy; ${new Date().getFullYear()} Vendora — The Multi-Vendor Marketplace.<br/>
                This is an automated message, please do not reply directly.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const button = (url, label) =>
  `<a href="${url}" style="display:inline-block;margin:16px 0;padding:12px 28px;background-color:#3b82f6;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${label}</a>`;

const templates = {
  userActivation: ({ name, activationUrl }) =>
    layout(
      "Activate your account",
      `<p>Hi <strong>${name}</strong>,</p>
       <p>Welcome to Vendora! Please confirm your email address to activate your buyer account.</p>
       ${button(activationUrl, "Activate Account")}
       <p>This link expires in <strong>5 minutes</strong>. If you didn't create this account, you can safely ignore this email.</p>`
    ),

  shopActivation: ({ name, activationUrl }) =>
    layout(
      "Activate your seller shop",
      `<p>Hi <strong>${name}</strong>,</p>
       <p>Your Vendora seller shop has been created. Confirm your email address to activate it and start selling.</p>
       ${button(activationUrl, "Activate Shop")}
       <p>This link expires in <strong>5 minutes</strong>. If you didn't request this, please ignore this email.</p>`
    ),

  orderConfirmation: ({ user, orderId, items, totalPrice }) => {
    const rows = items
      .map(
        (i) =>
          `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">${i.name} &times; ${i.qty}</td>
           <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">$${(i.price * i.qty).toFixed(2)}</td></tr>`
      )
      .join("");
    return layout(
      "Order confirmed",
      `<p>Hi <strong>${user?.name || "Customer"}</strong>,</p>
       <p>Thank you for your order! Your order <strong>#${orderId}</strong> has been placed successfully.</p>
       <table role="presentation" width="100%" style="font-size:14px;color:#334155;">${rows}
       <tr><td style="padding:10px 0;font-weight:700;">Total</td><td style="padding:10px 0;text-align:right;font-weight:700;">$${Number(totalPrice).toFixed(2)}</td></tr></table>
       <p>You can track your order status anytime from your Vendora account.</p>`
    );
  },

  sellerNewOrder: ({ shopName, items, totalPrice }) => {
    const rows = items
      .map(
        (i) =>
          `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">${i.name} &times; ${i.qty}</td>
           <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">$${(i.price * i.qty).toFixed(2)}</td></tr>`
      )
      .join("");
    return layout(
      "New order received",
      `<p>Hi <strong>${shopName}</strong>,</p>
       <p>Great news — you have a new order on Vendora! Log in to your seller dashboard to process it.</p>
       <table role="presentation" width="100%" style="font-size:14px;color:#334155;">${rows}
       <tr><td style="padding:10px 0;font-weight:700;">Order total</td><td style="padding:10px 0;text-align:right;font-weight:700;">$${Number(totalPrice).toFixed(2)}</td></tr></table>`
    );
  },

  withdrawRequest: ({ name, amount }) =>
    layout(
      "Withdrawal request received",
      `<p>Hi <strong>${name}</strong>,</p>
       <p>Your withdrawal request of <strong>$${amount}</strong> is being processed. It usually takes <strong>3–7 days</strong> to complete.</p>`
    ),

  withdrawSuccess: ({ name, amount }) =>
    layout(
      "Withdrawal approved",
      `<p>Hi <strong>${name}</strong>,</p>
       <p>Your withdrawal of <strong>$${amount}</strong> has been approved and is on its way. Delivery time depends on your bank's rules (usually 3–7 days).</p>`
    ),

  adminWithdrawNotification: ({ shopName, amount, withdrawId }) =>
    layout(
      "New withdrawal request",
      `<p>A seller has requested a withdrawal.</p>
       <p><strong>Shop:</strong> ${shopName}<br/>
       <strong>Amount:</strong> $${amount}<br/>
       <strong>Request ID:</strong> ${withdrawId}</p>
       <p>Review it in the Vendora admin dashboard.</p>`
    ),
};

module.exports = templates;