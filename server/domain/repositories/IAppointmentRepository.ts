import { Appointment } from '../entities/Appointment';

/**
 * Interface para o repositório de agendamentos
 * Seguindo o padrão de Inversion of Control da Clean Architecture
 * Esta interface pertence à camada de domínio e não depende de implementações concretas
 */
export interface IAppointmentRepository {
  /**
   * Busca um agendamento pelo ID
   * @param id ID do agendamento
   */
  findById(id: number): Promise<Appointment | null>;
  
  /**
   * Busca todos os agendamentos de um advogado
   * @param lawyerId ID do advogado
   */
  findByLawyerId(lawyerId: number): Promise<Appointment[]>;
  
  /**
   * Busca agendamentos de um advogado em uma semana específica
   * @param lawyerId ID do advogado
   * @param weekStart Data de início da semana
   */
  findByLawyerIdAndWeek(lawyerId: number, weekStart: Date): Promise<Appointment[]>;
  
  /**
   * Verifica se existe um agendamento no mesmo horário
   * @param lawyerId ID do advogado
   * @param date Data do agendamento
   * @param startTime Horário de início
   * @param endTime Horário de término
   * @param excludeId ID a ser excluído da verificação (útil para atualizações)
   */
  existsAtSameTime(
    lawyerId: number, 
    date: Date, 
    startTime: string, 
    endTime: string, 
    excludeId?: number
  ): Promise<boolean>;
  
  /**
   * Salva um agendamento (cria ou atualiza)
   * @param appointment Entidade de agendamento
   */
  save(appointment: Appointment): Promise<Appointment>;
  
  /**
   * Atualiza parcialmente um agendamento
   * @param id ID do agendamento
   * @param appointmentData Dados parciais para atualização
   */
  update(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | null>;
  
  /**
   * Remove um agendamento
   * @param id ID do agendamento
   */
  delete(id: number): Promise<boolean>;
}