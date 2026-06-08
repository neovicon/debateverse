import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import personaRoutes from './routes/personaRoutes.js';
import debateRoutes from './routes/debateRoutes.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL })); // Allow specific frontend origin
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DebateVerse API is running' });
});

// Import and use routes here later
app.use('/api/auth', authRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/debates', debateRoutes);

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// In production, serve static files from the Vite build output
if (isProduction) {
  const clientPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientPath));
  
  // Fallback route: serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientPath, 'index.html'));
  });
}

export default app;
