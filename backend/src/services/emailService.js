// Email Service Abstraction Layer
// TODO: Integrate with Nodemailer, SendGrid, AWS SES, etc.

class EmailService {
  constructor(provider = 'nodemailer') {
    this.provider = provider;
  }

  async sendOrderReceipt(orderId, email, orderDetails) {
    // TODO: Implement email sending
    // Example structure for Nodemailer:
    /*
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Order Confirmation - ${orderId}`,
      html: this.generateOrderReceiptHTML(orderDetails)
    };

    await transporter.sendMail(mailOptions);
    */

    console.log(`[Email Service] Would send order receipt for ${orderId} to ${email}`);
    return { success: true, message: 'Email service ready for integration' };
  }

  generateOrderReceiptHTML(orderDetails) {
    const lines = Array.isArray(orderDetails.items)
      ? orderDetails.items
          .map(
            (item) =>
              `<li>${item.name || 'Product'} — type: ${item.catalog === 'mmtc' ? 'mmtc' : 'own'} — qty ${item.quantity || 1}</li>`
          )
          .join('')
      : '';
    return `
      <html>
        <body>
          <h2>Order Confirmation</h2>
          <p>Order ID: ${orderDetails.orderId}</p>
          ${lines ? `<ul>${lines}</ul>` : ''}
          <p>Total Amount: ₹${orderDetails.totalAmount}</p>
          <p>Thank you for your purchase!</p>
        </body>
      </html>
    `;
  }
}

module.exports = EmailService;
