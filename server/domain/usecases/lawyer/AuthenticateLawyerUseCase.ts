import { ILawyerRepository } from '../../repositories/ILawyerRepository';
import { Notification, ValidationError } from '../../shared/Notification';
import { SecurityUtils } from '../../shared/SecurityUtils';
import { Lawyer } from '../../entities/Lawyer';

/**
 * Input para o caso de uso de autenticação de advogado
 */
export interface AuthenticateLawyerInput {
  email: string;
  password: string;
}

/**
 * Output do caso de uso de autenticação de advogado
 */
export interface AuthenticateLawyerOutput {
  lawyer: Omit<Lawyer, 'hashedPassword'>;
  token: string; // Token JWT ou outro formato de token de autenticação
}

/**
 * Caso de uso para autenticação de advogados
 * Implementa as regras de negócio para autenticação seguindo as diretrizes OWASP
 */
export class AuthenticateLawyerUseCase {
  constructor(private lawyerRepository: ILawyerRepository) {}

  /**
   * Executa o caso de uso de autenticação
   * @param input Dados de login (email e senha)
   * @returns Dados do advogado e token de acesso
   * @throws ValidationError se as credenciais forem inválidas
   */
  async execute(input: AuthenticateLawyerInput): Promise<AuthenticateLawyerOutput> {
    // Validação básica de entrada
    const notification = new Notification();
    
    if (!input.email) {
      notification.addError('email', 'Email é obrigatório');
    }
    
    if (!input.password) {
      notification.addError('password', 'Senha é obrigatória');
    }
    
    notification.throwIfHasErrors();

    try {
      // Busca o advogado pelo email
      const lawyer = await this.lawyerRepository.findByEmail(input.email);
      
      // Se não encontrar o advogado, lança erro
      if (!lawyer) {
        const authError = new Notification();
        // Mensagem genérica para não revelar que o email não existe (evita enumeração)
        authError.addError('credentials', 'Credenciais inválidas');
        throw new ValidationError(authError);
      }
      
      // Verifica a senha
      const isPasswordValid = await SecurityUtils.verifyPassword(
        input.password,
        lawyer.hashedPassword
      );
      
      // Se a senha for inválida, lança erro
      if (!isPasswordValid) {
        const authError = new Notification();
        authError.addError('credentials', 'Credenciais inválidas');
        throw new ValidationError(authError);
      }
      
      // Gera um token de acesso
      const token = SecurityUtils.generateSecureToken();
      
      // Retorna os dados do advogado sem a senha
      const { hashedPassword, ...lawyerWithoutPassword } = lawyer;
      
      return {
        lawyer: lawyerWithoutPassword,
        token
      };
    } catch (error) {
      // Se for um erro de validação, repassa para cima
      if (error instanceof ValidationError) {
        throw error;
      }
      
      // Caso contrário, cria uma nova notificação para o erro
      const errorNotification = new Notification();
      errorNotification.addError('general', `Erro ao autenticar: ${error.message}`);
      throw new ValidationError(errorNotification);
    }
  }
}