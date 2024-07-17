import { Dialect } from 'sequelize';

export interface DatabaseConfig {
  [key: string]: {
    username: string;
    password: string;
    database: string;
    host: string;
    dialect: Dialect;
    synchronize: boolean;
    seederStorage: 'sequelize' | 'sequelize-cli';
  };
}

export const databaseConfig: DatabaseConfig = {
  development: {
    username: 'ccemuc',
    password: 'ccemuc',
    database: 'ccemuc_development_db',
    host: 'db-ccemuc',
    dialect: 'postgres',
    synchronize: true,
    seederStorage: 'sequelize',
  },
};