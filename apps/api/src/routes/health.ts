import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  let database: 'up' | 'down';

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'up';
  } catch {
    database = 'down';
  }

  res.status(200).json({
    status: 'ok',
    database,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
