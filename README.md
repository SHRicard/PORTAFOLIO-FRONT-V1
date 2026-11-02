# Frontend Template

Base reutilizable: **Vite + React + TypeScript + Redux Toolkit (RTK Query) + Tailwind + lucide-react**, con React Router, React Hook Form + Zod y `class-variance-authority`.
Trae lo esencial: manejo de sesión contra el backend, rutas protegidas, panel, sistema de tema en vivo y componentes base con variantes. Se amplía feature por feature.

> Reglas y arquitectura para trabajar en este proyecto: [`CLAUDE.md`](./CLAUDE.md).
> Contratos del backend: [`docs/api/`](./docs/api). Documentación de cada feature: [`docs/`](./docs).

## Puesta en marcha

```bash
npm install
cp .env.example .env      # VITE_API_URL: la URL de tu backend (incluye /api)
npm run dev               # http://localhost:5173
```

Necesita el backend corriendo y su URL en `CORS_ORIGIN` del `.env` del back.

Scripts: `dev` · `build` (typecheck + producción) · `preview` · `typecheck` · `test`.

## Features

| Feature | Carpeta | Contrato del backend | Documentación |
|---|---|---|---|
| Sesión: registro, login, perfil | `src/features/auth` | [LOGIN.md](./docs/api/LOGIN.md) | [AUTH.md](./docs/AUTH.md) |
| Tema (colores, fuentes, formas) | `src/features/theme` | — (pendiente: preferencias) | [THEME.md](./docs/THEME.md) |
| Portafolio: lectura pública | `src/features/portafolio` | [IMPLEMENTACION_ME.md](./docs/api/IMPLEMENTACION_ME.md) | [PORTAFOLIO.md](./docs/PORTAFOLIO.md) |
| Panel: proyectos | `src/features/proyectos` | [PROYECTOS.md](./docs/api/PROYECTOS.md) | [PROYECTOS.md](./docs/PROYECTOS.md) |
| Panel: experiencia | `src/features/experiencia` | [EXPERIENCIA.md](./docs/api/EXPERIENCIA.md) | [EXPERIENCIA.md](./docs/EXPERIENCIA.md) |
| Panel: estudios | `src/features/estudios` | [ESTUDIOS.md](./docs/api/ESTUDIOS.md) | [ESTUDIOS.md](./docs/ESTUDIOS.md) |
| Panel: datos públicos | `src/features/perfil` | [PERFIL.md](./docs/api/PERFIL.md) | [PERFIL.md](./docs/PERFIL.md) |
| Panel: archivos (subida a Cloudinary) | `src/features/archivos` | [ARCHIVOS.md](./docs/api/ARCHIVOS.md) | [ARCHIVOS.md](./docs/ARCHIVOS.md) |
| Blog: web y panel | `src/features/blog` | [BLOG.md](./docs/api/BLOG.md) | [BLOG.md](./docs/BLOG.md) |

> Cada feature nueva se agrega a esta tabla junto con su documento `docs/<FEATURE>.md`.

## Rutas

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Web pública: el portafolio | Todos |
| `/proyectos/:slug` | Un proyecto del portafolio | Todos |
| `/blog` | Las publicaciones del blog | Todos |
| `/blog/:slug` | Una publicación | Todos |
| `/login`, `/register` | Ingresar y crear cuenta | Solo sin sesión |
| `/admin` | Inicio del panel | Con sesión |
| `/admin/proyectos` | Lista de proyectos: filtrar, ordenar y borrar | Administrador |
| `/admin/proyectos/nuevo` | Crear un proyecto | Administrador |
| `/admin/proyectos/:id` | Editar un proyecto | Administrador |
| `/admin/blog` | Lista de entradas del blog: filtrar y borrar | Administrador |
| `/admin/blog/nuevo` | Crear una entrada | Administrador |
| `/admin/blog/:id` | Editar y publicar una entrada | Administrador |
| `/admin/experiencia` | Ver, agregar, editar y ocultar trabajos | Administrador |
| `/admin/estudios` | Ver, agregar, editar y ocultar estudios | Administrador |
| `/admin/datos-publicos` | Bio, habilidades, redes, foto y CV del portafolio | Administrador |
| `/admin/archivos` | Biblioteca: subir, copiar el link y borrar | Administrador |
| `/admin/perfil` | Mi cuenta: los datos de login | Con sesión |
| `/admin/apariencia` | Apariencia: prueba del tema en vivo (provisoria) | Con sesión |

> **Administrador** = el usuario cuyo correo es `ADMIN_CORREO` en el backend. Cualquier otra cuenta entra al panel, pero el backend le responde 403 en estas pantallas.

## Estructura

```
├── CLAUDE.md             reglas y arquitectura del proyecto
├── .claude/skills/       new-feature, docs-sync y security-review
├── docs/
│   ├── api/              contratos del backend (copiados desde el back)
│   └── *.md              un documento por feature + _TEMPLATE.md
└── src/
    ├── app/              store, hooks tipados, router y guardias de ruta
    ├── services/api.ts   RTK Query base (token automático, manejo de 401)
    ├── features/         una carpeta por servicio del backend
    ├── components/       ui/ (Button, Card, Input...) y layout/
    ├── pages/            páginas (admin/ para el panel)
    └── lib/              utilidades (cn, tokenStorage, errors, forms, color, redirect, validaciones, paginacion)
```

## Cómo funciona (resumen)

- **Peticiones**: todo pasa por RTK Query. El token se agrega solo a cada petición y, si el backend responde 401, la sesión se cierra y se redirige al login. Los endpoints de cada feature se agregan con `api.injectEndpoints`.
- **Sesión**: el token se guarda en `localStorage` (a través de `lib/tokenStorage.ts`) y Redux es la fuente de verdad mientras la app corre. Las rutas `/admin` verifican la sesión pidiendo el perfil.
- **Tema**: los colores, fuentes, redondeos y sombras son variables CSS que Tailwind lee en vivo (`bg-primario`, `font-titulo`, `rounded-card`...). Cambiar una variable cambia toda la app sin recargar. Las fuentes web vienen de Fontsource (npm) y cada visitante baja solo las que están en uso.
- **Componentes**: un componente, varias variantes (`<Button estilo="contorno" />`, `<Card tipo="vidrio" />`) con `class-variance-authority`.

## Variables de entorno

| Variable | Descripción | Por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API (incluye `/api`) | `http://localhost:4000/api` |

Las variables `VITE_*` son públicas (viajan en el código del navegador): nunca poner secretos.

## Pruebas

`npm test` corre los tests con Vitest: capa de API y sesión (con `fetch` simulado), validaciones de formularios, utilidades, tema, portafolio y las pantallas del panel renderizadas con el backend simulado (`src/pages/admin/panel.test.tsx`).

## Producción

- `npm run build` genera `dist/` (archivos estáticos para cualquier hosting).
- Configurar `VITE_API_URL` con la URL real del backend y agregar el dominio del front a `CORS_ORIGIN` del backend.
- Como es una app de una sola página, el hosting tiene que redirigir todas las rutas a `index.html` (Vercel, Netlify y Cloudflare Pages lo permiten con una regla o configuración).
# PORTAFOLIO-FRONT-V1
