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
        title: "Módulo: Cirugía General",
        module: 1,
        description: "Curso obligatorio para todos los asistentes. Cubre conceptos fundamentales aplicables a todas las áreas.",
        type: CourseType.CORE,
        price: 0,
        capacity: 1000,
        week: 0,
        features: {
          "Modality": "13 sesiones presencial",
          "Location": "Campus Casa Central. Auditorio por definir.",
          "Dates": "Sábados 31/08, 07/09 y 14/09",
          "Schedule": "09:00 a 14:00 hrs."
        }
      },
      {
        title: "Módulo: Anestesiología",
        module: 6,
        description: "Curso sobre técnicas y manejo en anestesiología.",
        type: CourseType.CORE,
        price: 0,
        capacity: 1000,
        week: 0,
        features: {
          "Modality": "5 clases on-line, asincrónico",
          "Location": "Clases disponibles en plataforma.",
          "Dates": "",
          "Schedule": ""
        }
      },
      {
        title: "Módulo: Cirugía Digestiva",
        module: 2,
        description: "Curso avanzado en técnicas de cirugía digestiva.",
        type: CourseType.ELECTIVE,
        price: 10000,
        capacity: 100,
        week: 1,
        features: {
          "Modality": "9 sesiones on-line sincrónicas. 3 sesiones presencial",
          "Location": "Campus Casa Central. Auditorio por definir.",
          "Dates": "L 02/09 - M 03/09 - W 04/09 - S 07/09",
          "Schedule": "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        }
      },
      {
        title: "Módulo: Cirugía de Trauma y Urología",
        module: 3,
        description: "Curso sobre técnicas en cirugía de trauma y urología.",
        type: CourseType.ELECTIVE,
        price: 10000,
        capacity: 100,
        week: 1,
        features: {
          "Modality": "9 sesiones on-line sincrónicas. 3 sesiones presencial",
          "Location": "Campus Casa Central. Auditorio por definir.",
          "Dates": "L 02/09 - M 03/09 - W 04/09 - S 07/09",
          "Schedule": "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        }
      },
      {
        title: "Módulo: Cirugía Plástica y Cirugía Oncológica",
        module: 4,
        description: "Curso sobre técnicas en cirugía plástica y oncológica.",
        type: CourseType.ELECTIVE,
        price: 10000,
        capacity: 100,
        week: 2,
        features: {
          "Modality": "9 sesiones on-line sincrónicas. 3 sesiones presencial",
          "Location": "Campus Casa Central. Auditorio por definir.",
          "Dates": "L 09/09 - M 10/09 - W 11/09 - S 14/09",
          "Schedule": "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        }
      },
      {
        title: "Módulo: Cirugía de Tórax, Cardíaca y Vascular",
        module: 5,
        description: "Curso sobre técnicas en cirugía de tórax, cardíaca y vascular.",
        type: CourseType.ELECTIVE,
        price: 10000,
        capacity: 100,
        week: 2,
        features: {
          "Modality": "9 sesiones on-line sincrónicas. 3 sesiones presencial",
          "Location": "Campus Casa Central. Auditorio por definir.",
          "Dates": "L 09/09 - M 10/09 - W 11/09 - S 14/09",
          "Schedule": "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        }
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
