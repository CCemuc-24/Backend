import { Sequelize } from 'sequelize-typescript';
import { BaseSeed } from './BaseSeed';
import { CourseSeed } from './CourseSeed';

export class Seeder {
  private seeders: BaseSeed[];

  constructor(private sequelize: Sequelize) {
    this.seeders = [
      new CourseSeed(sequelize),
    ];
  }

  async up(): Promise<void> {
    for (const seeder of this.seeders) {
      await seeder.up();
    }
  }

  async down(): Promise<void> {
    for (const seeder of this.seeders.reverse()) {
      await seeder.down();
    }
  }
}

export async function runSeeders(sequelize: Sequelize, mode: 'up' | 'down' = 'up') {
  const seeder = new Seeder(sequelize);
  try {
    if (mode === 'up') {
      await seeder.up();
      console.log('Seeding completado exitosamente');
    } else {
      await seeder.down();
      console.log('Seeding revertido exitosamente');
    }
  } catch (error) {
    console.error(`Error durante el ${mode === 'up' ? 'seeding' : 'unseeding'}:`, error);
  }
}