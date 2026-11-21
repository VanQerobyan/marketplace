const path = require('path');
const { readFile } = require('fs/promises');
const { sequelize } = require('../src/config/database');

const migrateOrders = async () => {
  const sql = await readFile(path.resolve(__dirname, '../migrations/007-create-orders.sql'), 'utf8');
  await sequelize.transaction((transaction) => sequelize.query(sql, { transaction }));
  console.log('Orders migration applied.');
};

migrateOrders()
  .catch((error) => {
    console.error('Orders migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
