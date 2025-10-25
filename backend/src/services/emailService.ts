import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const smtpHost = process.env.SMTP_HOST || 'mail.sensidoc.com'
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10)
    const secure = smtpPort === 465 // SSL when using port 465

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        // Allow self-signed certs on some cPanel servers; change to true in production if certs are valid
        rejectUnauthorized: false
      }
    });
  }

  async sendContactFormEmail(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<void> {
    try {
      const contactRecipient = process.env.CONTACT_EMAIL || 'contact@sensidoc.com'
      const mailOptions = {
        from: process.env.SMTP_USER,
        // Send contact submissions to the configured contact email or default to contact@sensidoc.com
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
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendAppointmentConfirmation(data: {
    patientEmail: string;
    patientName: string;
    doctorName: string;
    appointmentDate: string;
    appointmentTime: string;
    consultationType: string;
  }): Promise<void> {
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
    } catch (error) {
      console.error('Email sending error:', error);
      // Don't throw error for email failures in appointment booking
    }
  }

  async sendWelcomeEmail(email: string, name: string, role: string): Promise<void> {
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
    } catch (error) {
      console.error('Welcome email error:', error);
      // Don't throw error for email failures
    }
  }

  async sendVerificationEmail(email: string, name: string, isVerified: boolean): Promise<void> {
    try {
      const subject = isVerified ? 'Your profile has been verified' : 'Your profile verification status changed'
      const body = isVerified
        ? `<p>Dear ${name},</p><p>Your doctor profile has been verified by the SensiDoc admin team and is now visible to patients on the platform.</p><p>Best regards,<br/>SensiDoc Team</p>`
        : `<p>Dear ${name},</p><p>Your doctor profile verification has been revoked by the SensiDoc admin team. Please contact support for more details.</p><p>Best regards,<br/>SensiDoc Team</p>`

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject,
        html: body
      }

      await this.transporter.sendMail(mailOptions)
    } catch (error) {
      console.error('Verification email error:', error)
    }
  }
}

export default new EmailService();