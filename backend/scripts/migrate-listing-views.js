const path = require('path');
const { readFile } = require('fs/promises');
const { sequelize } = require('../src/config/database');

const migrateListingViews = async () => {
  const sql = await readFile(path.resolve(__dirname, '../migrations/008-create-listing-views.sql'), 'utf8');
  await sequelize.transaction((transaction) => sequelize.query(sql, { transaction }));
  console.log('Listing views migration applied.');
};

migrateListingViews()
  .catch((error) => {
    console.error('Listing views migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
