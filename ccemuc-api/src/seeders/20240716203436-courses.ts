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
        type: CourseType.CORE,
        price: 0,
        capacity: 1000,
        week: 0,
        features: {
          "Modalidad": "13 sesiones presencial",
          "Lugar": "Campus Casa Central. Auditorio por definir.",
          "Fecha": "Sábados 31/08, 07/09 y 14/09",
          "Horario": "09:00 a 14:00 hrs."
        }
      },
      {
        title: "Módulo: Anestesiología",
        module: 6,
        type: CourseType.CORE,
        price: 0,
        capacity: 1000,
        week: 0,
        features: {
          "Modalidad": "5 clases on-line, asincrónico",
          "Lugar": "Clases disponibles en plataforma.",
        }
      },
      {
        title: "Módulo: Cirugía Digestiva y Colopractología",
        module: 2,
        type: CourseType.ELECTIVE,
        price: 25500,
        capacity: 100,
        week: 1,
        features: {
          "Modalidad": "9 sesiones on-line sincrónicas. 3 sesiones presencial",
          "Lugar": "Campus Casa Central. Auditorio por definir.",
          "Fecha": "L 02/09 - M 03/09 - W 04/09 - S 07/09",
          "Horario": "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        }
      },
      {
        title: "Módulo: Cirugía de Trauma y Urología",
        module: 3,
        type: CourseType.ELECTIVE,
        price: 25500,
        capacity: 100,
        week: 1,
        features: {
          "Modalidad": "9 sesiones on-line sincrónicas. 3 sesiones presencial",
          "Lugar": "Campus Casa Central. Auditorio por definir.",
          "Fecha": "L 02/09 - M 03/09 - W 04/09 - S 07/09",
          "Horario": "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        }
      },
      {
        title: "Módulo: Cirugía Plástica y Cirugía Oncológica",
        module: 4,
        type: CourseType.ELECTIVE,
        price: 0,
        capacity: 100,
        week: 2,
        features: {
          "Modalidad": "9 sesiones on-line sincrónicas. 3 sesiones presencial",
          "Lugar": "Campus Casa Central. Auditorio por definir.",
          "Fecha": "L 09/09 - M 10/09 - W 11/09 - S 14/09",
          "Horario": "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        }
      },
      {
        title: "Módulo: Cirugía de Tórax, Cardíaca y Vascular",
        module: 5,
        type: CourseType.ELECTIVE,
        price: 0,
        capacity: 100,
        week: 2,
        features: {
          "Modalidad": "9 sesiones on-line sincrónicas. 3 sesiones presencial",
          "Lugar": "Campus Casa Central. Auditorio por definir.",
          "Fecha": "L 09/09 - M 10/09 - W 11/09 - S 14/09",
          "Horario": "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        }
      },
      {
        title: "Workshop: Técnicas en cirugía menor",
        module: 7,
        type: CourseType.WORKSHOP,
        price: 3000,
        capacity: 100,
        week: 3,
        features: {
          "Modalidad": "9 sesiones on-line sincrónicas. 3 sesiones presencial",
          "Lugar": "Campus Casa Central. Auditorio por definir.",
          "Fecha": "L 02/09 - M 03/09 - W 04/09 - S 07/09",
          "Horario": "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        }
      },
      {
        title: "Workshop: Ultrasonido Clínico de urgencia",
        module: 8,
        type: CourseType.WORKSHOP,
        price: 3000,
        capacity: 100,
        week: 3,
        features: {
          "Modalidad": "9 sesiones on-line sincrónicas. 3 sesiones presencial",
          "Lugar": "Campus Casa Central. Auditorio por definir.",
          "Fecha": "L 02/09 - M 03/09 - W 04/09 - S 07/09",
          "Horario": "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
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
