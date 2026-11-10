import { Link, Outlet } from "react-router";
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
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { sessionEnded } from "@/features/auth/authActions";
import { useGetMeQuery } from "@/features/auth/authApi";
import { useAplicarTema } from "@/features/theme/useAplicarTema";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { NavCapsula, NavDock, NavTabs } from "./OpcionesNavegacion";

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
  const navegacion = useAppSelector((state) => state.theme.navegacion);
  // El tema del panel: no cambia por lo que pase en la web pública
  useAplicarTema(useAppSelector((state) => state.theme.vars));

  return (
    <div className="min-h-screen">
      <header className="border-b border-borde">
        <div className="contenedor flex h-16 items-center justify-between gap-4">
          <div className="font-titulo text-lg font-bold text-texto">Panel</div>

          <div className="flex min-w-0 items-center gap-4">
            {user && (
              <p className="hidden truncate text-sm text-texto-suave md:block">
                {user.nombre} {user.apellido}
              </p>
            )}
            <Link to="/" className="flex shrink-0 items-center gap-1.5 text-sm text-texto-suave hover:text-texto">
              <Globe className="size-4" aria-hidden />
              Ver sitio
            </Link>
            <Button estilo="contorno" tamano="sm" className="shrink-0" onClick={() => dispatch(sessionEnded())}>
              <LogOut className="size-4" aria-hidden />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {navegacion === "tabs" && <NavTabs items={NAV_ITEMS} />}

      {/* Con una barra al pie, el espacio de abajo evita que tape el final de la página */}
      <main className={cn("pt-6 md:pt-10", navegacion === "tabs" ? "pb-10" : "pb-32")}>
        <div className="contenedor">
          <Outlet />
        </div>
      </main>

      {navegacion === "dock" && <NavDock items={NAV_ITEMS} />}
      {navegacion === "capsula" && <NavCapsula items={NAV_ITEMS} />}
    </div>
  );
}
