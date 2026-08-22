import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './services/roomService';
import roomRoutes from './routes/roomRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

const PORT = process.env.PORT || 3000;

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/rooms', roomRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend rodando na porta ${PORT}`);
  });
}

export { db };
export default app;
