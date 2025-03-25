import { Application } from "./application/app";
import { setupVite, serveStatic, log } from "./vite";

// Configuração para logging de requisições API
const setupRequestLogging = (app: any) => {
  app.use((req: any, res: any, next: any) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson: any, ...args: any[]) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });
};

(async () => {
  // Inicializa a aplicação usando a classe Application
  const application = new Application();
  const app = application.getApp();

  // Configura logging de requisições
  setupRequestLogging(app);

  // Inicia o servidor na porta 5000
  await application.start(3333);

  const server = application.getServer();

  // Configura Vite para desenvolvimento ou serve arquivos estáticos em produção
  // Importante: A configuração Vite deve vir antes das rotas de 404 para capturar rotas de frontend
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Configurar o handler 404 somente depois do Vite
  application.setupNotFoundHandler();
})().catch((error) => {
  console.error("Erro na inicialização da aplicação:", error);
  process.exit(1);
});
