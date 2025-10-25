"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        const smtpHost = process.env.SMTP_HOST || 'mail.sensidoc.com';
        const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
        const secure = smtpPort === 465;
        this.transporter = nodemailer_1.default.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
    async sendContactFormEmail(data) {
        try {
            const contactRecipient = process.env.CONTACT_EMAIL || 'contact@sensidoc.com';
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: contactRecipient,
                subject: `Contact Form: ${data.subject}`,
                html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message.replace(/\n/g, '<br>')}</p>
        `
            };
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            console.error('Email sending error:', error);
            throw new Error('Failed to send email');
        }
    }
    async sendAppointmentConfirmation(data) {
        try {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: data.patientEmail,
                subject: 'Appointment Confirmation - SensiDoc',
                html: `
          <h2>Appointment Confirmed</h2>
          <p>Dear ${data.patientName},</p>
          <p>Your appointment has been confirmed with the following details:</p>
          <ul>
            <li><strong>Doctor:</strong> ${data.doctorName}</li>
            <li><strong>Date:</strong> ${data.appointmentDate}</li>
            <li><strong>Time:</strong> ${data.appointmentTime}</li>
            <li><strong>Type:</strong> ${data.consultationType}</li>
          </ul>
          <p>Please be available at the scheduled time.</p>
          <p>Best regards,<br>SensiDoc Team</p>
        `
            };
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            console.error('Email sending error:', error);
        }
    }
    async sendWelcomeEmail(email, name, role) {
        try {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Welcome to SensiDoc!',
                html: `
          <h2>Welcome to SensiDoc, ${name}!</h2>
          <p>Thank you for joining our healthcare platform as a ${role}.</p>
          <p>You can now access all our features including:</p>
          <ul>
            <li>AI-powered medical diagnosis</li>
            <li>Doctor consultations</li>
            <li>Drug information and analysis</li>
            <li>Health records management</li>
          </ul>
          <p>Get started by logging into your dashboard.</p>
          <p>Best regards,<br>SensiDoc Team</p>
        `
            };
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            console.error('Welcome email error:', error);
        }
    }
}
exports.default = new EmailService();
//# sourceMappingURL=emailService.js.map