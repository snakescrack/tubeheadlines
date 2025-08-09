import { initializeDatabase } from '../src/utils/dbInit.js';

console.log('Starting database initialization script...');
initializeDatabase()
  .then(() => {
    console.log('Database initialization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error initializing database:', error);
    process.exit(1);
  });
