import express from 'express';
// reload comment
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import activityRoutes from './routes/activities';
import adminRoutes from './routes/admin';
import path from 'path';

dotenv.config();
console.log("[SERVER] DATABASE_URL:", process.env.DATABASE_URL);

const app = express();

// Middleware
app.use(cors({
  origin: '*', // For local dev and easy testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - body:`, req.body);
  next();
});

// Serve static uploaded files (PDFs, images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${PORT}`);
});
