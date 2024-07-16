import { Sequelize } from 'sequelize-typescript';
import { databaseConfig, DatabaseConfig } from '../config/database';
import User from './user.model';
import Course from './course.model';

const env = process.env.NODE_ENV || 'development';
const config = databaseConfig[env as keyof DatabaseConfig];

if (!config) {
  throw new Error(`No database configuration found for environment: ${env}`);
}

export const sequelize = new Sequelize({
  ...config,
  models: [User, Course], // Especificar los modelos explícitamente
});