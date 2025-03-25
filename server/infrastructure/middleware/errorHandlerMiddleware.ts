import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../domain/shared/Notification';

/**
 * Middleware para tratamento centralizado de erros
 * Implementa tratamento adequado de erros seguindo boas práticas de segurança (OWASP A10)
 */
export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Erro capturado:', err);

  // Tratamento específico para erros de validação do domínio
  if (err instanceof ValidationError) {
    return res.status(400).json({
      type: 'ValidationError',
      errors: err.getErrors()
    });
  }

  // Tratamento específico para outros tipos de erros conhecidos
  if (err.name === 'SyntaxError') {
    return res.status(400).json({
      type: 'SyntaxError',
      message: 'Falha ao processar o corpo da requisição'
    });
  }

  // Erros genéricos - não exposmos detalhes internos para o cliente (segurança)
  return res.status(500).json({
    type: 'ServerError',
    message: 'Ocorreu um erro interno no servidor'
  });
};

/**
 * Middleware para tratamento de rotas não encontradas
 */
export const notFoundMiddleware = (
  req: Request,
  res: Response
) => {
  res.status(404).json({
    type: 'NotFoundError',
    message: `Rota não encontrada: ${req.method} ${req.path}`
  });
};

/**
 * Wrapper para capturar erros assíncronos em controllers
 * Permite que erros em promises sejam tratados pelo errorHandlerMiddleware
 */
export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };