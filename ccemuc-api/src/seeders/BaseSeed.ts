import { Sequelize } from 'sequelize-typescript';

export abstract class BaseSeed {
  constructor(protected sequelize: Sequelize) {}

  abstract up(): Promise<void>;
  abstract down(): Promise<void>;
}