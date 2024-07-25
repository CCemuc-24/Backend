import { sequelize } from '../models';
import Course from '../models/course.model';
import Purchase from '../models/enrollment.model';
import { CourseType } from '../enums/course-type.enum';
import { CourseAttributes } from '../interfaces/course.interfaces';

export = {
  async up(): Promise<void> {
    await sequelize.sync();
    const courses: Omit<CourseAttributes, 'id'>[] = [
      {
        title: "Módulo 1: Cirugía General",
        description: "Curso obligatorio para todos los asistentes. Cubre conceptos fundamentales aplicables a todas las áreas.",
        type: CourseType.CORE,
        price: 0,
        capacity: 1000,
        date: new Date('2024-08-31'),
        week: 0,
        features: [
          "12 sesiones presencial",
          "Campus Casa Central. Auditorio por definir.",
          "Sábados 31/08, 07/09 y 14/09",
          "09:00 a 14:00 hrs."
        ],
      },
      {
        title: "Módulo 6: Anestesiología",
        description: "Curso sobre técnicas y manejo en anestesiología.",
        type: CourseType.CORE,
        price: 0,
        capacity: 1000,
        date: new Date('2024-09-01'),
        week: 0,
        features: [
          "5 clases on-line, asincrónico",
          "Clases disponibles en plataforma."
        ],
      },
      {
        title: "Módulo 2: Cirugía Digestiva",
        description: "Curso avanzado en técnicas de cirugía digestiva.",
        type: CourseType.ELECTIVE,
        price: 10000,
        capacity: 100,
        date: new Date('2024-09-02'),
        week: 1,
        features: [
          "9 sesiones on-line sincrónicas",
          "2 sesiones presencial",
          "Campus Casa Central. Auditorio por definir.",
          "L 02/09 - M 03/09 - W 04/09 - S 07/09",
          "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        ],
      },
      {
        title: "Módulo 3: Cirugía de Trauma y Urología",
        description: "Curso sobre técnicas en cirugía de trauma y urología.",
        type: CourseType.CORE,
        price: 10000,
        capacity: 100,
        date: new Date('2024-09-02'),
        week: 1,
        features: [
          "9 sesiones on-line sincrónicas",
          "2 sesiones presencial",
          "Campus Casa Central. Auditorio por definir.",
          "L 02/09 - M 03/09 - W 04/09 - S 07/09",
          "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        ],
      },
      {
        title: "Módulo 4: Cirugía Plástica y Cirugía Oncológica",
        description: "Curso sobre técnicas en cirugía plástica y oncológica.",
        type: CourseType.CORE,
        price: 10000,
        capacity: 100,
        date: new Date('2024-09-09'),
        week: 2,
        features: [
          "9 sesiones on-line sincrónicas",
          "2 sesiones presencial",
          "Campus Casa Central. Auditorio por definir.",
          "L 09/09 - M 10/09 - W 11/09 - S 14/09",
          "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        ],
      },
      {
        title: "Módulo 5: Cirugía de Tórax, Cardíaca y Vascular",
        description: "Curso sobre técnicas en cirugía de tórax, cardíaca y vascular.",
        type: CourseType.CORE,
        price: 10000,
        capacity: 100,
        date: new Date('2024-09-09'),
        week: 2,
        features: [
          "9 sesiones on-line sincrónicas",
          "2 sesiones presencial",
          "Campus Casa Central. Auditorio por definir.",
          "L 09/09 - M 10/09 - W 11/09 - S 14/09",
          "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        ],
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
