import { Appointment } from '../../entities/Appointment';
import { IAppointmentRepository } from '../../repositories/IAppointmentRepository';
import { ILawyerRepository } from '../../repositories/ILawyerRepository';
import { Notification, ValidationError } from '../../shared/Notification';
import { SecurityUtils } from '../../shared/SecurityUtils';

/**
 * Entrada para o caso de uso de criação de agendamento
 */
export interface CreateAppointmentInput {
  lawyerId: number;
  date: Date;
  startTime: string;
  endTime: string;
  isPublic: boolean;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  title?: string;
  description?: string;
  clientName?: string;
  clientCpf?: string;
  clientBirthDate?: Date;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  appointmentReason?: string;
}

/**
 * Caso de uso para criação de um agendamento
 * Implementa regras de negócio específicas para criação de agendamentos
 */
export class CreateAppointmentUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private lawyerRepository: ILawyerRepository
  ) {}

  /**
   * Executa o caso de uso de criação de agendamento
   * @param input Dados para criação do agendamento
   * @returns Agendamento criado
   * @throws ValidationError se houver erros de validação
   */
  async execute(input: CreateAppointmentInput): Promise<Appointment> {
    // Validação de negócio usando Notification Pattern para acumular erros
    const notification = new Notification();

    // Verifica se o advogado existe
    const lawyer = await this.lawyerRepository.findById(input.lawyerId);
    if (!lawyer) {
      notification.addError('lawyerId', 'Advogado não encontrado');
    }

    // Verifica se já existe um agendamento no mesmo horário
    const hasConflict = await this.appointmentRepository.existsAtSameTime(
      input.lawyerId,
      input.date,
      input.startTime,
      input.endTime
    );

    if (hasConflict) {
      notification.addError('timeSlot', 'Já existe um agendamento neste horário');
    }

    // Verifica se a data está no futuro para agendamentos novos
    const currentDate = new Date();
    if (input.date < currentDate && input.status === 'scheduled') {
      notification.addError('date', 'A data do agendamento deve estar no futuro');
    }

    // Falha rápido se houver erros básicos
    notification.throwIfHasErrors();

    try {
      // Sanitiza entradas para prevenir XSS (Cross-Site Scripting)
      let sanitizedTitle, sanitizedDescription, sanitizedClientName, sanitizedClientAddress, sanitizedAppointmentReason;

      if (input.title) {
        sanitizedTitle = SecurityUtils.sanitizeInput(input.title);
      }

      if (input.description) {
        sanitizedDescription = SecurityUtils.sanitizeInput(input.description);
      }

      if (input.clientName) {
        sanitizedClientName = SecurityUtils.sanitizeInput(input.clientName);
      }

      if (input.clientAddress) {
        sanitizedClientAddress = SecurityUtils.sanitizeInput(input.clientAddress);
      }

      if (input.appointmentReason) {
        sanitizedAppointmentReason = SecurityUtils.sanitizeInput(input.appointmentReason);
      }

      // Cria a entidade de agendamento usando o método factory que já valida a entidade
      const appointment = Appointment.create({
        lawyerId: input.lawyerId,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        isPublic: input.isPublic,
        status: input.status,
        title: sanitizedTitle,
        description: sanitizedDescription,
        clientName: sanitizedClientName,
        clientCpf: input.clientCpf,
        clientBirthDate: input.clientBirthDate,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        clientAddress: sanitizedClientAddress,
        appointmentReason: sanitizedAppointmentReason
      });

      // Persiste o agendamento
      return await this.appointmentRepository.save(appointment);
    } catch (error) {
      // Se for um erro de validação, repassa para cima
      if (error instanceof ValidationError) {
        throw error;
      }

      // Caso contrário, cria uma nova notificação para o erro
      const errorNotification = new Notification();
      errorNotification.addError('general', `Erro ao criar agendamento: ${error.message}`);
      throw new ValidationError(errorNotification);
    }
  }
}