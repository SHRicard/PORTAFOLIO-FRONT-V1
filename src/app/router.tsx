import type { ComponentType } from "react";
import { createBrowserRouter, ScrollRestoration } from "react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FullScreenSpinner } from "@/components/ui/Spinner";
import BlogPage from "@/pages/BlogPage";
import EntradaPage from "@/pages/EntradaPage";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProyectoPage from "@/pages/ProyectoPage";
import VistaPage from "@/pages/VistaPage";
import { GuestRoute } from "./routes/GuestRoute";
import { ProtectedRoute } from "./routes/ProtectedRoute";

/**
 * MAPA DE RUTAS
 *  /                web pública: el inicio de la vista elegida en Apariencia
 *  /:pagina         las demás páginas de esa vista (/sobre-mi, /contacto...)
 *  /proyectos/:slug un proyecto del portafolio
 *  /blog            las publicaciones del blog
 *  /blog/:slug      una publicación
 *  /login /register solo sin sesión (GuestRoute)
 *  /admin/*         solo con sesión (ProtectedRoute)
 *
 * Para sumar una página al panel: agregar su ruta dentro de /admin y su enlace en AdminLayout.
 */

/** Página que se baja recién cuando se entra a su ruta (el router espera el archivo antes de cambiar de página) */
const diferida = (cargar: () => Promise<{ default: ComponentType }>) => ({
  lazy: async () => ({ Component: (await cargar()).default }),
});

/** Todo el panel viene en un solo archivo: se baja una vez y después navegar adentro es instantáneo */
type Panel = typeof import("@/pages/admin");
const delPanel = (nombre: keyof Panel) => ({
  lazy: async () => ({ Component: (await import("@/pages/admin"))[nombre] }),
});

export const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollRestoration />
        <PublicLayout />
      </>
    ),
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/:pagina", element: <VistaPage /> },
      { path: "/proyectos/:slug", element: <ProyectoPage /> },
      { path: "/blog", element: <BlogPage /> },
      { path: "/blog/:slug", element: <EntradaPage /> },
    ],
  },
  {
    element: <GuestRoute />,
    HydrateFallback: FullScreenSpinner,
    children: [
      {
        lazy: async () => ({ Component: (await import("@/components/layout/AuthLayout")).AuthLayout }),
        children: [
          {
            path: "/login",
            // Mientras se escribe la contraseña ya va bajando el panel: al entrar no queda en blanco
            lazy: async () => {
              void import("@/pages/admin");
              return { Component: (await import("@/pages/LoginPage")).default };
            },
          },
          { path: "/register", ...diferida(() => import("@/pages/RegisterPage")) },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute />,
    HydrateFallback: FullScreenSpinner,
    children: [
      {
        ...delPanel("AdminLayout"),
        children: [
          { index: true, ...delPanel("DashboardPage") },
          { path: "proyectos", ...delPanel("ProyectosPage") },
          { path: "proyectos/nuevo", ...delPanel("ProyectoFormPage") },
          { path: "proyectos/:id", ...delPanel("ProyectoFormPage") },
          { path: "blog", ...delPanel("EntradasPage") },
          { path: "blog/nuevo", ...delPanel("EntradaFormPage") },
          { path: "blog/:id", ...delPanel("EntradaFormPage") },
          { path: "experiencia", ...delPanel("ExperienciaPage") },
          { path: "estudios", ...delPanel("EstudiosPage") },
          { path: "datos-publicos", ...delPanel("DatosPublicosPage") },
          { path: "archivos", ...delPanel("ArchivosPage") },
          { path: "perfil", ...delPanel("ProfilePage") },
          { path: "apariencia", ...delPanel("ThemePage") },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
