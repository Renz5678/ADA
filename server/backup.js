import fs from 'fs';
import { sequelize, models } from './src/models/index.js';

async function backup() {
  console.log("Starting backup process...");
  try {
    await sequelize.authenticate();
    console.log("Connected to database successfully.");

    const backupData = {};
    const modelNames = Object.keys(models);

    for (const modelName of modelNames) {
      console.log(`Exporting table: ${modelName}...`);
      const data = await models[modelName].findAll({ raw: true });
      backupData[modelName] = data;
    }

    const backupFile = `database_backup_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`\n✅ Backup completed successfully!`);
    console.log(`Saved ${modelNames.length} tables to ${backupFile}`);
  } catch (error) {
    console.error("❌ Backup failed:", error.message);
  } finally {
    await sequelize.close();
  }
}

backup();
