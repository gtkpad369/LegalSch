
import { storage } from '../storage';
import { addDays, startOfWeek, format } from 'date-fns';

export async function seedDemoData() {
  try {
    // Create a lawyer if not exists
    let lawyer = await storage.getLawyerBySlug("rafael-silva");
    
    if (!lawyer) {
      lawyer = await storage.createLawyer({
        name: "Dr. Rafael Silva",
        oabNumber: "123456/SP",
        email: "rafael.silva@exemplo.com",
        phone: "(11) 99999-9999",
        password: "senha123",
        address: "Av. Paulista, 1000, São Paulo, SP",
        description: "Especialista em Direito Civil e Trabalhista",
        areasOfExpertise: ["Direito Civil", "Direito Trabalhista", "Direito de Família"],
        socialLinks: {
          facebook: "https://facebook.com/dr.rafael.silva",
          linkedin: "https://linkedin.com/in/dr.rafael.silva",
          instagram: "https://instagram.com/dr.rafael.silva"
        },
        externalLinks: {
          jusbrasil: "https://jusbrasil.com.br/advogados/dr.rafael.silva",
          website: "https://rafaelsilva.adv.br"
        },
        slug: "rafael-silva"
      });
    }

    const lawyerId = lawyer.id;

    // Create schedule template
    const template = await storage.createScheduleTemplate({
      lawyerId,
      name: "Horário Padrão",
      timeSlots: [
        { day: 1, startTime: "09:00", endTime: "10:00", isAvailable: true },
        { day: 1, startTime: "10:30", endTime: "11:30", isAvailable: true },
        { day: 1, startTime: "14:00", endTime: "15:00", isAvailable: true },
        { day: 2, startTime: "09:00", endTime: "10:00", isAvailable: true },
        { day: 2, startTime: "10:30", endTime: "11:30", isAvailable: true },
        { day: 3, startTime: "14:00", endTime: "15:00", isAvailable: true },
        { day: 3, startTime: "15:30", endTime: "16:30", isAvailable: true },
        { day: 4, startTime: "09:00", endTime: "10:00", isAvailable: true },
        { day: 4, startTime: "10:30", endTime: "11:30", isAvailable: true },
        { day: 5, startTime: "14:00", endTime: "15:00", isAvailable: true }
      ]
    });

    // Create weekly schedule
    const currentDate = new Date();
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    
    await storage.createWeeklySchedule({
      lawyerId,
      weekStartDate: weekStart,
      timeSlots: template.timeSlots.map(slot => ({
        ...slot,
        date: format(addDays(weekStart, slot.day - 1), 'yyyy-MM-dd')
      }))
    });

    // Create appointments
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // Public appointments
    await storage.createAppointment({
      lawyerId,
      date: new Date(`${todayStr}T09:00:00`),
      startTime: "09:00",
      endTime: "10:00",
      isPublic: true,
      status: "scheduled",
      clientName: "Maria Silva",
      clientCpf: "123.456.789-00",
      clientBirthDate: new Date("1990-05-15"),
      clientEmail: "maria@example.com",
      clientPhone: "(11) 98765-4321",
      clientAddress: "Rua das Flores, 123",
      appointmentReason: "Consulta Trabalhista"
    });

    await storage.createAppointment({
      lawyerId,
      date: new Date(`${todayStr}T14:00:00`),
      startTime: "14:00",
      endTime: "15:00",
      isPublic: true,
      status: "scheduled",
      clientName: "João Santos",
      clientCpf: "987.654.321-00",
      clientBirthDate: new Date("1985-08-20"),
      clientEmail: "joao@example.com",
      clientPhone: "(11) 91234-5678",
      clientAddress: "Av. Brasil, 500",
      appointmentReason: "Processo Civil"
    });

    // Private appointment
    await storage.createAppointment({
      lawyerId,
      date: new Date(`${todayStr}T16:00:00`),
      startTime: "16:00",
      endTime: "17:00",
      isPublic: false,
      status: "scheduled",
      title: "Reunião interna",
      description: "Revisão de processos"
    });

    return { success: true, message: "Dados de demonstração criados com sucesso" };
  } catch (error) {
    console.error("Erro ao criar dados de demonstração:", error);
    return { success: false, message: "Erro ao criar dados de demonstração" };
  }
}
