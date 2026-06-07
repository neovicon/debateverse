import express from 'express';
import cors from 'cors';
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

export default app;
