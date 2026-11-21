const path = require('path');
const { readFile } = require('fs/promises');
const { sequelize } = require('../src/config/database');

const migrateAvatar = async () => {
  const migrationPath = path.resolve(__dirname, '../migrations/001-add-user-avatar.sql');
  const sql = await readFile(migrationPath, 'utf8');
  await sequelize.query(sql);
  console.log('User avatar migration applied.');
};

migrateAvatar()
  .catch((error) => {
    console.error('Avatar migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
