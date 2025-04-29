const nodemailer = require("nodemailer");

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email using Nodemailer
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} content - Email content (can be HTML)
 * @param {string} templateName - Name of template to use
 * @returns {Promise<object>} - Send result
 */
const sendEmail = async (to, subject, content, templateName = "default") => {
  try {
    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || "notifications@coinsforcollege.org",
      to,
      subject,
      html: content, // Assuming content contains HTML
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      provider: "nodemailer",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
