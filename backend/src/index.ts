import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { getConfig } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { performanceMonitor, performanceHealthCheck } from './middleware/performance';

// Load environment variables
dotenv.config();

// Validate environment and get typed config
const config = getConfig();

// Import routes
import nftRoutes from './routes/nft';
import marketplaceRoutes from './routes/marketplace';
import userRoutes from './routes/user';
import analyticsRoutes from './routes/analytics';
import baseRoutes from './routes/base';
import royaltiesRoutes from './routes/royalties';
import searchRoutes from './routes/search';
import verificationRoutes from './routes/verification';
import followsRoutes from './routes/follows';
import activityRoutes from './routes/activity';
import engagementRoutes from './routes/engagement';

const app: Express = express();
const PORT = config.port;

// ============================================
// Security Middleware
// ============================================

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
});

const uploadLimiter = rateLimit({
  windowMs: config.rateLimit.uploadWindowMs,
  max: config.rateLimit.uploadMaxRequests,
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
// Performance Monitoring
// ============================================

app.use(performanceMonitor);

// ============================================
// Request Logging Middleware
// ============================================

app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.http(req, res, duration);
  });
  
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
    environment: config.nodeEnv,
    network: config.network
  });
});

// Root route for quick info
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'BitArt Market API',
    docs: {
      health: '/api/health',
      nfts: '/api/nfts',
      marketplace: '/api/marketplace/listings',
      users: '/api/users/{address}',
      analytics: '/api/analytics/stats'
    }
  });
});

// API Routes
app.use('/api/nfts', nftRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/base', baseRoutes);
app.use('/api/royalties', royaltiesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/follows', followsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/engagement', engagementRoutes);
// 404 Handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler   error: 'Not Found',
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
  Environment: ${config.nodeEnv}
  Network: ${config.network}
  
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
