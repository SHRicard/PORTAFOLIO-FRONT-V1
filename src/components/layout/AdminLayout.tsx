import { Link, NavLink, Outlet } from "react-router";
import {
  BriefcaseBusiness,
  FolderKanban,
  Globe,
  GraduationCap,
  IdCard,
  Images,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Palette,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useAppDispatch } from "@/app/hooks";
import { sessionEnded } from "@/features/auth/authActions";
import { useGetMeQuery } from "@/features/auth/authApi";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * Para sumar una sección al panel: agregar una entrada acá y su ruta en src/app/router.tsx
 */
const NAV_ITEMS: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: "/admin", label: "Inicio", icon: LayoutDashboard, end: true },
  { to: "/admin/proyectos", label: "Proyectos", icon: FolderKanban },
  { to: "/admin/blog", label: "Blog", icon: Newspaper },
  { to: "/admin/experiencia", label: "Experiencia", icon: BriefcaseBusiness },
  { to: "/admin/estudios", label: "Estudios", icon: GraduationCap },
  { to: "/admin/datos-publicos", label: "Datos públicos", icon: IdCard },
  { to: "/admin/archivos", label: "Archivos", icon: Images },
  { to: "/admin/perfil", label: "Mi cuenta", icon: UserRound },
  { to: "/admin/apariencia", label: "Apariencia", icon: Palette },
];

export function AdminLayout() {
  const dispatch = useAppDispatch();
  const { data: user } = useGetMeQuery();

  return (
    <div className="min-h-screen md:flex">
      <aside className="flex flex-col gap-4 border-b border-borde bg-superficie p-4 md:w-64 md:border-r md:border-b-0">
        <div className="font-titulo text-lg font-bold text-texto">Panel</div>

        <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Secciones del panel">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-boton px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primario text-primario-texto" : "text-texto hover:bg-primario/10",
                )
              }
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden flex-col gap-2 md:flex">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-texto-suave hover:text-texto">
            <Globe className="size-4" aria-hidden />
            Ver sitio
          </Link>
          {user && (
            <p className="truncate px-3 text-sm text-texto-suave">
              {user.nombre} {user.apellido}
            </p>
          )}
          <Button estilo="contorno" tamano="sm" onClick={() => dispatch(sessionEnded())}>
            <LogOut className="size-4" aria-hidden />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        {/* En celular el botón de salir va arriba del contenido (la barra lateral se compacta) */}
        <div className="mb-6 flex justify-end md:hidden">
          <Button estilo="contorno" tamano="sm" onClick={() => dispatch(sessionEnded())}>
            <LogOut className="size-4" aria-hidden />
            Cerrar sesión
          </Button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
