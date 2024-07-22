import { Dialect } from 'sequelize';

export interface DatabaseConfig {
  [key: string]: {
    username: string | undefined;
    password: string | undefined;
    database: string | undefined;
    host: string | undefined;
    port: number;
    dialect: Dialect;
    synchronize: boolean;
    seederStorage: 'sequelize' | 'sequelize-cli';
  };
}

export const databaseConfig: DatabaseConfig = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    synchronize: true,
    seederStorage: 'sequelize',
  },
};