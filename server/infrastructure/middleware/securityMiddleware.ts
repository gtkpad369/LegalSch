import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para adicionar cabeçalhos de segurança
 * Implementa proteções contra ataques comuns conforme diretrizes OWASP
 */
export const securityHeadersMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Proteção contra XSS (Cross-Site Scripting) - OWASP A7
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Previne MIME sniffing - OWASP A6
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Política de mesma origem para frames (clickjacking protection) - OWASP A8
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Força HTTPS (quando em produção) - OWASP A3
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy - OWASP A7
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'"
  );
  
  // Política de referrer
  res.setHeader('Referrer-Policy', 'same-origin');
  
  next();
};

/**
 * Middleware para prevenção de ataques de CSRF (Cross-Site Request Forgery)
 * Implementa proteção contra CSRF - OWASP A8
 * 
 * Nota: Em uma implementação completa, seria utilizado um token CSRF
 * gerado no servidor e validado em cada requisição que modifica dados.
 */
export const csrfProtectionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Verifica se é uma requisição que modifica dados
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    // Em uma implementação real, aqui verificaríamos o token CSRF
    // Para simplificar, apenas verificamos o header Referer/Origin
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    
    // Verificação simplificada - em produção seria mais robusto
    if (!origin && !referer) {
      return res.status(403).json({
        error: 'Possível ataque CSRF detectado'
      });
    }
  }
  
  next();
};

/**
 * Middleware para limitação de taxa de requisições (Rate Limiting)
 * Proteção contra ataques de força bruta e DoS - OWASP A6
 * 
 * Nota: Em uma implementação completa, utilizaríamos uma biblioteca
 * como express-rate-limit e armazenamento como Redis para limitar requisições
 */
export const rateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Implementação simplificada - em produção usaríamos uma solução mais robusta
  // como express-rate-limit ou rate-limiter-flexible
  
  // Atualmente apenas passa para o próximo middleware
  // Em uma implementação real, manteríamos contagem de requisições
  next();
};