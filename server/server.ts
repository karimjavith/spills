// server.ts
import app from './app.js';

const PORT = Number(process.env.PORT ?? 4000);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Proxy listening on port ${PORT}`);
  });
}
