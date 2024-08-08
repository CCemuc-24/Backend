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
        },
        topics: [
          "Innovaciones que Cambiaron el Curso de la Medicina",
          "Simulación y realidad virtual",
          "Conceptos generales del Pre y Postoperatorio",
          "Abdomen Agudo: Innovaciones en el Diagnóstico y Manejo Quirúrgico",
          "Conceptos Básicos de Laparoscopía para Estudiantes de la Salud",
          "Mejoras en Trasplante y Donación de Órganos",
          "El Rol del Protocolo ERAS en la Recuperación Rápida",
          "Cirugía robótica: avances en el estudio e implementación en Chile",
          "Cicatrización y materiales de sutura",
          "Inteligencia artificial en la investigación quirúrgica",
          "FORO: Toma de decisiones difíciles en pabellón",
          "FORO: Mujeres en cirugía"
        ]
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
        },
        topics: [
          "Riesgos y evaluación preoperatoria",
          "Urgencias anestésicas",
          "Monitorización anestésica",
          "Manejo de la vía aérea",
          "Mecanismos de la anestesia general"
        ]
      
      },
      {
        title: "Módulo: Cirugía Digestiva y Colopractología",
        module: 2,
        type: CourseType.ELECTIVE,
        price: 25900,
        capacity: 100,
        week: 1,
        features: {
          "Modalidad": "9 sesiones on-line sincrónicas. 3 sesiones presencial",
          "Lugar": "Campus Casa Central. Auditorio por definir.",
          "Fecha": "L 02/09 - M 03/09 - W 04/09 - S 07/09",
          "Horario": "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        },
        topics: [
          "Patología esofágica benigna",
          "Obesidad y cirugía bariátrica",
          "Cáncer esófagogástrico",
          "Patología benigna biliar",
          "Trasplante hepático",
          "Ictericia obstructiva de origen maligno",
          "Urgencias de colon",
          "Cáncer de colon y recto",
          "Técnicas básicas en Coloproctología: Hartmann, colectomías y ostomías"
        ]
      },
      {
        title: "Módulo: Cirugía de Trauma y Urología",
        module: 3,
        type: CourseType.ELECTIVE,
        price: 25900,
        capacity: 100,
        week: 1,
        features: {
          "Modalidad": "9 sesiones on-line sincrónicas. 3 sesiones presencial",
          "Lugar": "Campus Casa Central. Auditorio por definir.",
          "Fecha": "L 02/09 - M 03/09 - W 04/09 - S 07/09",
          "Horario": "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        },
        topics: [
          "Principales errores en la evaluación primaria de trauma",
          "Trauma torácico",
          "Trauma abdominal",
          "Cirugía de control de daños",
          "Trauma Urológico de Vía Urinaria Superior",
          "Litiasis urinaria",
          "Hiperplasia Prostática Benigna",
          "Diagnóstico en Cáncer de próstata",
          "Urgencias urológicas (tips and tricks)"
        ]
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
        },
        topics: [
          "Patología mamaria benigna y maligna",
          "Melanoma y sarcomas de partes blandas",
          "Nódulo tiroideo y cáncer de tiroides",
          "Cáncer de cabeza y cuello",
          "Manejo del trauma maxilofacial en la atención de urgencia",
          "Cicatrización y heridas",
          "Injertos y Colgajos",
          "Quemaduras",
          "Úlceras por presión"
        ]
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
        },
        topics: [
          "Nódulo y cáncer pulmonar",
          "Neumotórax y pleurostomía",
          "Derrame pleural",
          "Patología aórtica",
          "Cirugía Cardiovascular",
          "Enfermedad tromboembólica",
          "Pie diabético",
          "Enfermedad arterial oclusiva",
          "Abdomen agudo vascular"
        ]
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
        capacity: 60,
        week: 3,
        features: {
          "Modalidad": "9 sesiones on-line sincrónicas. 3 sesiones presencial",
          "Lugar": "Campus Casa Central. Auditorio por definir.",
          "Fecha": "L 02/09 - M 03/09 - W 04/09 - S 07/09",
          "Horario": "L-M-W de 18:30 a 20:45 hrs. S de 12:20 a 13:50 hrs."
        }
      },
      {
        title: "Curso de prueba",
        module: 9,
        type: CourseType.ELECTIVE,
        price: 50,
        capacity: 1000,
        week: 4,
        features: {
          "Modalidad": "13 sesiones presencial",
          "Lugar": "Campus Casa Central. Auditorio por definir.",
          "Fecha": "Sábados 31/08, 07/09 y 14/09",
          "Horario": "09:00 a 14:00 hrs."
        },
        topics: []
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
