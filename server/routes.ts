import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertLawyerSchema,
  insertAppointmentSchema,
  insertClientDocumentSchema,
  clientInfoSchema,
  loginSchema
} from "@shared/schema";
import { addDays, format, startOfWeek } from "date-fns";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cleanup expired documents daily
const setupDocumentCleanup = () => {
  const oneDayMs = 24 * 60 * 60 * 1000;
  setInterval(async () => {
    try {
      const deletedCount = await storage.deleteExpiredDocuments();
      if (deletedCount > 0) {
        console.log(`Deleted ${deletedCount} expired documents`);
      }
    } catch (error) {
      console.error("Error cleaning up documents:", error);
    }
  }, oneDayMs);
};

export async function registerRoutes(app: Express): Promise<Server> {
  const uploadDir = path.join(__dirname, "../uploads");
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // Start document cleanup
  setupDocumentCleanup();

  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      const lawyer = await storage.getLawyerByEmail(data.email);
      
      if (!lawyer || lawyer.password !== data.password) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }
      
      // In a real app, we'd use proper authentication with JWT
      const { password, ...lawyerWithoutPassword } = lawyer;
      return res.status(200).json(lawyerWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      return res.status(500).json({ message: "Erro no servidor" });
    }
  });

  // Lawyer routes
  app.get("/api/lawyers/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    
    const lawyer = await storage.getLawyer(id);
    if (!lawyer) {
      return res.status(404).json({ message: "Advogado não encontrado" });
    }
    
    const { password, ...lawyerWithoutPassword } = lawyer;
    res.json(lawyerWithoutPassword);
  });

  app.get("/api/lawyers/slug/:slug", async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const lawyer = await storage.getLawyerBySlug(slug);
    
    if (!lawyer) {
      return res.status(404).json({ message: "Advogado não encontrado" });
    }
    
    const { password, ...lawyerWithoutPassword } = lawyer;
    res.json(lawyerWithoutPassword);
  });

  app.post("/api/lawyers", async (req: Request, res: Response) => {
    try {
      const lawyerData = insertLawyerSchema.parse(req.body);
      const lawyer = await storage.createLawyer(lawyerData);
      
      const { password, ...lawyerWithoutPassword } = lawyer;
      res.status(201).json(lawyerWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      return res.status(500).json({ message: "Erro no servidor" });
    }
  });

  app.patch("/api/lawyers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      // Only update fields that are included in the request
      const lawyerData = req.body;
      const updatedLawyer = await storage.updateLawyer(id, lawyerData);
      
      if (!updatedLawyer) {
        return res.status(404).json({ message: "Advogado não encontrado" });
      }
      
      const { password, ...lawyerWithoutPassword } = updatedLawyer;
      res.json(lawyerWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Erro no servidor" });
    }
  });

  // Appointment routes
  app.get("/api/lawyers/:lawyerId/appointments", async (req: Request, res: Response) => {
    const lawyerId = parseInt(req.params.lawyerId);
    if (isNaN(lawyerId)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    
    const weekStartParam = req.query.weekStart as string;
    let appointments;
    
    if (weekStartParam) {
      const weekStart = new Date(weekStartParam);
      if (isNaN(weekStart.getTime())) {
        return res.status(400).json({ message: "Data de início da semana inválida" });
      }
      
      appointments = await storage.getAppointmentsByWeek(lawyerId, weekStart);
    } else {
      appointments = await storage.getAppointments(lawyerId);
    }
    
    res.json(appointments);
  });

  app.get("/api/appointments/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    
    const appointment = await storage.getAppointment(id);
    if (!appointment) {
      return res.status(404).json({ message: "Agendamento não encontrado" });
    }
    
    res.json(appointment);
  });

  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      
      // If this is a public appointment, we'd send a WhatsApp notification to the lawyer here
      if (appointment.isPublic) {
        // WhatsApp notification logic goes here
        console.log(`Notification sent for appointment ${appointment.id}`);
      }
      
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      return res.status(500).json({ message: "Erro no servidor" });
    }
  });

  app.patch("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const appointmentData = req.body;
      const updatedAppointment = await storage.updateAppointment(id, appointmentData);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Agendamento não encontrado" });
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      return res.status(500).json({ message: "Erro no servidor" });
    }
  });

  app.delete("/api/appointments/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    
    const success = await storage.deleteAppointment(id);
    if (!success) {
      return res.status(404).json({ message: "Agendamento não encontrado" });
    }
    
    res.status(204).end();
  });

  // Document Requirement routes
  app.get("/api/lawyers/:lawyerId/document-requirements", async (req: Request, res: Response) => {
    const lawyerId = parseInt(req.params.lawyerId);
    if (isNaN(lawyerId)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    
    const requirements = await storage.getDocumentRequirements(lawyerId);
    res.json(requirements);
  });

  // Schedule template routes
  app.get("/api/lawyers/:lawyerId/schedule-templates", async (req: Request, res: Response) => {
    const lawyerId = parseInt(req.params.lawyerId);
    if (isNaN(lawyerId)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    
    const templates = await storage.getScheduleTemplates(lawyerId);
    res.json(templates);
  });

  app.get("/api/schedule-templates/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    
    const template = await storage.getScheduleTemplate(id);
    if (!template) {
      return res.status(404).json({ message: "Modelo de agenda não encontrado" });
    }
    
    res.json(template);
  });

  // Weekly schedule routes
  app.get("/api/lawyers/:lawyerId/weekly-schedules", async (req: Request, res: Response) => {
    const lawyerId = parseInt(req.params.lawyerId);
    if (isNaN(lawyerId)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    
    const date = req.query.date as string;
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Data inválida" });
      }
      
      const schedule = await storage.getWeeklyScheduleByDate(lawyerId, parsedDate);
      if (!schedule) {
        return res.status(404).json({ message: "Agenda semanal não encontrada" });
      }
      
      return res.json(schedule);
    }
    
    const schedules = await storage.getWeeklySchedules(lawyerId);
    res.json(schedules);
  });

  app.post("/api/weekly-schedules", async (req: Request, res: Response) => {
    try {
      const scheduleData = req.body;
      const schedule = await storage.createWeeklySchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      return res.status(500).json({ message: "Erro no servidor" });
    }
  });

  // Client documents routes (we would handle actual file uploads with multer in a real app)
  app.get("/api/appointments/:appointmentId/documents", async (req: Request, res: Response) => {
    const appointmentId = parseInt(req.params.appointmentId);
    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    
    const documents = await storage.getClientDocuments(appointmentId);
    res.json(documents);
  });

  // Create data for demonstration
  app.post("/api/seed-demo-data", async (req: Request, res: Response) => {
    try {
      // Create a lawyer if not exists
      let lawyer = await storage.getLawyerBySlug("joao-silva");
      
      if (!lawyer) {
        lawyer = await storage.createLawyer({
          name: "João Silva",
          oabNumber: "OAB/SP 123456",
          email: "joao.silva@example.com",
          phone: "(11) 98765-4321",
          password: "senha123", // Em produção, seria hasheado
          address: "Av. Paulista, 1000, São Paulo, SP",
          description: "Advogado especialista em Direito Civil e Trabalhista",
          areasOfExpertise: ["Direito Civil", "Direito Trabalhista", "Direito de Família"],
          socialLinks: {
            facebook: "https://facebook.com/joaosilva",
            linkedin: "https://linkedin.com/in/joaosilva",
            instagram: "https://instagram.com/joaosilva"
          },
          externalLinks: {
            jusbrasil: "https://jusbrasil.com.br/advogados/joaosilva",
            website: "https://joaosilva-adv.com.br"
          },
          slug: "joao-silva"
        });
      }
      
      const lawyerId = lawyer.id;
      
      // Create a schedule template
      const template = await storage.createScheduleTemplate({
        lawyerId,
        name: "Horário Padrão",
        timeSlots: [
          // Monday slots
          { day: 1, startTime: "09:00", endTime: "10:00", isAvailable: true },
          { day: 1, startTime: "10:30", endTime: "11:30", isAvailable: true },
          { day: 1, startTime: "13:00", endTime: "14:00", isAvailable: true },
          { day: 1, startTime: "14:30", endTime: "15:30", isAvailable: true },
          // Tuesday slots
          { day: 2, startTime: "09:00", endTime: "10:00", isAvailable: true },
          { day: 2, startTime: "10:30", endTime: "11:30", isAvailable: true },
          { day: 2, startTime: "14:00", endTime: "15:00", isAvailable: false }, // private slot
          { day: 2, startTime: "15:30", endTime: "16:30", isAvailable: true },
          // Wednesday slots
          { day: 3, startTime: "09:30", endTime: "10:30", isAvailable: true },
          { day: 3, startTime: "11:00", endTime: "12:00", isAvailable: true },
          { day: 3, startTime: "14:00", endTime: "15:00", isAvailable: true },
          { day: 3, startTime: "15:30", endTime: "16:30", isAvailable: true },
          // Thursday slots
          { day: 4, startTime: "09:00", endTime: "10:00", isAvailable: true },
          { day: 4, startTime: "10:30", endTime: "11:30", isAvailable: true },
          { day: 4, startTime: "13:00", endTime: "14:00", isAvailable: true },
          { day: 4, startTime: "14:30", endTime: "15:30", isAvailable: true },
          { day: 4, startTime: "16:00", endTime: "17:00", isAvailable: false }, // private slot
          // Friday slots
          { day: 5, startTime: "09:00", endTime: "10:00", isAvailable: true },
          { day: 5, startTime: "10:30", endTime: "11:30", isAvailable: true },
          { day: 5, startTime: "14:00", endTime: "15:00", isAvailable: true },
          { day: 5, startTime: "15:30", endTime: "16:30", isAvailable: true },
        ]
      });
      
      // Create a weekly schedule
      const currentDate = new Date();
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
      
      const weeklySchedule = await storage.createWeeklySchedule({
        lawyerId,
        weekStartDate: weekStart,
        timeSlots: template.timeSlots ? template.timeSlots.map(slot => ({
          ...slot,
          date: format(addDays(weekStart, slot.day - 1), 'yyyy-MM-dd')
        })) : []
      });
      
      // Create some appointments
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      
      // Public appointments
      await storage.createAppointment({
        lawyerId,
        date: new Date(`${todayStr} 09:00:00`),
        startTime: "09:00",
        endTime: "10:00",
        isPublic: true,
        status: "scheduled",
        clientName: "Maria Oliveira",
        clientCpf: "123.456.789-00",
        clientBirthDate: new Date("1985-03-15"),
        clientEmail: "maria@example.com",
        clientPhone: "(11) 98765-4321",
        clientAddress: "Rua das Flores, 123, São Paulo, SP",
        appointmentReason: "Consulta Inicial - Direito Trabalhista"
      });
      
      await storage.createAppointment({
        lawyerId,
        date: new Date(`${todayStr} 11:30:00`),
        startTime: "11:30",
        endTime: "12:30",
        isPublic: true,
        status: "scheduled",
        clientName: "João Santos",
        clientCpf: "987.654.321-00",
        clientBirthDate: new Date("1978-07-22"),
        clientEmail: "joao@example.com",
        clientPhone: "(11) 91234-5678",
        clientAddress: "Av. Paulista, 500, Apto 502, São Paulo, SP",
        appointmentReason: "Acompanhamento - Direito Civil"
      });
      
      await storage.createAppointment({
        lawyerId,
        date: new Date(`${todayStr} 14:00:00`),
        startTime: "14:00",
        endTime: "15:00",
        isPublic: true,
        status: "scheduled",
        clientName: "Ana Pereira",
        clientCpf: "456.789.123-00",
        clientBirthDate: new Date("1990-11-08"),
        clientEmail: "ana@example.com",
        clientPhone: "(11) 94567-8912",
        clientAddress: "Rua Augusta, 300, São Paulo, SP",
        appointmentReason: "Consulta Inicial - Direito de Família"
      });
      
      // Private appointment (lawyer's personal commitment)
      await storage.createAppointment({
        lawyerId,
        date: new Date(`${todayStr} 16:30:00`),
        startTime: "16:30",
        endTime: "18:00",
        isPublic: false,
        status: "scheduled",
        title: "Audiência",
        description: "Audiência no fórum central"
      });
      
      // Document requirements
      await storage.createDocumentRequirement({
        lawyerId,
        processType: "Direito Civil",
        requiredDocuments: [
          "RG ou CPF",
          "Comprovante de Residência",
          "Documentos relacionados ao processo"
        ]
      });
      
      await storage.createDocumentRequirement({
        lawyerId,
        processType: "Direito de Família",
        requiredDocuments: [
          "RG ou CPF",
          "Comprovante de Residência",
          "Certidão de Casamento/Nascimento",
          "Documentação de bens"
        ]
      });
      
      await storage.createDocumentRequirement({
        lawyerId,
        processType: "Direito Trabalhista",
        requiredDocuments: [
          "RG ou CPF",
          "Comprovante de Residência",
          "Carteira de Trabalho",
          "Comprovantes de pagamento",
          "Contratos de trabalho"
        ]
      });
      
      res.status(200).json({
        message: "Dados de demonstração criados com sucesso",
        lawyer: lawyerId,
        template: template.id,
        weeklySchedule: weeklySchedule.id,
        appointmentsCount: 4,
        requirementsCount: 3
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao criar dados de demonstração" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
