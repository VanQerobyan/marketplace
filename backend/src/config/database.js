const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'postgres',
  logging: env.nodeEnv === 'development' ? console.log : false
});

const connectDatabase = async () => {
  await sequelize.authenticate();
  console.log('PostgreSQL connection established.');
};

module.exports = {
  sequelize,
  connectDatabase
};
