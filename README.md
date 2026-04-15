# CampusBuild

Aplicación web para la gestión de proyectos de construcción. Permite registrar proyectos, actividades, hitos, recursos humanos y visualizar un cronograma general desde una interfaz centralizada, sin necesidad de backend.

## Descripción general

CampusBuild está construida como una SPA ligera en JavaScript modular. Toda la información se almacena en el navegador mediante `localStorage`, por lo que el proyecto puede ejecutarse de forma local sin instalar dependencias adicionales.

La aplicación está orientada a escenarios de seguimiento operativo en obras o proyectos constructivos, donde se necesita:

- Crear y administrar proyectos.
- Asociar actividades a cada proyecto.
- Registrar hitos importantes.
- Gestionar recursos humanos.
- Consultar un cronograma visual por fechas.
- Ver un panel con estadísticas generales.

## Funcionalidades principales

- CRUD de proyectos de construcción.
- CRUD de actividades con responsable, fechas y estado.
- CRUD de hitos asociados a proyectos.
- CRUD de recursos humanos.
- Panel de control con métricas rápidas.
- Cronograma mensual con visualización por rangos de fechas.
- Persistencia local con `localStorage`.
- Interfaz modular basada en Web Components.
- Modal global reutilizable para formularios y confirmaciones.
- Notificaciones visuales tipo toast.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript ES Modules
- Web Components nativos
- `localStorage` para persistencia de datos

## Estructura del proyecto

```text
PROYECTO-JS-W.A./
├── README.md
└── campusbuild/
    ├── css/
    │   └── styles.css
    ├── html/
    │   └── index.html
    └── js/
        ├── app.js
        ├── storage.js
        ├── projects.js
        ├── activities.js
        ├── resources.js
        └── calendar.js
```

## Módulos del sistema

### `campusbuild/html/index.html`

Archivo principal de la aplicación. Define la estructura visual general, la navegación lateral, las vistas del sistema, el modal global y el contenedor de notificaciones.

### `campusbuild/js/app.js`

Controla el arranque de la SPA, la navegación entre vistas, el modal global, los mensajes toast y el dashboard de estadísticas.

### `campusbuild/js/storage.js`

Capa de persistencia. Centraliza la lectura y escritura en `localStorage` bajo la clave:

```text
campusbuild_db
```

### `campusbuild/js/projects.js`

Gestiona el listado y mantenimiento de proyectos. Incluye eliminación en cascada de actividades e hitos asociados.

### `campusbuild/js/activities.js`

Gestiona actividades e hitos. Permite registrar fechas, estado, proyecto asociado y recurso responsable.

### `campusbuild/js/resources.js`

Administra el personal del proyecto. Incluye validaciones de identificación, salario, rol, ARL y tipo de sangre.

### `campusbuild/js/calendar.js`

Renderiza un cronograma mensual que muestra proyectos, hitos y actividades como barras distribuidas por rango de fechas.

## Modelo de datos

La aplicación maneja estas colecciones principales:

- `projects`
- `activities`
- `milestones`
- `resources`

Cada colección se guarda dentro de un único objeto JSON en `localStorage`.

## Cómo clonar el proyecto

```bash
git clone https://github.com/SantiSarmiento11/PROYECTO-JS-W.A.git
cd PROYECTO-JS-W.A
```

## Cómo ejecutar el proyecto

Como el proyecto usa módulos ES (`type="module"`), no es recomendable abrir el HTML directamente con doble clic. Lo ideal es levantar un servidor local.

### Opción 1: usando VS Code con Live Server

1. Abre la carpeta del proyecto en VS Code.
2. Instala la extensión `Live Server` si no la tienes.
3. Abre `campusbuild/html/index.html`.
4. Ejecuta `Open with Live Server`.

### Opción 2: usando Python

Desde la raíz del proyecto:

```bash
python3 -m http.server 5500
```

Luego abre en el navegador:

```text
http://localhost:5500/campusbuild/html/index.html
```

## Flujo de uso recomendado

1. Registrar recursos humanos.
2. Crear uno o varios proyectos.
3. Crear actividades y asignarlas a un proyecto y a un responsable.
4. Registrar hitos del proyecto.
5. Consultar el cronograma general.
6. Revisar el panel de control para ver el estado global.

## Validaciones y comportamiento

- No se puede crear una actividad sin proyecto.
- No se puede crear una actividad sin responsable.
- Las fechas finales no pueden ser anteriores a las fechas iniciales.
- La identificación del recurso debe ser un número entero positivo.
- El salario acepta decimales, pero no valores negativos.
- Al eliminar un proyecto, también se eliminan sus actividades e hitos relacionados.

## Persistencia de datos

Toda la información se guarda en el navegador. Esto implica:

- Los datos permanecen mientras no se limpie el almacenamiento del navegador.
- No existe sincronización entre diferentes dispositivos o navegadores.
- No hay autenticación ni backend.

Si deseas reiniciar la información del sistema, puedes borrar manualmente el `localStorage` del navegador.

## Estado actual del proyecto

Este proyecto corresponde a una solución frontend local orientada a gestión operativa. Su arquitectura es sencilla, modular y adecuada para pruebas técnicas, prototipos o ejercicios académicos relacionados con:

- manipulación del DOM,
- persistencia en cliente,
- componentes reutilizables,
- organización modular en JavaScript.

## Posibles mejoras futuras

- Integración con backend y base de datos real.
- Autenticación de usuarios.
- Filtros avanzados por estado, responsable o rango de fechas.
- Exportación de reportes.
- Dashboard con gráficos.
- Validaciones más robustas de negocio.
- Pruebas automatizadas.

## Autor

Repositorio de referencia:

```text
https://github.com/SantiSarmiento11/PROYECTO-JS-W.A
```
