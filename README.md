# Portafolio de Ricardo Ramirez

**Mi identidad digital, en un solo lugar.**

Soy Ricardo, desarrollador Full Stack de Buenos Aires, Argentina. Desarrollo aplicaciones de punta a punta, con foco en React, React Native y Node.js.

Este es mi portafolio: el sitio donde reúno quién soy, los proyectos que construí, mi recorrido profesional y también lo que me gusta hacer cuando no estoy programando. Lo desarrollé yo mismo y tiene su propio panel de administración, así que mantengo todo mi contenido al día sin tocar el código.

[LinkedIn](https://www.linkedin.com/in/ramirez-ricardo-dev) · [GitHub](https://github.com/SHRicard)

## Qué vas a encontrar

| Sección | Qué muestra |
|---|---|
| **Sobre mí** | Quién soy, dónde estoy, cómo trabajo y si estoy disponible para nuevas oportunidades |
| **Proyectos** | Lo que construí: detalle, tecnologías, repositorios (el código y el APK de prueba) e imágenes |
| **Experiencia** | Mi trayectoria laboral, con logros y tecnologías de cada trabajo |
| **Estudios** | Carreras, cursos y certificaciones |
| **Habilidades e idiomas** | Mi stack por área y los idiomas que hablo |
| **Pasatiempos y datos curiosos** | El lado personal: lo que me gusta y me define fuera del trabajo |
| **Blog** | Mis publicaciones |
| **Contacto** | Correo, WhatsApp, llamada, videollamada y redes, con lo que estoy buscando |

## Tecnologías

### Frontend (este repositorio)

| Área | Tecnologías |
|---|---|
| Base | React, TypeScript, Vite |
| Estado y datos | Redux Toolkit, RTK Query |
| Navegación | React Router |
| Formularios y validación | React Hook Form, Zod |
| Estilos | Tailwind CSS, class-variance-authority |
| Iconos y tipografías | lucide-react, Fontsource |
| Pruebas | Vitest, jsdom |

### Backend (proyecto aparte)

| Área | Tecnologías |
|---|---|
| API | Node.js, Express, TypeScript |
| Base de datos | MongoDB, Mongoose |
| Seguridad | JWT, bcryptjs, Helmet, express-rate-limit, CORS |
| Validación | Zod |
| Imágenes y archivos | Cloudinary |

## Lo que tiene adentro

- **Panel de administración propio**: el Inicio es una vidriera con todos mis portafolios y el aplicado primero; el que aplico se guarda en el perfil y lo ven todos los visitantes. Cada portafolio tiene su propio tema, separado del del panel. Desde `/admin` gestiono proyectos, blog, experiencia, estudios, datos públicos y archivos. La navegación se elige entre tres estilos: Dock, Cápsula o Tabs arriba.
- **Apariencia del panel en vivo**: colores, navegación y tipografía del panel cambian al instante, sin recargar, y no tocan la web pública. Los colores se eligen de a pack: Negro y violeta, o Uva y neón. Elijo la fuente de los títulos entre 30 opciones y la de los subtítulos y el texto se combinan solas. El tema del panel todavía no se guarda; la vista web pública sí.
- **Arquitectura por features**: cada servicio del backend tiene su carpeta, con tipos, endpoints, validaciones y componentes.
- **Pruebas automatizadas**: la lógica, los formularios y las pantallas del panel se prueban con el backend simulado.

## Puesta en marcha

Necesitás Node.js 20 o superior y el backend del portafolio corriendo, con la URL de este front en su `CORS_ORIGIN`.

```bash
npm install
cp .env.example .env      # VITE_API_URL: la URL de tu backend (incluye /api)
npm run dev               # http://localhost:5173
```

| Script | Para qué |
|---|---|
| `npm run dev` | Desarrollo |
| `npm run build` | Verifica los tipos y genera la versión de producción |
| `npm run preview` | Sirve localmente la versión de producción |
| `npm run typecheck` | Verifica los tipos |
| `npm test` | Corre las pruebas |

## Variables de entorno

| Variable | Descripción | Por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API (incluye `/api`) | `http://localhost:4000/api` |

Las variables `VITE_*` son públicas porque viajan en el código del navegador: nunca hay que poner secretos en ellas.

## Features

| Feature | Carpeta |
|---|---|
| Sesión: login y perfil (sin registro: la app es de un solo dueño) | `src/features/auth` |
| Tema: colores, fuentes y formas | `src/features/theme` |
| Portafolio: lectura pública | `src/features/portafolio` |
| Panel: proyectos | `src/features/proyectos` |
| Panel: experiencia | `src/features/experiencia` |
| Panel: estudios | `src/features/estudios` |
| Panel: datos públicos | `src/features/perfil` |
| Panel: archivos, con subida a Cloudinary | `src/features/archivos` |
| Blog: web y panel | `src/features/blog` |

<details>
<summary><strong>Rutas</strong></summary>

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Web pública: el inicio de la vista guardada en el perfil (`perfil.vista`) | Todos |
| `/sobre-mi` | Sobre mí (en la vista RR-DEV, la bio, los datos curiosos y la trayectoria en una pantalla, sin scroll) | Todos |
| `/habilidades` | Habilidades (en la vista RR-DEV, una constelación por área con el logo de cada habilidad, en una pantalla, sin scroll) | Todos |
| `/proyectos` | Proyectos (en la vista RR-DEV, en fichas que se abren a cada lado de la Tierra, hasta 10 por página según la pantalla, sin scroll; `?ver=` abre uno en un panel y `?pagina=` cambia de página) | Todos |
| `/contacto` | Contacto (en la vista RR-DEV, las formas de contactarme en fichas que se abren, a cada lado, sin scroll) | Todos |
| `/proyectos/:slug` | Un proyecto del portafolio (en la vista RR-DEV, Proyectos con ese proyecto abierto en su panel; es a donde lleva «Ver en la web» del panel) | Todos |
| `/blog` | Las publicaciones del blog (en la vista RR-DEV, una constelación paginada que entra en la pantalla, sin scroll) | Todos |
| `/blog/:slug` | Una publicación (en la vista RR-DEV, abierta en un panel encima del blog) | Todos |
| `/login` | Ingresar, en un amanecer con el sol de Inicio (en la vista RR-DEV no hay botón: se llega con 7 toques seguidos al logo) | Solo sin sesión |
| `/admin` | Inicio del panel: la vidriera con todos los portafolios en tarjetas iguales, el aplicado primero | Con sesión |
| `/admin/proyectos` | Proyectos en una lista ordenada (miniatura, estado, tipo y fecha, lo que les falta): filtrar, ordenar y borrar | Administrador |
| `/admin/proyectos/nuevo` | Crear un proyecto | Administrador |
| `/admin/proyectos/:id` | Editar un proyecto, con vista previa. Quitar una foto ya guardada la borra también de Cloudinary | Administrador |
| `/admin/blog` | Lista de entradas del blog, ordenada como la de proyectos (miniatura, estado, etiquetas y fecha, lo que les falta): filtrar y borrar | Administrador |
| `/admin/blog/nuevo` | Crear una entrada | Administrador |
| `/admin/blog/:id` | Editar y publicar una entrada | Administrador |
| `/admin/experiencia` | Trabajos en una lista ordenada como la de proyectos: ver, ocultar y borrar | Administrador |
| `/admin/experiencia/nuevo` | Agregar un trabajo | Administrador |
| `/admin/experiencia/:id` | Editar un trabajo | Administrador |
| `/admin/estudios` | Estudios en una lista ordenada como la de proyectos: ver, ocultar y borrar | Administrador |
| `/admin/estudios/nuevo` | Agregar un estudio | Administrador |
| `/admin/estudios/:id` | Editar un estudio; el certificado se sube al guardar | Administrador |
| `/admin/datos-publicos` | Bio, habilidades, redes, foto y CV del portafolio, con vista previa; la foto y el CV se suben al guardar | Administrador |
| `/admin/archivos` | Biblioteca en una lista ordenada como la de proyectos (miniatura, tipo, tamaño y carpeta): subir, abrir, copiar el link y borrar | Administrador |
| `/admin/perfil` | Mi cuenta: los datos de login | Con sesión |
| `/admin/apariencia` | Apariencia: el tema del panel (provisorio) y la vista web pública | Con sesión |

**Administrador** es el usuario cuyo correo es `ADMIN_CORREO` en el backend. Cualquier otra cuenta entra al panel, pero el backend le responde 403 en esas pantallas.

El panel y `/login` se bajan recién al entrar a ellos: quien visita el portafolio no baja su código.

</details>

<details>
<summary><strong>Estructura del proyecto</strong></summary>

```
src/
├── app/              store, hooks tipados, router y guardias de ruta
├── services/api.ts   RTK Query base (token automático, manejo de 401)
├── features/         una carpeta por servicio del backend
├── vistas/           una carpeta por cada diseño de la web pública
├── components/       ui/ (Button, Card, Input...) y layout/
├── pages/            páginas (admin/ para el panel)
└── lib/              utilidades (cn, tokenStorage, errors, forms, color, redirect, validaciones, paginacion)
```

</details>

<details>
<summary><strong>Cómo funciona</strong></summary>

- **Peticiones**: todo pasa por RTK Query. El token se agrega solo a cada petición y, si el backend responde 401, la sesión se cierra y se redirige al login. Los endpoints de cada feature se agregan con `api.injectEndpoints`.
- **Sesión**: el token se guarda en `localStorage` (a través de `lib/tokenStorage.ts`) y Redux es la fuente de verdad mientras la app corre. Las rutas `/admin` verifican la sesión pidiendo el perfil.
- **Tema**: los colores, fuentes, redondeos y sombras son variables CSS que Tailwind lee en vivo (`bg-primario`, `font-titulo`, `rounded-card`...). Cambiar una variable cambia toda la app sin recargar. Las fuentes web vienen de Fontsource y cada visitante baja solo las que están en uso.
- **Ancho**: el contenido ocupa siempre el 90% del espacio disponible. Lo define la utilidad `contenedor` de `src/index.css` y lo aplican los layouts, no cada página.
- **Componentes**: un componente, varias variantes (`<Button estilo="contorno" />`, `<Card tipo="vidrio" />`) con `class-variance-authority`.

</details>

## Pruebas

`npm test` corre los tests con Vitest: capa de API y sesión (con `fetch` simulado), validaciones de formularios, utilidades, tema, portafolio y las pantallas del panel renderizadas con el backend simulado.

## Producción

- `npm run build` genera `dist/`, con archivos estáticos para cualquier hosting.
- Hay que configurar `VITE_API_URL` con la URL real del backend y agregar el dominio del front a `CORS_ORIGIN` del backend.
- Como es una app de una sola página, el hosting tiene que redirigir todas las rutas a `index.html`. Vercel, Netlify y Cloudflare Pages lo permiten con una regla o configuración.
