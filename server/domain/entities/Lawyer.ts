import { Notification, ValidationError } from '../shared/Notification';
import { Contract } from '../shared/Contract';

/**
 * Lawyer Entity - Core domain entity
 * Representa a entidade principal do advogado no sistema
 * Implementa regras de negócio específicas da entidade Advogado
 * 
 * Utiliza Notification Pattern, Design by Contracts e Fail Fast Validation
 */
export class Lawyer {
  id?: number;
  name: string;
  oabNumber: string;
  email: string;
  phone: string;
  hashedPassword: string;
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

  /**
   * Cria uma nova instância de Lawyer com validações de contrato (Design by Contract)
   */
  constructor(params: {
    id?: number;
    name: string;
    oabNumber: string;
    email: string;
    phone: string;
    hashedPassword: string;
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
  }) {
    // Fail Fast Validation para parâmetros críticos (falha imediatamente se inválidos)
    Contract.notNullOrEmpty(params.name, () => 'Nome não pode ser vazio', 'name');
    Contract.notNullOrEmpty(params.oabNumber, () => 'Número OAB não pode ser vazio', 'oabNumber');
    Contract.notNullOrEmpty(params.email, () => 'Email não pode ser vazio', 'email');
    Contract.validEmail(params.email, () => 'Email inválido', 'email');
    Contract.notNullOrEmpty(params.phone, () => 'Telefone não pode ser vazio', 'phone');
    Contract.notNullOrEmpty(params.hashedPassword, () => 'Senha não pode ser vazia', 'hashedPassword');
    Contract.notNullOrEmpty(params.address, () => 'Endereço não pode ser vazio', 'address');
    Contract.notNullOrEmpty(params.slug, () => 'Slug não pode ser vazio', 'slug');

    // Atribuições
    this.id = params.id;
    this.name = params.name;
    this.oabNumber = params.oabNumber;
    this.email = params.email;
    this.phone = params.phone;
    this.hashedPassword = params.hashedPassword;
    this.address = params.address;
    this.description = params.description;
    this.areasOfExpertise = params.areasOfExpertise || [];
    this.socialLinks = params.socialLinks;
    this.externalLinks = params.externalLinks;
    this.slug = params.slug;

    // Invariantes de domínio
    this.validateInvariants();
  }

  /**
   * Validação de invariantes - garantias que a entidade precisa manter para estar em estado consistente
   * Implementa Fail Fast Validation - falha imediatamente quando um invariante é violado
   */
  private validateInvariants(): void {
    Contract.invariant(this.name.trim().length >= 3, 'Nome deve ter pelo menos 3 caracteres', 'name');
    Contract.invariant(this.validateEmail(), 'Email deve ser válido', 'email');
    Contract.invariant(this.validateOABNumber(), 'Número OAB deve ser válido', 'oabNumber');
    Contract.invariant(this.phone.trim().length >= 10, 'Telefone deve ter pelo menos 10 caracteres', 'phone');
    Contract.invariant(this.address.trim().length >= 5, 'Endereço deve ter pelo menos 5 caracteres', 'address');
    Contract.invariant(this.slug.trim().length >= 3, 'Slug deve ter pelo menos 3 caracteres', 'slug');
    Contract.invariant(Array.isArray(this.areasOfExpertise), 'Áreas de expertise deve ser um array', 'areasOfExpertise');
  }

  /**
   * Método para validar email - regra de negócio específica
   */
  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  /**
   * Método para validar número da OAB - regra de negócio específica
   */
  validateOABNumber(): boolean {
    // Implementação simplificada - na vida real, usaria uma validação mais complexa
    return this.oabNumber.length > 0;
  }

  /**
   * Método para obter representação pública (sem a senha)
   */
  toPublicJSON() {
    const { hashedPassword, ...publicData } = this;
    return publicData;
  }

  /**
   * Validação completa da entidade usando Notification Pattern
   * Acumula todos os erros de validação antes de falhar
   */
  validate(): Notification {
    const notification = new Notification();

    // Valida todos os campos e acumula erros
    if (this.name.trim().length < 3) {
      notification.addError('name', 'Nome deve ter pelo menos 3 caracteres');
    }

    if (!this.validateEmail()) {
      notification.addError('email', 'Email inválido');
    }

    if (!this.validateOABNumber()) {
      notification.addError('oabNumber', 'Número OAB inválido');
    }

    if (this.phone.trim().length < 10) {
      notification.addError('phone', 'Telefone inválido');
    }

    if (this.address.trim().length < 5) {
      notification.addError('address', 'Endereço inválido');
    }

    if (this.slug.trim().length < 3) {
      notification.addError('slug', 'Slug inválido');
    }

    if (!Array.isArray(this.areasOfExpertise)) {
      notification.addError('areasOfExpertise', 'Áreas de expertise deve ser um array');
    }

    return notification;
  }

  /**
   * Factory method para criar uma instância de advogado com validação completa
   * Implementa Notification Pattern para acumular erros
   */
  static create(params: {
    id?: number;
    name: string;
    oabNumber: string;
    email: string;
    phone: string;
    hashedPassword: string;
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
  }): Lawyer {
    // Cria uma pré-validação para evitar a criação com dados inválidos
    const notification = new Notification();

    // Verifica campos obrigatórios
    if (!params.name || params.name.trim() === '') {
      notification.addError('name', 'Nome não pode ser vazio');
    }

    if (!params.oabNumber || params.oabNumber.trim() === '') {
      notification.addError('oabNumber', 'Número OAB não pode ser vazio');
    }

    if (!params.email || params.email.trim() === '') {
      notification.addError('email', 'Email não pode ser vazio');
    }

    if (!params.phone || params.phone.trim() === '') {
      notification.addError('phone', 'Telefone não pode ser vazio');
    }

    if (!params.hashedPassword || params.hashedPassword.trim() === '') {
      notification.addError('hashedPassword', 'Senha não pode ser vazia');
    }

    if (!params.address || params.address.trim() === '') {
      notification.addError('address', 'Endereço não pode ser vazio');
    }

    if (!params.slug || params.slug.trim() === '') {
      notification.addError('slug', 'Slug não pode ser vazio');
    }

    // Falha rápido se houver erros antes mesmo de criar o objeto
    notification.throwIfHasErrors();

    // Cria a instância apenas se passar na pré-validação
    const lawyer = new Lawyer(params);
    
    // Valida completamente a instância criada
    const validationNotification = lawyer.validate();
    validationNotification.throwIfHasErrors();

    return lawyer;
  }
}