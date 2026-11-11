# CampusBuild - Sistema de Control y Gestion de Proyectos de Construccion

Plataforma web tipo Single Page Application (SPA) para la administracion integral de obras constructivas, control de inventario de materiales, cronogramas de actividades y asignacion de talento humano.

[![Dominio](https://img.shields.io/badge/Dominio-Gestion%20de%20Obras%20Civiles-0052CC.svg)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E.svg)]()
[![HTML5](https://img.shields.io/badge/HTML5-Semantico-E34F26.svg)]()
[![CSS3](https://img.shields.io/badge/CSS3-Modular-1572B6.svg)]()
[![Storage](https://img.shields.io/badge/Persistencia-LocalStorage-blueviolet.svg)]()

## Resumen Ejecutivo

La industria de la construccion demanda una coordinacion milimetrica entre cronogramas de obra, suministro de insumos criticos y disponibilidad de personal calificado. CampusBuild soluciona esta problematica operativa proveyendo un centro de control ligero, rapido y sin dependencias de infraestructura de backend compleja. Su almacenamiento local en el navegador permite una adopcion inmediata en campo o puestos de control de obra con conectividad limitada.

## Alcance y Objetivos de Negocio

- Registro y seguimiento de ciclo de vida de proyectos constructivos (Planificacion, En Curso, Pausado, Finalizado).
- Desglose de actividades operativas con responsables asignados, fechas limite y estados de cumplimiento.
- Gestion y consumo de inventario de materiales con alertas visuales de nivel critico de existencias.
- Calendario interactivo de hitos y plazos de entrega para directores y residentes de obra.
- Cuadro de mando (Dashboard) con indicadores cuantitativos y metricas de avance en tiempo real.

## Arquitectura del Sistema

CampusBuild esta disenado bajo un patron arquitectonico modular en JavaScript puro (Vanilla JS):
1. Capa de Persistencia y Acceso a Datos (`storage.js`):
   Encapsula las operaciones de lectura, escritura y serializacion sobre la API de `localStorage`.
2. Capa de Modelos y Controladores de Dominio (`projects.js`, `activities.js`, `materiales.js`, `resources.js`, `calendar.js`):
   Contiene las reglas de negocio, validaciones y calculo de estados de cada entidad.
3. Capa de Orquestacion y Enlace (`app.js`):
   Coordina la inicializacion, eventos de interfaz y actualizacion sincronizada de vistas.
4. Capa de Presentacion (`index.html`, `styles.css`):
   Estructura visual reactiva con retroalimentacion inmediata al usuario.

### Diagrama de Flujo Arquitectonico

```mermaid
flowchart TD
    A[Usuario / Director de Obra] -->|Acciones de Interfaz / Formularios| B[CampusBuild UI Controller app.js]
    B --> C[Modulo de Proyectos projects.js]
    B --> D[Modulo de Actividades activities.js]
    B --> E[Modulo de Materiales materiales.js]
    B --> F[Modulo de Recursos resources.js]
    B --> G[Modulo de Calendario calendar.js]
    C --> H[Capa de Almacenamiento Central storage.js]
    D --> H
    E --> H
    F --> H
    G --> H
    H <-->|JSON Serialization| I[(Navegador LocalStorage API)]
    H --> J[Actualizador de Metricas y Dashboard KPIs]
    J --> A
```

### Estructura de Directorios

```text
PROYECTO-JS-DASHBOARD/
├── README.md                    # Documentacion tecnica integral
└── campusbuild/
    ├── css/
    │   └── styles.css           # Diseno visual, variables globales y grillas responsivas
    ├── html/
    │   └── index.html           # Documento principal y contenedor de vistas dinamicas
    └── js/
        ├── app.js               # Punto de entrada, inicializador y manejador global de eventos
        ├── storage.js           # Repositorio de persistencia y serializacion LocalStorage
        ├── projects.js          # Logica empresarial de creacion y estado de proyectos
        ├── activities.js        # Administracion de tareas, checklist y estados de ejecucion
        ├── materiales.js        # Control de insumos, entradas, salidas y alertas de stock
        ├── resources.js         # Gestion de personal operativo y contratistas
        └── calendar.js          # Renderizado de cronograma mensual y visualizacion de fechas
```

## Stack Tecnologico

El sistema esta concebido para maxima eficiencia de ejecucion, prescindiendo de compiladores o dependencias externas pesadas.

### Logica y Persistencia de Datos

- ![JavaScript](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) Sintaxis moderna con modulos, promesas y funciones flecha.
- ![Web Storage](https://img.shields.io/badge/LocalStorage_Persistence-0052CC?style=for-the-badge&logo=googlechrome&logoColor=white) Almacenamiento semi-permanente local con serializacion JSON.
- ![JSON](https://img.shields.io/badge/JSON_Format-000000?style=for-the-badge&logo=json&logoColor=white) Formato de intercambio de objetos de datos estructurados.

### Maquetacion y Diseno de Interfaz

- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) Estructura semantica con soporte de modales y formularios validados.
- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) Hojas de estilo estructuradas con CSS Grid y Flexbox adaptativo.
- ![Google Fonts](https://img.shields.io/badge/Google_Fonts-4285F4?style=for-the-badge&logo=googlefonts&logoColor=white) Tipografia tecnica y moderna para lectura clara de datos numericos.
