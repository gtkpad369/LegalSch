import { storage } from '../../storage';
import { StorageAdapter } from '../adapters/StorageAdapter';
import { CreateLawyerUseCase } from '../../domain/usecases/lawyer/CreateLawyerUseCase';
import { AuthenticateLawyerUseCase } from '../../domain/usecases/lawyer/AuthenticateLawyerUseCase';
import { CreateAppointmentUseCase } from '../../domain/usecases/appointment/CreateAppointmentUseCase';

/**
 * Container de Injeção de Dependências
 * Implementa o padrão Service Locator para gerenciar as dependências da aplicação
 * e promover o desacoplamento entre camadas
 */
export class DIContainer {
  private static instance: DIContainer;
  private container: Map<string, any>;

  private constructor() {
    this.container = new Map();
    this.registerDependencies();
  }

  /**
   * Obtém a instância singleton do container
   */
  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Registra todas as dependências da aplicação
   */
  private registerDependencies(): void {
    // Registra o adaptador de armazenamento
    const storageAdapter = new StorageAdapter(storage);
    this.register('storageAdapter', storageAdapter);

    // Registra os repositórios
    this.register('lawyerRepository', storageAdapter.getLawyerRepository());
    this.register('appointmentRepository', storageAdapter.getAppointmentRepository());

    // Registra os casos de uso
    this.register(
      'createLawyerUseCase', 
      new CreateLawyerUseCase(this.get('lawyerRepository'))
    );
    
    this.register(
      'authenticateLawyerUseCase',
      new AuthenticateLawyerUseCase(this.get('lawyerRepository'))
    );
    
    this.register(
      'createAppointmentUseCase',
      new CreateAppointmentUseCase(
        this.get('appointmentRepository'),
        this.get('lawyerRepository')
      )
    );
  }

  /**
   * Registra uma dependência no container
   * @param name Nome da dependência
   * @param instance Instância da dependência
   */
  public register(name: string, instance: any): void {
    this.container.set(name, instance);
  }

  /**
   * Obtém uma dependência do container
   * @param name Nome da dependência
   * @returns Instância da dependência
   */
  public get<T>(name: string): T {
    const dependency = this.container.get(name);
    
    if (!dependency) {
      throw new Error(`Dependência não encontrada: ${name}`);
    }
    
    return dependency;
  }
}

// Exporta uma instância singleton do container
export const container = DIContainer.getInstance();