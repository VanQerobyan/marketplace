const path = require('path');
const { readFile } = require('node:fs/promises');
const { sequelize } = require('../src/config/database');

const migrate = async () => {
  const sql = await readFile(path.resolve(__dirname, '../migrations/006-add-google-auth.sql'), 'utf8');
  await sequelize.query(sql);
  console.log('Google authentication migration applied.');
};

migrate()
  .catch((error) => {
    console.error('Google authentication migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
