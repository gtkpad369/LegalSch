import { Lawyer } from '../../entities/Lawyer';
import { ILawyerRepository } from '../../repositories/ILawyerRepository';
import { Notification, ValidationError } from '../../shared/Notification';
import { SecurityUtils } from '../../shared/SecurityUtils';
import { Contract } from '../../shared/Contract';

/**
 * Entrada para o caso de uso de criação de advogado
 */
export interface CreateLawyerInput {
  name: string;
  oabNumber: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  description?: string;
  areasOfExpertise: string[];
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  externalLinks?: {
    jusbrasil?: string;
    website?: string;
  };
  slug: string;
}

/**
 * Caso de uso para criação de um advogado
 * Implementa regras de negócio específicas para criação de advogados
 */
export class CreateLawyerUseCase {
  constructor(private lawyerRepository: ILawyerRepository) {}

  /**
   * Executa o caso de uso de criação de advogado
   * @param input Dados para criação do advogado
   * @returns Advogado criado
   * @throws ValidationError se houver erros de validação
   */
  async execute(input: CreateLawyerInput): Promise<Lawyer> {
    // Validações de negócio usando Notification Pattern para acumular erros
    const notification = new Notification();

    // Verifica se já existe um advogado com o mesmo email
    const existingLawyerByEmail = await this.lawyerRepository.findByEmail(input.email);
    if (existingLawyerByEmail) {
      notification.addError('email', 'Email já está em uso');
    }

    // Verifica se já existe um advogado com o mesmo número OAB
    const existingLawyerByOAB = await this.lawyerRepository.findByEmail(input.oabNumber);
    if (existingLawyerByOAB) {
      notification.addError('oabNumber', 'Número OAB já está em uso');
    }

    // Verifica se já existe um advogado com o mesmo slug
    const existingLawyerBySlug = await this.lawyerRepository.findBySlug(input.slug);
    if (existingLawyerBySlug) {
      notification.addError('slug', 'Slug já está em uso');
    }

    // Falha rápido se já houver violações de unicidade
    notification.throwIfHasErrors();

    try {
      // Faz o hash da senha de forma segura antes de criar o advogado
      const hashedPassword = await SecurityUtils.hashPassword(input.password);

      // Sanitiza entradas para prevenir XSS (Cross-Site Scripting)
      const sanitizedName = SecurityUtils.sanitizeInput(input.name);
      const sanitizedDescription = input.description 
        ? SecurityUtils.sanitizeInput(input.description) 
        : input.description;
      const sanitizedAddress = SecurityUtils.sanitizeInput(input.address);

      // Cria a entidade de advogado usando o método factory que já valida a entidade
      const lawyer = Lawyer.create({
        name: sanitizedName,
        oabNumber: input.oabNumber,
        email: input.email,
        phone: input.phone,
        hashedPassword: hashedPassword,
        address: sanitizedAddress,
        description: sanitizedDescription,
        areasOfExpertise: input.areasOfExpertise,
        socialLinks: input.socialLinks,
        externalLinks: input.externalLinks,
        slug: input.slug
      });

      // Persiste o advogado
      return await this.lawyerRepository.save(lawyer);
    } catch (error) {
      // Se for um erro de validação, repassa para cima
      if (error instanceof ValidationError) {
        throw error;
      }

      // Caso contrário, cria uma nova notificação para o erro
      const errorNotification = new Notification();
      errorNotification.addError('general', `Erro ao criar advogado: ${error.message}`);
      throw new ValidationError(errorNotification);
    }
  }
}