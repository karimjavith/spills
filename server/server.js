import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import transactionsRouter from './api/transaction.js';
import savingsRouter from './api/savings.js';
import accountsRouter from './api/accounts.js';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/accounts', accountsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/savings', savingsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Proxy listening on port ${PORT}`));

export default app;
