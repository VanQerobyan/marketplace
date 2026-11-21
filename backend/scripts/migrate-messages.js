const path = require('path');
const { readFile } = require('fs/promises');
const { sequelize } = require('../src/config/database');

const migrateMessages = async () => {
  const sql = await readFile(path.resolve(__dirname, '../migrations/005-create-messages.sql'), 'utf8');
  await sequelize.transaction((transaction) => sequelize.query(sql, { transaction }));
  console.log('Messages migration applied.');
};

migrateMessages()
  .catch((error) => {
    console.error('Messages migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
