import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-ratelimit';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import nftRoutes from './routes/nft';
import marketplaceRoutes from './routes/marketplace';
import userRoutes from './routes/user';
import analyticsRoutes from './routes/analytics';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// ============================================
// Security Middleware
// ============================================

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: 'Too many uploads from this IP, please try again later.',
});

app.use('/api/', limiter);
app.use('/api/upload/', uploadLimiter);

// ============================================
// Body Parsing Middleware
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// Request Logging Middleware
// ============================================

app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// Routes
// ============================================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    network: process.env.NETWORK || 'testnet'
  });
});

// API Routes
app.use('/api/nfts', nftRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// ============================================
// Error Handling Middleware
// ============================================

interface ErrorResponse {
  error: string;
  status: number;
  message?: string;
  timestamp: string;
}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const errorResponse: ErrorResponse = {
    error: err.name || 'Error',
    status,
    message,
    timestamp
  };

  console.error(`[${timestamp}] Error: ${message}`, err);

  res.status(status).json(errorResponse);
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    status: 404,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Server Startup
// ============================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║     BitArt Market Backend Started     ║
╚═══════════════════════════════════════╝
  
  Server: http://localhost:${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  Network: ${process.env.NETWORK || 'testnet'}
  
  API Documentation:
  - GET    /api/health                 - Health check
  - GET    /api/nfts                   - List NFTs
  - POST   /api/nfts                   - Create NFT
  - GET    /api/nfts/:id               - Get NFT details
  - GET    /api/marketplace/listings   - Get marketplace listings
  - POST   /api/marketplace/listings   - Create listing
  - GET    /api/users/:address         - Get user profile
  - GET    /api/analytics/stats        - Get marketplace stats
  
  Listening on port ${PORT}...
  `);
});

export default app;
