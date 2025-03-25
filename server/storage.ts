import { 
  lawyers, appointments, clientDocuments, documentRequirements, 
  scheduleTemplates, weeklySchedules,
  type Lawyer, type InsertLawyer,
  type Appointment, type InsertAppointment,
  type ClientDocument, type InsertClientDocument,
  type DocumentRequirement, type InsertDocumentRequirement,
  type ScheduleTemplate, type InsertScheduleTemplate,
  type WeeklySchedule, type InsertWeeklySchedule,
  type User
} from "@shared/schema";
import { addDays } from "date-fns";

// Interface for all storage operations
export interface IStorage {
  // Lawyer operations
  getLawyer(id: number): Promise<Lawyer | undefined>;
  getLawyerByEmail(email: string): Promise<Lawyer | undefined>;
  getLawyerBySlug(slug: string): Promise<Lawyer | undefined>;
  createLawyer(lawyer: InsertLawyer): Promise<Lawyer>;
  updateLawyer(id: number, lawyer: Partial<Lawyer>): Promise<Lawyer | undefined>;
  
  // Appointment operations
  getAppointments(lawyerId: number): Promise<Appointment[]>;
  getAppointmentsByWeek(lawyerId: number, weekStart: Date): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // Document operations
  getClientDocuments(appointmentId: number): Promise<ClientDocument[]>;
  createClientDocument(document: InsertClientDocument): Promise<ClientDocument>;
  deleteExpiredDocuments(): Promise<number>; // returns count of deleted documents
  
  // Document requirements operations
  getDocumentRequirements(lawyerId: number): Promise<DocumentRequirement[]>;
  createDocumentRequirement(requirement: InsertDocumentRequirement): Promise<DocumentRequirement>;
  
  // Schedule template operations
  getScheduleTemplates(lawyerId: number): Promise<ScheduleTemplate[]>;
  getScheduleTemplate(id: number): Promise<ScheduleTemplate | undefined>;
  createScheduleTemplate(template: InsertScheduleTemplate): Promise<ScheduleTemplate>;
  
  // Weekly schedule operations
  getWeeklySchedules(lawyerId: number): Promise<WeeklySchedule[]>;
  getWeeklyScheduleByDate(lawyerId: number, date: Date): Promise<WeeklySchedule | undefined>;
  createWeeklySchedule(schedule: InsertWeeklySchedule): Promise<WeeklySchedule>;
  
  // Authentication (legacy)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertLawyer): Promise<User>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private lawyers: Map<number, Lawyer>;
  private appointments: Map<number, Appointment>;
  private clientDocuments: Map<number, ClientDocument>;
  private documentRequirements: Map<number, DocumentRequirement>;
  private scheduleTemplates: Map<number, ScheduleTemplate>;
  private weeklySchedules: Map<number, WeeklySchedule>;
  
  private currentLawyerId: number;
  private currentAppointmentId: number;
  private currentDocumentId: number;
  private currentRequirementId: number;
  private currentTemplateId: number;
  private currentScheduleId: number;

  constructor() {
    this.lawyers = new Map();
    this.appointments = new Map();
    this.clientDocuments = new Map();
    this.documentRequirements = new Map();
    this.scheduleTemplates = new Map();
    this.weeklySchedules = new Map();
    
    this.currentLawyerId = 1;
    this.currentAppointmentId = 1;
    this.currentDocumentId = 1;
    this.currentRequirementId = 1;
    this.currentTemplateId = 1;
    this.currentScheduleId = 1;
    
    // Add a sample lawyer for development purposes
    this.createLawyer({
      name: "Dr. Rafael Silva",
      oabNumber: "123456",
      email: "rafael.silva@exemplo.com.br",
      phone: "(11) 99999-9999",
      password: "password123",
      address: "Av. Paulista, 1000, Cj. 101, Bela Vista, São Paulo - SP, CEP: 01310-000",
      description: "Especialista em Direito Civil, Direito de Família e Direito Trabalhista, com mais de 10 anos de experiência no mercado jurídico.",
      areasOfExpertise: ["Direito Civil", "Direito de Família", "Direito Trabalhista", "Contratos"],
      socialLinks: {
        facebook: "https://facebook.com/dr.rafael.silva",
        twitter: "https://twitter.com/dr.rafael.silva",
        linkedin: "https://linkedin.com/in/dr.rafael.silva"
      },
      externalLinks: {
        jusbrasil: "https://jusbrasil.com.br/dr.rafael.silva",
        website: "https://rafaelsilva.adv.br"
      },
      slug: "rafael-silva"
    });
  }

