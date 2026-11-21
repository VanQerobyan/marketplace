const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

module.exports = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'marketplace_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    sync: process.env.DB_SYNC === 'true'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() || '',
  stripeTestSecretKey: process.env.STRIPE_TEST_SECRET_KEY?.trim() || ''
};
