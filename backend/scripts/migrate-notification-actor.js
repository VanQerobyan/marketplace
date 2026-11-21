const path = require('path');
const { readFile } = require('fs/promises');
const { sequelize } = require('../src/config/database');

const migrateNotificationActor = async () => {
  const migrationPath = path.resolve(__dirname, '../migrations/003-add-notification-actor.sql');
  await sequelize.query(await readFile(migrationPath, 'utf8'));
  console.log('Notification actor migration applied.');
};

migrateNotificationActor()
  .catch((error) => {
    console.error('Notification actor migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