  // Lawyer operations
  async getLawyer(id: number): Promise<Lawyer | undefined> {
    return this.lawyers.get(id);
  }

  async getLawyerByEmail(email: string): Promise<Lawyer | undefined> {
    return Array.from(this.lawyers.values()).find(
      (lawyer) => lawyer.email === email
    );
  }

  async getLawyerBySlug(slug: string): Promise<Lawyer | undefined> {
    return Array.from(this.lawyers.values()).find(
      (lawyer) => lawyer.slug === slug
    );
  }

  async createLawyer(lawyer: InsertLawyer): Promise<Lawyer> {
    const id = this.currentLawyerId++;
    // Garantindo valores não nulos para campos opcionais
    const description = lawyer.description ?? null;
    const areasOfExpertise = lawyer.areasOfExpertise ?? [];
    
    // Tipagem explícita para estruturas sociais e links externos
    const socialLinks = lawyer.socialLinks ? {
      facebook: lawyer.socialLinks.facebook,
      twitter: lawyer.socialLinks.twitter,
      linkedin: lawyer.socialLinks.linkedin,
      instagram: lawyer.socialLinks.instagram
    } : null;
    
    const externalLinks = lawyer.externalLinks ? {
      jusbrasil: lawyer.externalLinks.jusbrasil,
      website: lawyer.externalLinks.website
    } : null;
    
    const newLawyer: Lawyer = { 
      ...lawyer, 
      id,
      description,
      areasOfExpertise,
      socialLinks,
      externalLinks
    };
    this.lawyers.set(id, newLawyer);
    return newLawyer;
  }

  async updateLawyer(id: number, lawyerData: Partial<Lawyer>): Promise<Lawyer | undefined> {
    const lawyer = this.lawyers.get(id);
    if (!lawyer) return undefined;
    
    const updatedLawyer = { ...lawyer, ...lawyerData };
    this.lawyers.set(id, updatedLawyer);
    return updatedLawyer;
  }

