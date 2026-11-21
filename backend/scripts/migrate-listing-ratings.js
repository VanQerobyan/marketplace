const path = require('path');
const { readFile } = require('fs/promises');
const { sequelize } = require('../src/config/database');

const migrateListingRatings = async () => {
  const migrationPath = path.resolve(__dirname, '../migrations/004-create-listing-ratings.sql');
  const sql = await readFile(migrationPath, 'utf8');
  await sequelize.transaction((transaction) => sequelize.query(sql, { transaction }));
  console.log('Listing ratings migration applied.');
};

migrateListingRatings()
  .catch((error) => {
    console.error('Listing ratings migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
