import { Request, Response, NextFunction } from 'express';
import { storage } from '../../storage';

/**
 * Interface para representar o usuário autenticado na requisição
 */
interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Middleware para verificar se o usuário está autenticado
 * Implementa proteção contra acessos não autorizados (OWASP A5)
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obtém o token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Em uma implementação real, aqui seria feita a verificação do token JWT
    // e a busca do usuário com base nas informações do token.
    // Como estamos usando uma implementação simplificada, apenas verificamos 
    // se o ID do usuário está presente no token (mock para exemplo).
    
    // Exemplo simplificado para demo:
    const userId = 1; // Em uma implementação real, o ID seria extraído do token
    const user = await storage.getLawyer(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Adiciona o usuário à requisição para uso nas rotas
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Middleware para verificar se o usuário tem permissão para acessar recursos de um advogado específico
 * Implementa proteção contra falhas de controle de acesso (OWASP A5)
 */
export const ownerMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Garante que o usuário esteja autenticado
    if (!req.user) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Verifica se o parâmetro lawyerId existe na rota
    const lawyerId = parseInt(req.params.lawyerId);
    if (isNaN(lawyerId)) {
      return res.status(400).json({ error: 'ID de advogado inválido' });
    }

    // Verifica se o usuário autenticado é o dono do recurso
    if (req.user.id !== lawyerId) {
      return res.status(403).json({ error: 'Acesso proibido' });
    }

    next();
  } catch (error) {
    console.error('Erro na verificação de proprietário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};