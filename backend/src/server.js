const app = require('./app');
const { createServer } = require('node:http');
const initializeSocket = require('./realtime/socket');
const env = require('./config/env');
const { sequelize, connectDatabase } = require('./config/database');

/*
 * IMPORTANT:
 * Load every Sequelize model + association before sequelize.sync().
 * Otherwise Sequelize does not know which tables it needs to create.
 */
require('./models');

const startServer = async () => {
  try {
    await connectDatabase();

    if (env.db.sync) {
      await sequelize.sync();
      console.log('Sequelize models synchronized.');
    }

    const httpServer = createServer(app);
    initializeSocket(httpServer);
    httpServer.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
      console.log(`Swagger UI: http://localhost:${env.port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
