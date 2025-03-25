import { Notification } from '../shared/Notification';
import { Contract } from '../shared/Contract';

/**
 * Appointment Entity - Core domain entity
 * Representa a entidade de agendamento no sistema
 * Implementa regras de negócio específicas para agendamentos
 * 
 * Utiliza Notification Pattern, Design by Contracts e Fail Fast Validation
 */
export class Appointment {
  id?: number;
  lawyerId: number;
  date: Date;
  startTime: string;
  endTime: string;
  isPublic: boolean;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  
  // Campos para agendamentos privados
  title?: string;
  description?: string;
  
  // Campos para agendamentos públicos (informações do cliente)
  clientName?: string;
  clientCpf?: string;
  clientBirthDate?: Date;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  appointmentReason?: string;
  
  createdAt: Date;

  /**
   * Cria uma nova instância de Appointment com validações de contrato (Design by Contract)
   */
  constructor(params: {
    id?: number;
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
    createdAt?: Date;
  }) {
    // Fail Fast Validation para parâmetros críticos (falha imediatamente se inválidos)
    Contract.require(params.lawyerId > 0, 'ID do advogado deve ser maior que zero', 'lawyerId');
    Contract.notNull(params.date, () => 'Data é obrigatória', 'date');
    Contract.notNullOrEmpty(params.startTime, () => 'Horário de início é obrigatório', 'startTime');
    Contract.notNullOrEmpty(params.endTime, () => 'Horário de término é obrigatório', 'endTime');

    this.id = params.id;
    this.lawyerId = params.lawyerId;
    this.date = params.date;
    this.startTime = params.startTime;
    this.endTime = params.endTime;
    this.isPublic = params.isPublic;
    this.status = params.status;
    this.title = params.title;
    this.description = params.description;
    this.clientName = params.clientName;
    this.clientCpf = params.clientCpf;
    this.clientBirthDate = params.clientBirthDate;
    this.clientEmail = params.clientEmail;
    this.clientPhone = params.clientPhone;
    this.clientAddress = params.clientAddress;
    this.appointmentReason = params.appointmentReason;
    this.createdAt = params.createdAt || new Date();

    // Validar invariantes (consistência interna)
    this.validateInvariants();

    // Validações de negócio específicas para cada tipo de agendamento
    if (this.isPublic) {
      this.validatePublicAppointment();
    }
  }

  /**
   * Validação de invariantes - garantias que a entidade precisa manter para estar em estado consistente
   * Implementa Fail Fast Validation - falha imediatamente quando um invariante é violado
   */
  private validateInvariants(): void {
    // Invariante: Horário de início deve ser antes do horário de término
    Contract.invariant(this.validateTimeSlot(), 'Horário de início deve ser antes do horário de término', 'timeSlot');
  }

  /**
   * Validações específicas para agendamentos públicos (com clientes)
   */
  private validatePublicAppointment(): void {
    // Nestes casos, queremos acumular todos os erros (Notification Pattern)
    // mas falhar rapidamente se for um agendamento público sem dados do cliente
    const notification = new Notification();

    if (!this.clientName) {
      notification.addError('clientName', 'Nome do cliente é obrigatório para agendamentos públicos');
    }

    if (!this.clientCpf) {
      notification.addError('clientCpf', 'CPF do cliente é obrigatório para agendamentos públicos');
    }

    if (!this.clientEmail) {
      notification.addError('clientEmail', 'Email do cliente é obrigatório para agendamentos públicos');
    }

    if (!this.clientPhone) {
      notification.addError('clientPhone', 'Telefone do cliente é obrigatório para agendamentos públicos');
    }

    if (!this.appointmentReason) {
      notification.addError('appointmentReason', 'Motivo do agendamento é obrigatório para agendamentos públicos');
    }

    // Falha rápido se houver erros de validação
    notification.throwIfHasErrors();
  }

  /**
   * Método de validação de horário - regra de negócio específica
   */
  validateTimeSlot(): boolean {
    // Verifica se o horário de início é antes do horário de término
    const startTime = this.parseTime(this.startTime);
    const endTime = this.parseTime(this.endTime);
    
    if (!startTime || !endTime) return false;
    
    return startTime < endTime;
  }

  /**
   * Método auxiliar para converter string de horário para minutos desde meia-noite
   */
  private parseTime(timeStr: string): number | null {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    
    return hours * 60 + minutes;
  }

  /**
   * Método para verificar se o agendamento tem todas as informações do cliente (para agendamentos públicos)
   */
  validateClientInfo(): boolean {
    if (!this.isPublic) return true; // Não é necessário para agendamentos privados
    
    return !!(
      this.clientName && 
      this.clientCpf && 
      this.clientEmail && 
      this.clientPhone && 
      this.clientAddress && 
      this.appointmentReason
    );
  }

