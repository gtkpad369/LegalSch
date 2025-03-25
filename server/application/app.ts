import express, { Express } from 'express';
import { Server } from 'http';
import path from 'path';
import session from 'express-session';
import MemoryStore from 'memorystore';
import multer from 'multer';
import cors from 'cors';
import { setupRoutes } from '../presentation/routes';
import { errorHandlerMiddleware, notFoundMiddleware } from '../infrastructure/middleware/errorHandlerMiddleware';
import { log } from '../vite';

/**
 * Configuração da aplicação Express seguindo Clean Architecture
 * Isola a configuração do framework da lógica de negócio
 */
export class Application {
  private app: Express;
  private server!: Server; // Using definite assignment assertion

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupFileSystem();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares() {
    // Parser de JSON
    this.app.use(express.json());

    // Parser de URL encoded
    this.app.use(express.urlencoded({ extended: true }));

    // CORS
    this.app.use(cors());

    // Configuração de sessão
    const MemorySessionStore = MemoryStore(session);
    this.app.use(session({
      secret: process.env.SESSION_SECRET || 'jurisagenda-development-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 86400000 }, // 24 horas
      store: new MemorySessionStore({ checkPeriod: 86400000 }) // 24 horas
    }));
  }

  private setupFileSystem() {
    // Configuração para upload de arquivos
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'uploads'));
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
      }
    });

    const upload = multer({ 
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        // Lista de tipos MIME permitidos
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          // @ts-ignore: O tipo do callback permite receber um erro
          cb(new Error('Tipo de arquivo não permitido'), false);
        }
      }
    });

    // Middleware global para uploads
    this.app.use((req, res, next) => {
      // @ts-ignore
      req.upload = upload;
      next();
    });

    // Servir arquivos estáticos da pasta uploads
    this.app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  }

  private setupRoutes() {
    // Configura as rotas da API
    setupRoutes(this.app);
  }

  private setupErrorHandling() {
    // Middleware para tratamento de erros
    this.app.use(errorHandlerMiddleware);
  }
  
  /**
   * Configura middleware para rotas não encontradas
   * Este método deve ser chamado após a configuração do Vite
   */
  public setupNotFoundHandler() {
    // Middleware para rotas não encontradas
    this.app.use(notFoundMiddleware);
  }

  /**
   * Inicia o servidor da aplicação
   * @param port Porta onde o servidor será iniciado
   * @returns Promise resolvida quando o servidor estiver rodando
   */
  public start(port: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.server = this.app.listen(port, () => {
        log(`Servidor rodando na porta ${port}`);
        resolve();
      });
    });
  }

  /**
   * Obtém a instância do aplicativo Express
   * @returns Express app
   */
  public getApp(): Express {
    return this.app;
  }

  /**
   * Obtém a instância do servidor HTTP
   * @returns HTTP Server
   */
  public getServer(): Server {
    return this.server;
  }
}