  // Appointment operations
  async getAppointments(lawyerId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.lawyerId === lawyerId
    );
  }

  async getAppointmentsByWeek(lawyerId: number, weekStart: Date): Promise<Appointment[]> {
    const weekEnd = addDays(weekStart, 7);
    return Array.from(this.appointments.values()).filter(
      (appointment) => 
        appointment.lawyerId === lawyerId && 
        appointment.date >= weekStart && 
        appointment.date < weekEnd
    );
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const createdAt = new Date();
    
    // Garantir valores não-nulos para campos opcionais
    const description = appointment.description ?? null;
    const title = appointment.title ?? null;
    const clientName = appointment.clientName ?? null;
    const clientCpf = appointment.clientCpf ?? null;
    const clientBirthDate = appointment.clientBirthDate ?? null;
    const clientEmail = appointment.clientEmail ?? null;
    const clientPhone = appointment.clientPhone ?? null;
    const clientAddress = appointment.clientAddress ?? null;
    const appointmentReason = appointment.appointmentReason ?? null;
    const status = appointment.status || "scheduled";
    const isPublic = appointment.isPublic ?? true;
    
    const newAppointment: Appointment = { 
      ...appointment, 
      id, 
      createdAt,
      description,
      title,
      clientName,
      clientCpf,
      clientBirthDate,
      clientEmail,
      clientPhone,
      clientAddress,
      appointmentReason,
      status,
      isPublic
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  // Document operations
  async getClientDocuments(appointmentId: number): Promise<ClientDocument[]> {
    return Array.from(this.clientDocuments.values()).filter(
      (document) => document.appointmentId === appointmentId
    );
  }

  async createClientDocument(document: InsertClientDocument): Promise<ClientDocument> {
    const id = this.currentDocumentId++;
    const uploadDate = new Date();
    const newDocument: ClientDocument = { ...document, id, uploadDate };
    this.clientDocuments.set(id, newDocument);
    return newDocument;
  }

  async deleteExpiredDocuments(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;
    
    for (const [id, document] of this.clientDocuments.entries()) {
      if (document.expirationDate < now) {
        this.clientDocuments.delete(id);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  // Document requirements operations
  async getDocumentRequirements(lawyerId: number): Promise<DocumentRequirement[]> {
    return Array.from(this.documentRequirements.values()).filter(
      (requirement) => requirement.lawyerId === lawyerId
    );
  }

  async createDocumentRequirement(requirement: InsertDocumentRequirement): Promise<DocumentRequirement> {
    const id = this.currentRequirementId++;
    // Garantir que requiredDocuments seja um array não nulo
    const requiredDocuments = requirement.requiredDocuments || [];
    const newRequirement: DocumentRequirement = { 
      ...requirement, 
      id,
      requiredDocuments
    };
    this.documentRequirements.set(id, newRequirement);
    return newRequirement;
  }

  // Schedule template operations
  async getScheduleTemplates(lawyerId: number): Promise<ScheduleTemplate[]> {
    return Array.from(this.scheduleTemplates.values()).filter(
      (template) => template.lawyerId === lawyerId
    );
  }

  async getScheduleTemplate(id: number): Promise<ScheduleTemplate | undefined> {
    return this.scheduleTemplates.get(id);
  }

  async createScheduleTemplate(template: InsertScheduleTemplate): Promise<ScheduleTemplate> {
    const id = this.currentTemplateId++;
    // Garantir que timeSlots seja um array não nulo
    const timeSlots = template.timeSlots || [];
    const newTemplate: ScheduleTemplate = { 
      ...template, 
      id,
      timeSlots 
    };
    this.scheduleTemplates.set(id, newTemplate);
    return newTemplate;
  }

  // Weekly schedule operations
  async getWeeklySchedules(lawyerId: number): Promise<WeeklySchedule[]> {
    return Array.from(this.weeklySchedules.values()).filter(
      (schedule) => schedule.lawyerId === lawyerId
    );
  }

  async getWeeklyScheduleByDate(lawyerId: number, date: Date): Promise<WeeklySchedule | undefined> {
    return Array.from(this.weeklySchedules.values()).find(
      (schedule) => 
        schedule.lawyerId === lawyerId && 
        schedule.weekStartDate <= date && 
        addDays(schedule.weekStartDate, 7) > date
    );
  }

  async createWeeklySchedule(schedule: InsertWeeklySchedule): Promise<WeeklySchedule> {
    const id = this.currentScheduleId++;
    // Garantir que timeSlots seja um array não nulo
    const timeSlots = schedule.timeSlots || [];
    const newSchedule: WeeklySchedule = { 
      ...schedule, 
      id,
      timeSlots 
    };
    this.weeklySchedules.set(id, newSchedule);
    return newSchedule;
  }

  // Authentication (legacy compatibility)
  async getUser(id: number): Promise<User | undefined> {
    return this.lawyers.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // For compatibility, use email as username
    return this.getLawyerByEmail(username);
  }

  async createUser(user: InsertLawyer): Promise<User> {
    return this.createLawyer(user);
  }
}

// Export a singleton instance
export const storage = new MemStorage();
