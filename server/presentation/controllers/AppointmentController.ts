import { Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../domain/shared/Notification';
import { CreateAppointmentUseCase } from '../../domain/usecases/appointment/CreateAppointmentUseCase';
import { AppointmentRepository } from '../../infrastructure/repositories/AppointmentRepository';
import { LawyerRepository } from '../../infrastructure/repositories/LawyerRepository';
import { storage } from '../../storage';
import { asyncHandler } from '../../infrastructure/middleware';

// Inicialização das dependências
const appointmentRepository = new AppointmentRepository(storage);
const lawyerRepository = new LawyerRepository(storage);
const createAppointmentUseCase = new CreateAppointmentUseCase(
  appointmentRepository,
  lawyerRepository
);

/**
 * Controller para ações relacionadas a agendamentos
 * Implementa padrão RESTful para operações CRUD
 */
export class AppointmentController {
  /**
   * Retorna todos os agendamentos de um advogado
   */
  static getByLawyerId = asyncHandler(async (req: Request, res: Response) => {
    const lawyerId = parseInt(req.params.lawyerId);
    
    if (isNaN(lawyerId)) {
      return res.status(400).json({ error: 'ID de advogado inválido' });
    }
    
    // Verifica se o advogado existe
    const lawyer = await lawyerRepository.findById(lawyerId);
    
    if (!lawyer) {
      return res.status(404).json({ error: 'Advogado não encontrado' });
    }
    
    // Obtém os agendamentos
    const appointments = await appointmentRepository.findByLawyerId(lawyerId);
    
    return res.status(200).json(appointments);
  });
  
  /**
   * Retorna os agendamentos de um advogado para uma semana específica
   */
  static getByWeek = asyncHandler(async (req: Request, res: Response) => {
    const lawyerId = parseInt(req.params.lawyerId);
    const weekStart = req.query.weekStart ? new Date(req.query.weekStart as string) : new Date();
    
    if (isNaN(lawyerId)) {
      return res.status(400).json({ error: 'ID de advogado inválido' });
    }
    
    if (isNaN(weekStart.getTime())) {
      return res.status(400).json({ error: 'Data de início da semana inválida' });
    }
    
    // Ajusta para o início da semana (domingo)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    // Obtém os agendamentos
    const appointments = await appointmentRepository.findByLawyerIdAndWeek(lawyerId, weekStart);
    
    return res.status(200).json(appointments);
  });
  
  /**
   * Retorna um agendamento pelo ID
   */
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const appointment = await appointmentRepository.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    return res.status(200).json(appointment);
  });
  
  /**
   * Cria um novo agendamento
   */
  static create = asyncHandler(async (req: Request, res: Response) => {
    try {
      // Esquema de validação para criação de agendamento
      const createAppointmentSchema = z.object({
        lawyerId: z.number().int().positive('ID de advogado inválido'),
        date: z.string().refine(val => !isNaN(new Date(val).getTime()), {
          message: 'Data inválida'
        }),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
        isPublic: z.boolean(),
        status: z.enum(['scheduled', 'completed', 'cancelled', 'no-show']),
        title: z.string().optional(),
        description: z.string().optional(),
        clientName: z.string().optional(),
        clientCpf: z.string().optional(),
        clientBirthDate: z.string().optional(),
        clientEmail: z.string().email('Email inválido').optional(),
        clientPhone: z.string().optional(),
        clientAddress: z.string().optional(),
        appointmentReason: z.string().optional()
      });
      
      // Validação do body da requisição
      const validatedData = createAppointmentSchema.parse(req.body);
      
      // Executa o caso de uso de criação de agendamento
      const appointment = await createAppointmentUseCase.execute({
        ...validatedData,
        date: new Date(validatedData.date),
        clientBirthDate: validatedData.clientBirthDate ? new Date(validatedData.clientBirthDate) : undefined
      });
      
      return res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          })) 
        });
      }
      
      if (error instanceof ValidationError) {
        return res.status(400).json({ errors: error.getErrors() });
      }
      
      throw error;
    }
  });
  
  /**
   * Atualiza um agendamento
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    // Verifica se o agendamento existe
    const existingAppointment = await appointmentRepository.findById(id);
    
    if (!existingAppointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    try {
      // Esquema de validação para atualização de agendamento
      const updateAppointmentSchema = z.object({
        date: z.string().refine(val => !isNaN(new Date(val).getTime()), {
          message: 'Data inválida'
        }).optional(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)').optional(),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)').optional(),
        isPublic: z.boolean().optional(),
        status: z.enum(['scheduled', 'completed', 'cancelled', 'no-show']).optional(),
        title: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        clientName: z.string().optional().nullable(),
        clientCpf: z.string().optional().nullable(),
        clientBirthDate: z.string().optional().nullable(),
        clientEmail: z.string().email('Email inválido').optional().nullable(),
        clientPhone: z.string().optional().nullable(),
        clientAddress: z.string().optional().nullable(),
        appointmentReason: z.string().optional().nullable()
      });
      
      // Validação do body da requisição
      const validatedData = updateAppointmentSchema.parse(req.body);
      
      // Prepara os dados para atualização
      const updateData: any = { ...validatedData };
      
      // Converte strings de data para objetos Date
      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }
      
      if (updateData.clientBirthDate) {
        updateData.clientBirthDate = new Date(updateData.clientBirthDate);
      }
      
      // Verifica conflitos de horário se estiver atualizando data/horário
      if ((updateData.date || updateData.startTime || updateData.endTime) && existingAppointment.status === 'scheduled') {
        const date = updateData.date || existingAppointment.date;
        const startTime = updateData.startTime || existingAppointment.startTime;
        const endTime = updateData.endTime || existingAppointment.endTime;
        
        const hasConflict = await appointmentRepository.existsAtSameTime(
          existingAppointment.lawyerId,
          date,
          startTime,
          endTime,
          id // Exclui o próprio agendamento da verificação
        );
        
        if (hasConflict) {
          return res.status(409).json({ error: 'Já existe um agendamento neste horário' });
        }
      }
      
      // Atualiza o agendamento
      const updatedAppointment = await appointmentRepository.update(id, updateData);
      
      if (!updatedAppointment) {
        return res.status(404).json({ error: 'Falha ao atualizar agendamento' });
      }
      
      return res.status(200).json(updatedAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          })) 
        });
      }
      
      if (error instanceof ValidationError) {
        return res.status(400).json({ errors: error.getErrors() });
      }
      
      throw error;
    }
  });
  
  /**
   * Remove um agendamento
   */
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    // Verifica se o agendamento existe
    const existingAppointment = await appointmentRepository.findById(id);
    
    if (!existingAppointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    // Remove o agendamento
    const deleted = await appointmentRepository.delete(id);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Falha ao remover agendamento' });
    }
    
    return res.status(204).send();
  });
}