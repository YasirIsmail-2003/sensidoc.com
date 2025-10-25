declare class EmailService {
    private transporter;
    constructor();
    sendContactFormEmail(data: {
        name: string;
        email: string;
        phone?: string;
        subject: string;
        message: string;
    }): Promise<void>;
    sendAppointmentConfirmation(data: {
        patientEmail: string;
        patientName: string;
        doctorName: string;
        appointmentDate: string;
        appointmentTime: string;
        consultationType: string;
    }): Promise<void>;
    sendWelcomeEmail(email: string, name: string, role: string): Promise<void>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=emailService.d.ts.map