import { Lawyer } from '../entities/Lawyer';

/**
 * Interface para o repositório de advogados
 * Seguindo o padrão de Inversion of Control da Clean Architecture
 * Esta interface pertence à camada de domínio e não depende de implementações concretas
 */
export interface ILawyerRepository {
  /**
   * Busca um advogado pelo ID
   * @param id ID do advogado
   */
  findById(id: number): Promise<Lawyer | null>;
  
  /**
   * Busca um advogado pelo email
   * @param email Email do advogado
   */
  findByEmail(email: string): Promise<Lawyer | null>;
  
  /**
   * Busca um advogado pelo slug (URL amigável)
   * @param slug Slug do advogado
   */
  findBySlug(slug: string): Promise<Lawyer | null>;
  
  /**
   * Salva um advogado (cria ou atualiza)
   * @param lawyer Entidade de advogado
   */
  save(lawyer: Lawyer): Promise<Lawyer>;
  
  /**
   * Atualiza parcialmente um advogado
   * @param id ID do advogado
   * @param lawyerData Dados parciais para atualização
   */
  update(id: number, lawyerData: Partial<Lawyer>): Promise<Lawyer | null>;
  
  /**
   * Remove um advogado
   * @param id ID do advogado
   */
  delete(id: number): Promise<boolean>;
}