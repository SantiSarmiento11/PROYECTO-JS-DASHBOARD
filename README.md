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
