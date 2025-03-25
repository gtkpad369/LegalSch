/**
 * Notification Pattern - Padrão para acumular erros de validação
 * Permite que múltiplas validações sejam realizadas e todos os erros sejam capturados
 * ao invés de falhar na primeira validação encontrada
 */
export class Notification {
  private errors: Map<string, string[]>;

  constructor() {
    this.errors = new Map<string, string[]>();
  }

  /**
   * Adiciona um erro à notificação
   * @param key Chave que identifica o contexto do erro (ex: nome do campo)
   * @param message Mensagem de erro
   */
  addError(key: string, message: string): void {
    const errors = this.errors.get(key) || [];
    errors.push(message);
    this.errors.set(key, errors);
  }

  /**
   * Verifica se a notificação possui erros
   */
  hasErrors(): boolean {
    return this.errors.size > 0;
  }

  /**
   * Retorna um objeto com todos os erros
   */
  getErrors(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    this.errors.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Lança uma exceção com os erros acumulados se houver algum erro
   * Implementando o padrão de Fail Fast Validation
   */
  throwIfHasErrors(): void {
    if (this.hasErrors()) {
      throw new ValidationError(this);
    }
  }

  /**
   * Retorna todos os erros em um array plano
   */
  getAllErrorMessages(): string[] {
    const messages: string[] = [];
    this.errors.forEach(errorMessages => {
      messages.push(...errorMessages);
    });
    return messages;
  }

  /**
   * Adiciona os erros de outra notificação a esta
   * @param notification Notificação a ser mesclada
   */
  merge(notification: Notification): void {
    notification.errors.forEach((messages, key) => {
      messages.forEach(message => this.addError(key, message));
    });
  }
}

/**
 * Exceção para erros de validação
 * Contém a notificação com todos os erros acumulados
 */
export class ValidationError extends Error {
  readonly notification: Notification;

  constructor(notification: Notification) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.notification = notification;
  }

  getErrors(): Record<string, string[]> {
    return this.notification.getErrors();
  }
}