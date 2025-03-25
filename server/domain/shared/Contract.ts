/**
 * Design by Contract - Padrão para definir pré-condições, pós-condições e invariantes
 * Implementa o princípio de Fail Fast Validation
 */
export class Contract {
  /**
   * Verifica uma pré-condição e lança uma exceção se for falsa
   * @param condition Condição a ser verificada
   * @param message Mensagem de erro
   * @param key Chave de contexto (opcional)
   */
  static require(condition: boolean, message: string, key: string = 'precondition'): void {
    if (!condition) {
      throw new ContractError(`Pré-condição violada: ${message}`, key);
    }
  }

  /**
   * Verifica uma pós-condição e lança uma exceção se for falsa
   * @param condition Condição a ser verificada
   * @param message Mensagem de erro
   * @param key Chave de contexto (opcional)
   */
  static ensure(condition: boolean, message: string, key: string = 'postcondition'): void {
    if (!condition) {
      throw new ContractError(`Pós-condição violada: ${message}`, key);
    }
  }

  /**
   * Verifica uma invariante e lança uma exceção se for falsa
   * @param condition Condição a ser verificada
   * @param message Mensagem de erro
   * @param key Chave de contexto (opcional)
   */
  static invariant(condition: boolean, message: string, key: string = 'invariant'): void {
    if (!condition) {
      throw new ContractError(`Invariante violada: ${message}`, key);
    }
  }

  /**
   * Valida se uma string não é nula ou vazia
   * @param value Valor a ser verificado
   * @param messageFn Função que retorna a mensagem de erro
   * @param key Chave de contexto
   */
  static notNullOrEmpty(value: string | null | undefined, messageFn: () => string, key: string): void {
    if (!value || value.trim() === '') {
      throw new ContractError(messageFn(), key);
    }
  }

  /**
   * Valida se um número é maior que um valor mínimo
   * @param value Valor a ser verificado
   * @param min Valor mínimo
   * @param messageFn Função que retorna a mensagem de erro
   * @param key Chave de contexto
   */
  static greaterThan(value: number, min: number, messageFn: () => string, key: string): void {
    if (value <= min) {
      throw new ContractError(messageFn(), key);
    }
  }

  /**
   * Valida se um valor não é nulo ou indefinido
   * @param value Valor a ser verificado
   * @param messageFn Função que retorna a mensagem de erro
   * @param key Chave de contexto
   */
  static notNull<T>(value: T | null | undefined, messageFn: () => string, key: string): void {
    if (value === null || value === undefined) {
      throw new ContractError(messageFn(), key);
    }
  }

  /**
   * Valida um email usando regex
   * @param email Email a ser verificado
   * @param messageFn Função que retorna a mensagem de erro
   * @param key Chave de contexto
   */
  static validEmail(email: string, messageFn: () => string, key: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ContractError(messageFn(), key);
    }
  }
}

/**
 * Exceção para violações de contrato
 */
export class ContractError extends Error {
  readonly key: string;

  constructor(message: string, key: string) {
    super(message);
    this.name = 'ContractError';
    this.key = key;
  }
}