  /**
   * Verifica se o agendamento pode ser cancelado
   * Implementa Design by Contract para validações de estado
   */
  canBeCancelled(): boolean {
    return this.status === 'scheduled';
  }

  /**
   * Cancela um agendamento, verificando pré-condições
   * Implementa Design by Contract para garantir que a operação só é realizada se válida
   */
  cancel(): void {
    // Pré-condição: agendamento deve estar em status agendado
    Contract.require(this.canBeCancelled(), 'Apenas agendamentos com status "agendado" podem ser cancelados', 'status');
    
    // Executa a operação
    this.status = 'cancelled';
    
    // Pós-condição: status deve ser "cancelado"
    Contract.ensure(this.status === 'cancelled', 'Falha ao definir status como cancelado', 'status');
  }

  /**
   * Verifica se o agendamento pode ser marcado como concluído
   */
  canBeCompleted(): boolean {
    return this.status === 'scheduled';
  }

  /**
   * Marca um agendamento como concluído, verificando pré-condições
   */
  complete(): void {
    // Pré-condição: agendamento deve estar em status agendado
    Contract.require(this.canBeCompleted(), 'Apenas agendamentos com status "agendado" podem ser concluídos', 'status');
    
    // Executa a operação
    this.status = 'completed';
    
    // Pós-condição: status deve ser "concluído"
    Contract.ensure(this.status === 'completed', 'Falha ao definir status como concluído', 'status');
  }

  /**
   * Verifica se o agendamento pode ser marcado como não compareceu
   */
  canBeMarkedAsNoShow(): boolean {
    return this.status === 'scheduled';
  }

  /**
   * Marca um agendamento como "não compareceu", verificando pré-condições
   */
  markAsNoShow(): void {
    // Pré-condição: agendamento deve estar em status agendado
    Contract.require(this.canBeMarkedAsNoShow(), 'Apenas agendamentos com status "agendado" podem ser marcados como "não compareceu"', 'status');
    
    // Executa a operação
    this.status = 'no-show';
    
    // Pós-condição: status deve ser "não compareceu"
    Contract.ensure(this.status === 'no-show', 'Falha ao definir status como "não compareceu"', 'status');
  }

  /**
   * Validação completa da entidade usando Notification Pattern
   * Acumula todos os erros de validação antes de falhar
   */
  validate(): Notification {
    const notification = new Notification();

    if (this.lawyerId <= 0) {
      notification.addError('lawyerId', 'ID do advogado inválido');
    }

    if (!this.date) {
      notification.addError('date', 'Data é obrigatória');
    }

    if (!this.validateTimeSlot()) {
      notification.addError('timeSlot', 'Horário inválido. Início deve ser antes do término.');
    }

    if (this.isPublic) {
      // Validações para agendamentos públicos
      if (!this.clientName) {
        notification.addError('clientName', 'Nome do cliente é obrigatório para agendamentos públicos');
      }

      if (!this.clientCpf) {
        notification.addError('clientCpf', 'CPF do cliente é obrigatório para agendamentos públicos');
      }

      if (!this.clientEmail) {
        notification.addError('clientEmail', 'Email do cliente é obrigatório para agendamentos públicos');
      }

      if (!this.clientPhone) {
        notification.addError('clientPhone', 'Telefone do cliente é obrigatório para agendamentos públicos');
      }

      if (!this.appointmentReason) {
        notification.addError('appointmentReason', 'Motivo do agendamento é obrigatório para agendamentos públicos');
      }
    } else {
      // Validações para agendamentos privados
      if (!this.title) {
        notification.addError('title', 'Título é obrigatório para agendamentos privados');
      }
    }

    return notification;
  }

  /**
   * Factory method para criar uma instância de agendamento com validação completa
   * Implementa Notification Pattern para acumular erros e Fail Fast para validações críticas
   */
  static create(params: {
    id?: number;
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
    createdAt?: Date;
  }): Appointment {
    // Cria uma pré-validação para evitar a criação com dados inválidos
    const notification = new Notification();

    // Verifica campos obrigatórios
    if (!params.lawyerId || params.lawyerId <= 0) {
      notification.addError('lawyerId', 'ID do advogado inválido');
    }

    if (!params.date) {
      notification.addError('date', 'Data é obrigatória');
    }

    if (!params.startTime) {
      notification.addError('startTime', 'Horário de início é obrigatório');
    }

    if (!params.endTime) {
      notification.addError('endTime', 'Horário de término é obrigatório');
    }

    // Falha rápido se houver erros básicos
    notification.throwIfHasErrors();

    // Cria a instância
    const appointment = new Appointment(params);
    
    // Valida completamente a instância criada
    const validationNotification = appointment.validate();
    validationNotification.throwIfHasErrors();

    return appointment;
  }
}