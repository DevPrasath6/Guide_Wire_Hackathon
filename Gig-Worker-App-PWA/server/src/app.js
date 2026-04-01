const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Earnings Shield API',
      version: '1.0.0',
      description: 'API Documentation for Earnings Shield Backend',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
    if (!token) return res.status(401).json({ message: 'Missing token for API docs' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id).lean();
    if (!user || user.role !== 'superuser') {
      return res.status(403).json({ message: 'API docs are restricted to superuser' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token for API docs' });
  }
}, swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
const authRoutes = require('./routes/auth.routes');
const locationRoutes = require('./routes/location.routes');
const claimRoutes = require('./routes/claim.routes');
const alertRoutes = require('./routes/alert.routes');
const aiRoutes = require('./routes/ai.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const chatRoutes = require('./routes/chat.routes');
const notificationRoutes = require('./routes/notification.routes');

app.use('/api/auth', authRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Earnings Shield API is running' });
});

module.exports = app;
