import { IStorage } from '../../storage';
import { LawyerRepository } from '../repositories/LawyerRepository';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { ILawyerRepository } from '../../domain/repositories/ILawyerRepository';
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';

/**
 * Adapter para conectar os repositórios à interface de armazenamento
 * Implementa o padrão Adapter da GoF para desacoplar o domínio da infraestrutura
 */
export class StorageAdapter {
  private lawyerRepository: LawyerRepository;
  private appointmentRepository: AppointmentRepository;

  constructor(private storage: IStorage) {
    this.lawyerRepository = new LawyerRepository(storage);
    this.appointmentRepository = new AppointmentRepository(storage);
  }

  /**
   * Obtém o repositório de advogados
   * @returns Implementação de ILawyerRepository
   */
  getLawyerRepository(): ILawyerRepository {
    return this.lawyerRepository;
  }

  /**
   * Obtém o repositório de agendamentos
   * @returns Implementação de IAppointmentRepository
   */
  getAppointmentRepository(): IAppointmentRepository {
    return this.appointmentRepository;
  }
}