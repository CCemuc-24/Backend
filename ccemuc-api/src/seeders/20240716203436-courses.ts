import { QueryInterface } from 'sequelize';

interface Course {
  title: string;
  description: string;
  type: 'CORE' | 'ELECTIVE' | 'WORKSHOP';
  price: number;
  capacity: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export = {
  async up(queryInterface: QueryInterface): Promise<void> {
    // Cursos a insertar
    const courses: Course[] = [
      {
        title: "Módulo Transversal",
        description: "Curso obligatorio para todos los asistentes. Cubre conceptos fundamentales aplicables a todas las áreas.",
        type: "CORE",
        price: 0,
        capacity: 1000,
        date: new Date('2024-08-01'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Electivo 1: Inteligencia Artificial Aplicada",
        description: "Exploración práctica de IA en diversos campos de ingeniería.",
        type: "ELECTIVE",
        price: 50000,
        capacity: 100,
        date: new Date('2024-08-02'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Electivo 2: Energías Renovables y Sostenibilidad",
        description: "Estudio de tecnologías y prácticas para un futuro sostenible.",
        type: "ELECTIVE",
        price: 50000,
        capacity: 100,
        date: new Date('2024-08-03'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Electivo 3: Robótica Avanzada",
        description: "Diseño y programación de sistemas robóticos complejos.",
        type: "ELECTIVE",
        price: 50000,
        capacity: 100,
        date: new Date('2024-08-09'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Electivo 4: Nanotecnología en Ingeniería",
        description: "Aplicaciones de la nanotecnología en diversos campos de la ingeniería.",
        type: "ELECTIVE",
        price: 50000,
        capacity: 100,
        date: new Date('2024-08-10'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Workshop: Diseño de Proyectos Innovadores",
        description: "Taller práctico para desarrollar habilidades en diseño de proyectos de ingeniería innovadores.",
        type: "WORKSHOP",
        price: 30000,
        capacity: 50,
        date: new Date('2024-08-04'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Workshop: Liderazgo en Ingeniería",
        description: "Desarrollo de habilidades de liderazgo esenciales para ingenieros.",
        type: "WORKSHOP",
        price: 30000,
        capacity: 50,
        date: new Date('2024-08-11'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Courses', courses);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.bulkDelete('Purchases', null, {});
    await queryInterface.bulkDelete('Courses', null, {});
  }
};