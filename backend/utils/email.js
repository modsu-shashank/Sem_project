import nodemailer from 'nodemailer';
import { config } from '../config/config.js';

let transporter;
if (config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: Number(config.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });
}

export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.warn('Email transporter not configured; skipping email send.');
    return;
  }
  await transporter.sendMail({
    from: `RGO Organic Millets <${config.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

export const orderReceiptTemplate = (order) => {
  const itemsHtml = (order.items || [])
    .map(
      (it) => `
      <tr>
        <td>${it.name} (${it.selectedGrade || ''})</td>
        <td align="right">${it.quantity} ${it.unit}</td>
        <td align="right">₹${Number(it.price).toFixed(2)}</td>
        <td align="right">₹${Number(it.total).toFixed(2)}</td>
      </tr>`
    )
    .join('');
  return `
  <h2>Thanks for your order ${order.orderNumber || ''}</h2>
  <p>Status: ${order.orderStatus} • Payment: ${order.paymentStatus}</p>
  <table width="100%" cellspacing="0" cellpadding="6" border="0" style="border-collapse:collapse; border:1px solid #eee;">
    <thead>
      <tr>
        <th align="left">Item</th>
        <th align="right">Qty</th>
        <th align="right">Price</th>
        <th align="right">Total</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
    <tfoot>
      <tr><td colspan="3" align="right"><strong>Subtotal</strong></td><td align="right">₹${Number(order.subtotal || 0).toFixed(2)}</td></tr>
      <tr><td colspan="3" align="right">Tax</td><td align="right">₹${Number(order.tax || 0).toFixed(2)}</td></tr>
      <tr><td colspan="3" align="right">Shipping</td><td align="right">₹${Number(order.shippingCost || 0).toFixed(2)}</td></tr>
      <tr><td colspan="3" align="right"><strong>Total</strong></td><td align="right"><strong>₹${Number(order.total || 0).toFixed(2)}</strong></td></tr>
    </tfoot>
  </table>
  `;
};

export const sendOrderReceipt = async (user, order) => {
  if (!user?.email) return;
  await sendEmail({
    to: user.email,
    subject: `Your order ${order.orderNumber || order._id} at RGO Organic Millets`,
    html: orderReceiptTemplate(order),
  });
};

export const sendPaymentConfirmation = async (user, order) => {
  if (!user?.email) return;
  await sendEmail({
    to: user.email,
    subject: `Payment received for order ${order.orderNumber || order._id}`,
    html: `<p>We have received your payment. Order ${order.orderNumber || order._id} is confirmed.</p>` + orderReceiptTemplate(order),
  });
};
