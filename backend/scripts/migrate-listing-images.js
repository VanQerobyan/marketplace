const path = require('path');
const { readFile } = require('fs/promises');
const { sequelize } = require('../src/config/database');

const migrateListingImages = async () => {
  const migrationPath = path.resolve(__dirname, '../migrations/002-add-listing-images.sql');
  await sequelize.query(await readFile(migrationPath, 'utf8'));
  console.log('Listing images migration applied.');
};

migrateListingImages()
  .catch((error) => {
    console.error('Listing images migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
