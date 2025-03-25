import express from 'express';
import { seedDemoData } from '../../infrastructure/seed';

const router = express.Router();

// Rota para criar dados de demonstração
router.post('/seed', async (req, res) => {
  const result = await seedDemoData();
  res.json(result);
});

export default router;