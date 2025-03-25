import crypto from 'crypto';

/**
 * Utilitários de segurança para a camada de domínio
 * Implementa boas práticas de segurança seguindo recomendações OWASP
 */
export class SecurityUtils {
  /**
   * Gera um hash seguro para senhas utilizando PBKDF2
   * Seguindo as recomendações OWASP para armazenamento seguro de senhas
   * @param password Senha em texto puro
   * @param salt Salt para aumentar a segurança (opcional, será gerado se não fornecido)
   * @returns String no formato {algorithm}${iterations}${salt}${hash}
   */
  static async hashPassword(password: string, providedSalt?: string): Promise<string> {
    // Parâmetros seguindo recomendações de segurança OWASP
    const algorithm = 'sha512';
    const iterations = 10000; // Número de iterações recomendado
    const keyLength = 64; // Tamanho da chave em bytes
    
    // Gera um salt aleatório se não for fornecido
    const salt = providedSalt || crypto.randomBytes(16).toString('hex');
    
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, iterations, keyLength, algorithm, (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Formato: {algorithm}${iterations}${salt}${hash}
        const hash = derivedKey.toString('hex');
        resolve(`${algorithm}$${iterations}$${salt}$${hash}`);
      });
    });
  }
  
  /**
   * Verifica se uma senha corresponde a um hash
   * @param password Senha em texto puro
   * @param hashedPassword Hash da senha armazenado
   * @returns Verdadeiro se a senha corresponder ao hash
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    // Parse the stored hash
    const parts = hashedPassword.split('$');
    if (parts.length !== 4) {
      throw new Error('Hash em formato inválido');
    }
    
    const algorithm = parts[0];
    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const storedHash = parts[3];
    
    if (isNaN(iterations)) {
      throw new Error('Número de iterações inválido');
    }
    
    const keyLength = storedHash.length / 2; // convertendo de hex para bytes
    
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, iterations, keyLength, algorithm, (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        
        const hash = derivedKey.toString('hex');
        resolve(hash === storedHash);
      });
    });
  }
  
  /**
   * Sanitiza uma string para prevenir XSS e SQL Injection
   * OWASP A1 - Injection & A7 - XSS
   * @param input String a ser sanitizada
   * @returns String sanitizada
   */
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    // Substitui caracteres HTML perigosos
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .replace(/`/g, '&#96;');
  }
  
  /**
   * Gera um token aleatório seguro
   * Útil para tokens de sessão, redefinição de senha, etc.
   * @param bytes Tamanho do token em bytes
   * @returns Token em formato hexadecimal
   */
  static generateSecureToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }
}