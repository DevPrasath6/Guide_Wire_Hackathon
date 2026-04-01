import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes.js';
import claimsRoutes from './routes/claimsRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import iamRoutes from './routes/iamRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { getDbHealth } from './config/db.js';
import { authRequired } from './middleware/auth.js';
import { requireRole, requirePermission } from './middleware/rbac.js';
import { PERMISSIONS } from './config/permissions.js';
import { swaggerSpec } from './docs/swagger.js';

const app = express();

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (no Origin header) and local dev frontends.
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('CORS origin not allowed'));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
    message: 'Earnings Shield API is running.',
    health: '/health',
    apiBase: '/api'
  });
});

app.get('/health', (_req, res) => {
  const dbHealth = getDbHealth();
  res.json({
    status: dbHealth.privateDbConnected && dbHealth.publicDbConnected ? 'ok' : 'degraded',
    private_db_connected: dbHealth.privateDbConnected,
    public_db_connected: dbHealth.publicDbConnected,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/iam', iamRoutes);
app.use('/api/ai', aiRoutes);

app.use('/api-docs', authRequired, requireRole('superadmin'), requirePermission(PERMISSIONS.API_DOCS_VIEW), swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err, _req, res, _next) => {
  console.error('unhandled_error', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

export default app;
