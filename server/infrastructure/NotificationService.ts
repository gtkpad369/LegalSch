
import { Twilio } from 'twilio';
import { Appointment } from '@shared/schema';

export class NotificationService {
  private static client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  static async sendWhatsAppNotification(appointment: Appointment, lawyerPhone: string) {
    if (!appointment.isPublic) return;

    const message = `Novo agendamento!\n
Data: ${appointment.date}\n
Cliente: ${appointment.clientName}\n
Motivo: ${appointment.appointmentReason}\n
Link: ${process.env.APP_URL}/appointments/${appointment.id}`;

    try {
      await this.client.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${lawyerPhone}`
      });
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
    }
  }
}
