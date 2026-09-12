import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter on startup (non-blocking, just logs)
transporter.verify().then(() => {
  console.log("✉️  Email transporter ready");
}).catch((err) => {
  console.warn("⚠️  Email transporter not configured:", err.message);
});

const FROM = process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@rentiful.com";

/**
 * Notify a property manager that a new tenant application has been submitted.
 */
export const sendApplicationReceivedEmail = async (
  managerEmail: string,
  tenantName: string,
  propertyName: string
): Promise<void> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  try {
    await transporter.sendMail({
      from: `"Rentiful" <${FROM}>`,
      to: managerEmail,
      subject: `New Application for "${propertyName}"`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden;">
          <div style="background: #1d4ed8; padding: 32px 40px;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">RENT<span style="color: #f59e0b; font-weight: 300;">IFUL</span></h1>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #111827; font-size: 20px; margin-top: 0;">New Application Received</h2>
            <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
              A new rental application has been submitted for your property.
            </p>
            <div style="background: #eff6ff; border-left: 4px solid #1d4ed8; border-radius: 4px; padding: 16px 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Property:</strong> ${propertyName}</p>
              <p style="margin: 0;"><strong>Applicant:</strong> ${tenantName}</p>
            </div>
            <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
              Please log in to your dashboard to review and respond to this application.
            </p>
            <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/managers/applications"
               style="display: inline-block; background: #1d4ed8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
              Review Application
            </a>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 32px;">
              This is an automated notification from Rentiful. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error: any) {
    console.error("Failed to send application received email:", error.message);
  }
};

/**
 * Notify a tenant that their application status has been updated.
 */
export const sendApplicationStatusEmail = async (
  tenantEmail: string,
  status: string,
  propertyName: string
): Promise<void> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const isApproved = status === "Approved";
  const isDenied = status === "Denied";

  const statusColor = isApproved ? "#16a34a" : isDenied ? "#dc2626" : "#d97706";
  const statusBg = isApproved ? "#f0fdf4" : isDenied ? "#fef2f2" : "#fffbeb";
  const statusMessage = isApproved
    ? "Congratulations! Your rental application has been <strong>approved</strong>. Please log in to view your lease details."
    : isDenied
    ? "We regret to inform you that your rental application has been <strong>denied</strong>. Please contact the property manager for more information."
    : `Your application status has been updated to <strong>${status}</strong>.`;

  try {
    await transporter.sendMail({
      from: `"Rentiful" <${FROM}>`,
      to: tenantEmail,
      subject: `Application ${status} — "${propertyName}"`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden;">
          <div style="background: #1d4ed8; padding: 32px 40px;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">RENT<span style="color: #f59e0b; font-weight: 300;">IFUL</span></h1>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Application Status Update</h2>
            <div style="background: ${statusBg}; border-left: 4px solid ${statusColor}; border-radius: 4px; padding: 16px 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Property:</strong> ${propertyName}</p>
              <p style="margin: 0; color: ${statusColor};"><strong>Status: ${status}</strong></p>
            </div>
            <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">${statusMessage}</p>
            <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/tenants/applications"
               style="display: inline-block; background: #1d4ed8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
              View My Applications
            </a>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 32px;">
              This is an automated notification from Rentiful. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error: any) {
    console.error("Failed to send application status email:", error.message);
  }
};
