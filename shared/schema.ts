import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Lawyer profile schema
export const lawyers = pgTable("lawyers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  oabNumber: text("oab_number").notNull().unique(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  address: text("address").notNull(),
  description: text("description"),
  areasOfExpertise: text("areas_of_expertise").array(),
  socialLinks: json("social_links").$type<{
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  }>(),
  externalLinks: json("external_links").$type<{
    jusbrasil?: string;
    website?: string;
  }>(),
  slug: text("slug").notNull().unique(),
});

export const insertLawyerSchema = createInsertSchema(lawyers).omit({
  id: true,
});

// Document Requirements
export const documentRequirements = pgTable("document_requirements", {
  id: serial("id").primaryKey(),
  lawyerId: integer("lawyer_id").notNull().references(() => lawyers.id),
  processType: text("process_type").notNull(),
  requiredDocuments: text("required_documents").array(),
});

export const insertDocumentRequirementSchema = createInsertSchema(documentRequirements).omit({
  id: true,
});

// Weekly Schedule Templates
export const scheduleTemplates = pgTable("schedule_templates", {
  id: serial("id").primaryKey(),
  lawyerId: integer("lawyer_id").notNull().references(() => lawyers.id),
  name: text("name").notNull(),
  timeSlots: json("time_slots").$type<{
    day: number; // 0-6 (Sunday-Saturday)
    startTime: string; // '09:00'
    endTime: string; // '10:00'
    isAvailable: boolean;
  }[]>(),
});

export const insertScheduleTemplateSchema = createInsertSchema(scheduleTemplates).omit({
  id: true,
});

// Weekly Schedules (generated from templates or manually)
export const weeklySchedules = pgTable("weekly_schedules", {
  id: serial("id").primaryKey(),
  lawyerId: integer("lawyer_id").notNull().references(() => lawyers.id),
  weekStartDate: timestamp("week_start_date").notNull(),
  timeSlots: json("time_slots").$type<{
    day: number; // 0-6 (Sunday-Saturday)
    date: string; // '2023-06-10'
    startTime: string; // '09:00'
    endTime: string; // '10:00'
    isAvailable: boolean;
  }[]>(),
});

export const insertWeeklyScheduleSchema = createInsertSchema(weeklySchedules).omit({
  id: true,
});

// Appointments schema (both public and private)
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  lawyerId: integer("lawyer_id").notNull().references(() => lawyers.id),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled, no-show
  // Fields for private appointments
  title: text("title"),
  description: text("description"),
  // Fields for public appointments (client information)
  clientName: text("client_name"),
  clientCpf: text("client_cpf"),
  clientBirthDate: timestamp("client_birth_date"),
  clientEmail: text("client_email"),
  clientPhone: text("client_phone"),
  clientAddress: text("client_address"),
  appointmentReason: text("appointment_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

// Client documents (uploaded files)
export const clientDocuments = pgTable("client_documents", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").notNull().references(() => appointments.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  documentType: text("document_type").notNull(), // identification, residence_proof, other
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  expirationDate: timestamp("expiration_date").notNull(), // 30 days from upload
  filePath: text("file_path").notNull(),
});

export const insertClientDocumentSchema = createInsertSchema(clientDocuments).omit({
  id: true,
  uploadDate: true,
});

// Types for TypeScript
export type Lawyer = typeof lawyers.$inferSelect;
export type InsertLawyer = z.infer<typeof insertLawyerSchema>;

export type DocumentRequirement = typeof documentRequirements.$inferSelect;
export type InsertDocumentRequirement = z.infer<typeof insertDocumentRequirementSchema>;

export type ScheduleTemplate = typeof scheduleTemplates.$inferSelect;
export type InsertScheduleTemplate = z.infer<typeof insertScheduleTemplateSchema>;

export type WeeklySchedule = typeof weeklySchedules.$inferSelect;
export type InsertWeeklySchedule = z.infer<typeof insertWeeklyScheduleSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type ClientDocument = typeof clientDocuments.$inferSelect;
export type InsertClientDocument = z.infer<typeof insertClientDocumentSchema>;

// Schemas for form validation
export const clientInfoSchema = z.object({
  clientName: z.string().min(3, "Nome completo é obrigatório"),
  clientCpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
  clientBirthDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, "Data de nascimento inválida"),
  clientEmail: z.string().email("Email inválido"),
  clientPhone: z.string().min(10, "Telefone inválido"),
  clientAddress: z.string().min(5, "Endereço é obrigatório"),
  appointmentReason: z.string().min(10, "Por favor, descreva o motivo da consulta"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type User = typeof lawyers.$inferSelect;
export type InsertUser = z.infer<typeof insertLawyerSchema>;
