import { sequelize } from '../models';
import Course from '../models/course.model';
import Purchase from '../models/purchase.model';
import { CourseType } from '../enums/course-type.enum';
import { CourseAttributes } from '../interfaces/course.interfaces';

export = {
  async up(): Promise<void> {
    await sequelize.sync();
    const courses: Omit<CourseAttributes, 'id'>[] = [
      {
        title: "Módulo Transversal",
        description: "Curso obligatorio para todos los asistentes. Cubre conceptos fundamentales aplicables a todas las áreas.",
        type: CourseType.CORE,
        price: 0,
        capacity: 1000,
        date: new Date('2024-08-01')
      },
      {
        title: "Electivo 1: Inteligencia Artificial Aplicada",
        description: "Exploración práctica de IA en diversos campos de ingeniería.",
        type: CourseType.ELECTIVE,
        price: 50000,
        capacity: 100,
        date: new Date('2024-08-02')
      },
      {
        title: "Electivo 2: Energías Renovables y Sostenibilidad",
        description: "Estudio de tecnologías y prácticas para un futuro sostenible.",
        type: CourseType.ELECTIVE,
        price: 50000,
        capacity: 100,
        date: new Date('2024-08-03')
      },
      {
        title: "Electivo 3: Robótica Avanzada",
        description: "Diseño y programación de sistemas robóticos complejos.",
        type: CourseType.ELECTIVE,
        price: 50000,
        capacity: 100,
        date: new Date('2024-08-09')
      },
      {
        title: "Electivo 4: Nanotecnología en Ingeniería",
        description: "Aplicaciones de la nanotecnología en diversos campos de la ingeniería.",
        type: CourseType.ELECTIVE,
        price: 50000,
        capacity: 100,
        date: new Date('2024-08-10')
      },
      {
        title: "Workshop: Diseño de Proyectos Innovadores",
        description: "Taller práctico para desarrollar habilidades en diseño de proyectos de ingeniería innovadores.",
        type: CourseType.WORKSHOP,
        price: 30000,
        capacity: 50,
        date: new Date('2024-08-04')
      },
      {
        title: "Workshop: Liderazgo en Ingeniería",
        description: "Desarrollo de habilidades de liderazgo esenciales para ingenieros.",
        type: CourseType.WORKSHOP,
        price: 30000,
        capacity: 50,
        date: new Date('2024-08-11')
      }
    ];

    for (const courseData of courses) {
      await Course.create(courseData);
    }

    console.log('Cursos creados exitosamente');
  },

  async down(): Promise<void> {
    await Purchase.destroy({ where: {} });
    await Course.destroy({ where: {} });
    console.log('Todos los cursos y compras han sido eliminados');
  }
};
