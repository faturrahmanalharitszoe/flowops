import cors from 'cors';
import express from 'express';
import { healthRouter } from './routes/health';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ?? true,
    }),
  );
  app.use(express.json());

  app.use('/health', healthRouter);

  return app;
}
