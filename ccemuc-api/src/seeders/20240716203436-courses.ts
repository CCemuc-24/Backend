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
        title: "Módulo 1: Cirugía General",
        description: "Curso obligatorio para todos los asistentes. Cubre conceptos fundamentales aplicables a todas las áreas.",
        type: CourseType.CORE,
        price: 0,
        capacity: 1000,
        date: new Date('2024-08-31'),
        week: 0,
        features: [
          "Presencial (12 sesiones)",
          "Campus Casa Central. Auditorio por definir.",
          "Fechas: Sábados 31/08, 07/09 y 14/09",
          "Horario: 09:00 a 14:00 hrs."
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
          "On-line, asincrónico (5 clases)",
          "Las clases estarán disponibles a través de una plataforma."
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
          "On-line sincrónicas a través de la plataforma Zoom (9 sesiones) y presencial (2 sesiones)",
          "Campus Casa Central. Auditorio por definir.",
          "Fechas: lunes 02/09, martes 03/09, miércoles 04/09 y sábado 07/09",
          "Horario: lunes, martes, miércoles de 18:30 a 20:45 hrs. Sábado de 12:20 a 13:50 hrs."
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
          "On-line sincrónicas a través de la plataforma Zoom (9 sesiones) y presencial (2 sesiones)",
          "Campus Casa Central. Auditorio por definir.",
          "Fechas: lunes 02/09, martes 03/09, miércoles 04/09 y sábado 07/09",
          "Horario: lunes, martes, miércoles de 18:30 a 20:45 hrs. Sábado de 12:20 a 13:50 hrs."
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
          "On-line sincrónicas a través de la plataforma Zoom (9 sesiones) y presencial (2 sesiones)",
          "Campus Casa Central. Auditorio por definir.",
          "Fechas: lunes 09/09, martes 10/09, miércoles 11/09 y sábado 14/09",
          "Horario: lunes, martes, miércoles de 18:30 a 20:45 hrs. Sábado de 12:20 a 13:50 hrs."
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
          "On-line sincrónicas a través de la plataforma Zoom (9 sesiones) y presencial (2 sesiones)",
          "Campus Casa Central. Auditorio por definir.",
          "Fechas: lunes 09/09, martes 10/09, miércoles 11/09 y sábado 14/09",
          "Horario: lunes, martes, miércoles de 18:30 a 20:45 hrs. Sábado de 12:20 a 13:50 hrs."
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
