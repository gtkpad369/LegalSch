import { Express } from 'express';
import { LawyerController } from './controllers/LawyerController';
import { AppointmentController } from './controllers/AppointmentController';
import { authMiddleware, ownerMiddleware } from '../infrastructure/middleware/authMiddleware';
import { rateLimitMiddleware, securityHeadersMiddleware } from '../infrastructure/middleware/securityMiddleware';

/**
 * Configura todas as rotas da API usando os controllers
 * @param app Express app
 */
export const setupRoutes = (app: Express): void => {
  // Middlewares globais de segurança
  app.use(securityHeadersMiddleware);
  app.use(rateLimitMiddleware);

  // Rotas de autenticação
  app.post('/api/auth/login', LawyerController.login);

  // Rotas de advogados públicas
  app.get('/api/lawyers/slug/:slug', LawyerController.getBySlug);
  app.get('/api/lawyers/:id', LawyerController.getById);
  app.post('/api/lawyers', LawyerController.create);

  // Rotas protegidas de advogados
  app.patch('/api/lawyers/:id', authMiddleware, ownerMiddleware, LawyerController.update);

  // Rotas de agendamentos públicas
  app.post('/api/appointments', AppointmentController.create);

  // Rotas protegidas de agendamentos
  app.get('/api/lawyers/:lawyerId/appointments', authMiddleware, AppointmentController.getByLawyerId);
  app.get('/api/appointments/:id', authMiddleware, AppointmentController.getById);
  app.patch('/api/appointments/:id', authMiddleware, AppointmentController.update);
  app.delete('/api/appointments/:id', authMiddleware, AppointmentController.delete);

  // Rota para a API de demonstração
  app.post('/api/seed-demo-data', async (req, res) => {
    // Implementação de seeds para demonstração
    res.json({ message: 'Dados de demonstração criados com sucesso!' });
  });
};