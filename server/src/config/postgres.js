import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const requiredVars = [
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_DATABASE',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD'
];

const missingEnvVars = requiredVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`missing environment variables ${missingEnvVars}`);
    process.exit(1);
};

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE
});

export default pool;