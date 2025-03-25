import { ILawyerRepository } from '../../domain/repositories/ILawyerRepository';
import { Lawyer } from '../../domain/entities/Lawyer';
import { IStorage } from '../../storage';

/**
 * Implementação concreta do repositório de advogados
 * 
 * Esta classe implementa a interface ILawyerRepository
 * e se conecta ao mecanismo de armazenamento através do IStorage
 */
export class LawyerRepository implements ILawyerRepository {
  constructor(private storage: IStorage) {}

  /**
   * Busca um advogado pelo ID
   * @param id ID do advogado
   */
  async findById(id: number): Promise<Lawyer | null> {
    const lawyer = await this.storage.getLawyer(id);
    return lawyer ? this.mapToEntity(lawyer) : null;
  }
  
  /**
   * Busca um advogado pelo email
   * @param email Email do advogado
   */
  async findByEmail(email: string): Promise<Lawyer | null> {
    const lawyer = await this.storage.getLawyerByEmail(email);
    return lawyer ? this.mapToEntity(lawyer) : null;
  }
  
  /**
   * Busca um advogado pelo slug
   * @param slug Slug do advogado
   */
  async findBySlug(slug: string): Promise<Lawyer | null> {
    const lawyer = await this.storage.getLawyerBySlug(slug);
    return lawyer ? this.mapToEntity(lawyer) : null;
  }
  
  /**
   * Salva um advogado
   * @param lawyer Entidade de advogado
   */
  async save(lawyer: Lawyer): Promise<Lawyer> {
    // Se já existir um ID, atualiza o advogado
    if (lawyer.id) {
      const updatedLawyer = await this.storage.updateLawyer(lawyer.id, lawyer);
      return this.mapToEntity(updatedLawyer);
    }
    
    // Caso contrário, cria um novo advogado
    const newLawyer = await this.storage.createLawyer({
      name: lawyer.name,
      oabNumber: lawyer.oabNumber,
      email: lawyer.email,
      phone: lawyer.phone,
      password: lawyer.hashedPassword, // Mapeia hashedPassword da entidade para password do storage
      address: lawyer.address,
      description: lawyer.description,
      areasOfExpertise: lawyer.areasOfExpertise,
      socialLinks: lawyer.socialLinks,
      externalLinks: lawyer.externalLinks,
      slug: lawyer.slug
    });
    
    return this.mapToEntity(newLawyer);
  }
  
  /**
   * Atualiza parcialmente um advogado
   * @param id ID do advogado
   * @param lawyerData Dados parciais para atualização
   */
  async update(id: number, lawyerData: Partial<Lawyer>): Promise<Lawyer | null> {
    const updatedLawyer = await this.storage.updateLawyer(id, lawyerData);
    return updatedLawyer ? this.mapToEntity(updatedLawyer) : null;
  }
  
  /**
   * Remove um advogado
   * @param id ID do advogado
   */
  async delete(id: number): Promise<boolean> {
    // Esta funcionalidade não está implementada no storage
    // Para implementá-la, seria necessário adicionar o método deleteLawyer ao IStorage
    throw new Error('Método não implementado: deleteLawyer');
  }

  /**
   * Converte um objeto de dados para uma entidade de domínio
   * Garante que a conversão entre camadas seja feita corretamente
   */
  private mapToEntity(data: any): Lawyer {
    return Lawyer.create({
      id: data.id,
      name: data.name,
      oabNumber: data.oabNumber,
      email: data.email,
      phone: data.phone,
      hashedPassword: data.password, // Mapeia password do storage para hashedPassword da entidade
      address: data.address,
      description: data.description,
      areasOfExpertise: data.areasOfExpertise || [],
      socialLinks: data.socialLinks,
      externalLinks: data.externalLinks,
      slug: data.slug
    });
  }
}