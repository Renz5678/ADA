import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL.replace(':5432/', ':6543/');

const sequelize = new Sequelize(dbUrl, {
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

async function syncDb() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Authenticated successfully. Adding columns...');
        
        // Add flaggedForReview
        try {
            await sequelize.getQueryInterface().addColumn('Users', 'flaggedForReview', {
                type: sequelize.Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            });
            console.log('Added Users.flaggedForReview');
        } catch (e) {
            console.log('Users.flaggedForReview might already exist:', e.message);
        }

        try {
            await sequelize.getQueryInterface().addColumn('Clients', 'flaggedForReview', {
                type: sequelize.Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            });
            console.log('Added Clients.flaggedForReview');
        } catch (e) {
            console.log('Clients.flaggedForReview might already exist:', e.message);
        }

        // Add normalized_email
        try {
            await sequelize.getQueryInterface().addColumn('Users', 'normalized_email', {
                type: sequelize.Sequelize.STRING,
                allowNull: true
            });
            await sequelize.query(`UPDATE "Users" SET "normalized_email" = "email"`);
            console.log('Added Users.normalized_email');
        } catch (e) {
            console.log('Users.normalized_email might already exist:', e.message);
        }

        try {
            await sequelize.getQueryInterface().addColumn('Clients', 'normalized_email', {
                type: sequelize.Sequelize.STRING,
                allowNull: true
            });
            await sequelize.query(`UPDATE "Clients" SET "normalized_email" = "email"`);
            console.log('Added Clients.normalized_email');
        } catch (e) {
            console.log('Clients.normalized_email might already exist:', e.message);
        }

        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error('Failed:', e);
        process.exit(1);
    }
}

syncDb();
