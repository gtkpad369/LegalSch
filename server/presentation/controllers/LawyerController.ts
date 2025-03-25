import { Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../domain/shared/Notification';
import { CreateLawyerUseCase } from '../../domain/usecases/lawyer/CreateLawyerUseCase';
import { AuthenticateLawyerUseCase } from '../../domain/usecases/lawyer/AuthenticateLawyerUseCase';
import { LawyerRepository } from '../../infrastructure/repositories/LawyerRepository';
import { storage } from '../../storage';
import { loginSchema } from '../../../shared/schema';
import { asyncHandler } from '../../infrastructure/middleware';

// Inicialização das dependências
const lawyerRepository = new LawyerRepository(storage);
const createLawyerUseCase = new CreateLawyerUseCase(lawyerRepository);
const authenticateLawyerUseCase = new AuthenticateLawyerUseCase(lawyerRepository);

/**
 * Controller para ações relacionadas a advogados
 * Implementa padrão RESTful para operações CRUD
 */
export class LawyerController {
  /**
   * Autentica um advogado com email e senha
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    // Validação do body da requisição com Zod
    const validatedData = loginSchema.parse(req.body);
    
    try {
      // Executa o caso de uso de autenticação
      const result = await authenticateLawyerUseCase.execute({
        email: validatedData.email,
        password: validatedData.password
      });
      
      // Retorna os dados do advogado e o token
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(401).json({ errors: error.getErrors() });
      }
      throw error;
    }
  });
  
  /**
   * Retorna um advogado pelo ID
   */
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const lawyer = await lawyerRepository.findById(id);
    
    if (!lawyer) {
      return res.status(404).json({ error: 'Advogado não encontrado' });
    }
    
    // Remove a senha antes de retornar
    const { hashedPassword, ...lawyerWithoutPassword } = lawyer;
    return res.status(200).json(lawyerWithoutPassword);
  });
  
  /**
   * Retorna um advogado pelo slug
   */
  static getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    
    const lawyer = await lawyerRepository.findBySlug(slug);
    
    if (!lawyer) {
      return res.status(404).json({ error: 'Advogado não encontrado' });
    }
    
    // Remove a senha antes de retornar
    const { hashedPassword, ...lawyerWithoutPassword } = lawyer;
    return res.status(200).json(lawyerWithoutPassword);
  });
  
  /**
   * Cria um novo advogado
   */
  static create = asyncHandler(async (req: Request, res: Response) => {
    try {
      // Esquema de validação para criação de advogado
      const createLawyerSchema = z.object({
        name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
        oabNumber: z.string().min(3, 'Número OAB inválido'),
        email: z.string().email('Email inválido'),
        phone: z.string().min(10, 'Telefone inválido'),
        password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
        address: z.string().min(5, 'Endereço muito curto'),
        description: z.string().optional(),
        areasOfExpertise: z.array(z.string()).min(1, 'Informe pelo menos uma área de atuação'),
        socialLinks: z.object({
          facebook: z.string().optional(),
          twitter: z.string().optional(),
          linkedin: z.string().optional(),
          instagram: z.string().optional()
        }).optional(),
        externalLinks: z.object({
          jusbrasil: z.string().optional(),
          website: z.string().optional()
        }).optional(),
        slug: z.string().min(3, 'Slug inválido')
      });
      
      // Validação do body da requisição
      const validatedData = createLawyerSchema.parse(req.body);
      
      // Executa o caso de uso de criação de advogado
      const lawyer = await createLawyerUseCase.execute(validatedData);
      
      // Remove a senha antes de retornar
      const { hashedPassword, ...lawyerWithoutPassword } = lawyer;
      return res.status(201).json(lawyerWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          })) 
        });
      }
      
      if (error instanceof ValidationError) {
        return res.status(400).json({ errors: error.getErrors() });
      }
      
      throw error;
    }
  });
  
  /**
   * Atualiza um advogado
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    // Verifica se o advogado existe
    const existingLawyer = await lawyerRepository.findById(id);
    
    if (!existingLawyer) {
      return res.status(404).json({ error: 'Advogado não encontrado' });
    }
    
    try {
      // Esquema de validação para atualização de advogado
      const updateLawyerSchema = z.object({
        name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
        phone: z.string().min(10, 'Telefone inválido').optional(),
        address: z.string().min(5, 'Endereço muito curto').optional(),
        description: z.string().optional().nullable(),
        areasOfExpertise: z.array(z.string()).min(1, 'Informe pelo menos uma área de atuação').optional(),
        socialLinks: z.object({
          facebook: z.string().optional().nullable(),
          twitter: z.string().optional().nullable(),
          linkedin: z.string().optional().nullable(),
          instagram: z.string().optional().nullable()
        }).optional(),
        externalLinks: z.object({
          jusbrasil: z.string().optional().nullable(),
          website: z.string().optional().nullable()
        }).optional()
      });
      
      // Validação do body da requisição
      const validatedData = updateLawyerSchema.parse(req.body);
      
      // Atualiza o advogado
      const updatedLawyer = await lawyerRepository.update(id, validatedData);
      
      if (!updatedLawyer) {
        return res.status(404).json({ error: 'Falha ao atualizar advogado' });
      }
      
      // Remove a senha antes de retornar
      const { hashedPassword, ...lawyerWithoutPassword } = updatedLawyer;
      return res.status(200).json(lawyerWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          })) 
        });
      }
      
      if (error instanceof ValidationError) {
        return res.status(400).json({ errors: error.getErrors() });
      }
      
      throw error;
    }
  });
}