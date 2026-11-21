const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const listingRoutes = require('./routes/listing.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const ratingRoutes = require('./routes/rating.routes');
const notificationRoutes = require('./routes/notification.routes');
const messageRoutes = require('./routes/message.routes');
const paymentRoutes = require('./routes/payment.routes');

const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/error.middleware');
const { avatarsDirectory } = require('./middlewares/upload.middleware');
const { listingImagesDirectory } = require('./utils/listingImages');

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads/avatars', express.static(avatarsDirectory, { dotfiles: 'deny', index: false }));
app.use('/uploads/listings', express.static(listingImagesDirectory, { dotfiles: 'deny', index: false }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Marketplace API is running'
  });
});

app.use(
  '/swagger-assets',
  express.static(path.join(__dirname, 'public', 'swagger'))
);

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCssUrl: '/swagger-assets/swagger-theme.css',
    customSiteTitle: 'Marketplace API',
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      persistAuthorization: true,
      displayRequestDuration: true,
      deepLinking: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      tryItOutEnabled: false
    }
  })
);

app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
