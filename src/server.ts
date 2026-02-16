import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { executionRouter } from './modules/execution/http/execution.routes';
import { executionTaskRouter } from './modules/execution-task/http/execution-task.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { ExecutionEventConsumer } from './shared/messaging/ExecutionEventConsumer';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'execution-service' });
});

app.use('/auth', authRoutes);
app.use('/executions', executionRouter);
app.use('/execution-tasks', executionTaskRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || undefined;

  logger.error(`[${status}] ${message}`, err);

  res.status(status).json({ error: message, details });
});

app.listen(PORT, () => {
  logger.info(`Execution Service running on port ${PORT}`);

  const consumer = new ExecutionEventConsumer();
  consumer.start();
});

export default app;
