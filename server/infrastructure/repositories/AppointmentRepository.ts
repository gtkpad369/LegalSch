import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import { Appointment } from '../../domain/entities/Appointment';
import { IStorage } from '../../storage';

/**
 * Implementação concreta do repositório de agendamentos
 * 
 * Esta classe implementa a interface IAppointmentRepository
 * e se conecta ao mecanismo de armazenamento através do IStorage
 */
export class AppointmentRepository implements IAppointmentRepository {
  constructor(private storage: IStorage) {}

  /**
   * Busca um agendamento pelo ID
   * @param id ID do agendamento
   */
  async findById(id: number): Promise<Appointment | null> {
    const appointment = await this.storage.getAppointment(id);
    return appointment ? this.mapToEntity(appointment) : null;
  }
  
  /**
   * Busca todos os agendamentos de um advogado
   * @param lawyerId ID do advogado
   */
  async findByLawyerId(lawyerId: number): Promise<Appointment[]> {
    const appointments = await this.storage.getAppointments(lawyerId);
    return appointments.map(appointment => this.mapToEntity(appointment));
  }
  
  /**
   * Busca agendamentos de um advogado em uma semana específica
   * @param lawyerId ID do advogado
   * @param weekStart Data de início da semana
   */
  async findByLawyerIdAndWeek(lawyerId: number, weekStart: Date): Promise<Appointment[]> {
    const appointments = await this.storage.getAppointmentsByWeek(lawyerId, weekStart);
    return appointments.map(appointment => this.mapToEntity(appointment));
  }
  
  /**
   * Verifica se existe um agendamento no mesmo horário
   * @param lawyerId ID do advogado
   * @param date Data do agendamento
   * @param startTime Horário de início
   * @param endTime Horário de término
   * @param excludeId ID a ser excluído da verificação (útil para atualizações)
   */
  async existsAtSameTime(
    lawyerId: number, 
    date: Date, 
    startTime: string, 
    endTime: string, 
    excludeId?: number
  ): Promise<boolean> {
    // Busca todos os agendamentos do advogado para a data específica
    const dateString = date.toISOString().split('T')[0];
    const startDate = new Date(dateString);
    const endDate = new Date(dateString);
    endDate.setDate(endDate.getDate() + 1);
    
    const appointments = await this.storage.getAppointmentsByWeek(lawyerId, startDate);
    
    // Filtra apenas os agendamentos para o dia específico
    const appointmentsForDay = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toISOString().split('T')[0] === dateString;
    });
    
    // Converte startTime e endTime para minutos desde meia-noite para facilitar comparação
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    
    // Verifica se há conflito de horário
    return appointmentsForDay.some(appointment => {
      // Ignora o próprio agendamento em caso de atualização
      if (excludeId && appointment.id === excludeId) {
        return false;
      }
      
      const appointmentStartMinutes = this.timeToMinutes(appointment.startTime);
      const appointmentEndMinutes = this.timeToMinutes(appointment.endTime);
      
      // Verifica interseção de intervalos de tempo
      return (
        (startMinutes >= appointmentStartMinutes && startMinutes < appointmentEndMinutes) ||
        (endMinutes > appointmentStartMinutes && endMinutes <= appointmentEndMinutes) ||
        (startMinutes <= appointmentStartMinutes && endMinutes >= appointmentEndMinutes)
      );
    });
  }
  
  /**
   * Salva um agendamento
   * @param appointment Entidade de agendamento
   */
  async save(appointment: Appointment): Promise<Appointment> {
    // Se já existir um ID, atualiza o agendamento
    if (appointment.id) {
      const updatedAppointment = await this.storage.updateAppointment(appointment.id, appointment);
      return this.mapToEntity(updatedAppointment);
    }
    
    // Caso contrário, cria um novo agendamento
    const newAppointment = await this.storage.createAppointment({
      lawyerId: appointment.lawyerId,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      isPublic: appointment.isPublic,
      status: appointment.status,
      title: appointment.title,
      description: appointment.description,
      clientName: appointment.clientName,
      clientCpf: appointment.clientCpf,
      clientBirthDate: appointment.clientBirthDate,
      clientEmail: appointment.clientEmail,
      clientPhone: appointment.clientPhone,
      clientAddress: appointment.clientAddress,
      appointmentReason: appointment.appointmentReason
    });
    
    return this.mapToEntity(newAppointment);
  }
  
  /**
   * Atualiza parcialmente um agendamento
   * @param id ID do agendamento
   * @param appointmentData Dados parciais para atualização
   */
  async update(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | null> {
    const updatedAppointment = await this.storage.updateAppointment(id, appointmentData);
    return updatedAppointment ? this.mapToEntity(updatedAppointment) : null;
  }
  
  /**
   * Remove um agendamento
   * @param id ID do agendamento
   */
  async delete(id: number): Promise<boolean> {
    return await this.storage.deleteAppointment(id);
  }
  
  /**
   * Converte um objeto de dados para uma entidade de domínio
   * Garante que a conversão entre camadas seja feita corretamente
   */
  private mapToEntity(data: any): Appointment {
    return Appointment.create({
      id: data.id,
      lawyerId: data.lawyerId,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      isPublic: data.isPublic,
      status: data.status,
      title: data.title,
      description: data.description,
      clientName: data.clientName,
      clientCpf: data.clientCpf,
      clientBirthDate: data.clientBirthDate ? new Date(data.clientBirthDate) : undefined,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      clientAddress: data.clientAddress,
      appointmentReason: data.appointmentReason,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
    });
  }
  
  /**
   * Converte um horário no formato HH:MM para minutos desde meia-noite
   * Utilizado para facilitar comparações de horários
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}