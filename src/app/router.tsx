import { createBrowserRouter, ScrollRestoration } from "react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import ArchivosPage from "@/pages/admin/ArchivosPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import DatosPublicosPage from "@/pages/admin/DatosPublicosPage";
import EntradaFormPage from "@/pages/admin/EntradaFormPage";
import EntradasPage from "@/pages/admin/EntradasPage";
import EstudiosPage from "@/pages/admin/EstudiosPage";
import ExperienciaPage from "@/pages/admin/ExperienciaPage";
import ProfilePage from "@/pages/admin/ProfilePage";
import ProyectoFormPage from "@/pages/admin/ProyectoFormPage";
import ProyectosPage from "@/pages/admin/ProyectosPage";
import ThemePage from "@/pages/admin/ThemePage";
import BlogPage from "@/pages/BlogPage";
import EntradaPage from "@/pages/EntradaPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProyectoPage from "@/pages/ProyectoPage";
import RegisterPage from "@/pages/RegisterPage";
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
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "proyectos", element: <ProyectosPage /> },
          { path: "proyectos/nuevo", element: <ProyectoFormPage /> },
          { path: "proyectos/:id", element: <ProyectoFormPage /> },
          { path: "blog", element: <EntradasPage /> },
          { path: "blog/nuevo", element: <EntradaFormPage /> },
          { path: "blog/:id", element: <EntradaFormPage /> },
          { path: "experiencia", element: <ExperienciaPage /> },
          { path: "estudios", element: <EstudiosPage /> },
          { path: "datos-publicos", element: <DatosPublicosPage /> },
          { path: "archivos", element: <ArchivosPage /> },
          { path: "perfil", element: <ProfilePage /> },
          { path: "apariencia", element: <ThemePage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
