require('dotenv').config();

const config = process.env.DATABASE_URL
  ? { 
      use_env_variable: 'DATABASE_URL', 
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    }
  : {
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT) || 5432,
      dialect: 'postgres'
    };

module.exports = {
  development: config,
  test: config,
  production: config
};
