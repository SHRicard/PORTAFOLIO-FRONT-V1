import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/** Los tres estilos de navegación del panel. Se eligen en Apariencia (SelectorNavegacion). */

export interface ItemNavegacion {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

/** Lo que comparten: se desliza si no entra, sin mostrar la barra de scroll */
const DESLIZABLE = "flex max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const FOCO = "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secundario";

/** Centra la sección actual dentro de la barra y dice dónde dibujar su indicador */
function useSeccionActual() {
  const { pathname } = useLocation();
  const barra = useRef<HTMLElement>(null);
  const [indicador, setIndicador] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const nav = barra.current;
    const actual = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !actual) return;

    const medir = () => setIndicador({ left: actual.offsetLeft, width: actual.offsetWidth });
    medir();
    if (typeof ResizeObserver === "undefined") return;
    // Cambiar la fuente del tema o el tamaño de la pantalla mueve las secciones
    const observador = new ResizeObserver(medir);
    observador.observe(nav);
    observador.observe(actual);
    return () => observador.disconnect();
  }, [pathname]);

  useEffect(() => {
    barra.current?.querySelector('[aria-current="page"]')?.scrollIntoView?.({ inline: "center", block: "nearest" });
  }, [pathname]);

  return { barra, indicador };
}

/** Pie flotante: el contenido se desvanece antes de llegar a la barra y nunca pasa por detrás */
function PieFlotante({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center bg-linear-to-t from-fondo via-fondo/80 to-transparent px-3 pt-14 pb-4">
      {children}
    </div>
  );
}

/** Opción 1: dock de iconos. Solo la sección actual se abre y muestra su nombre. */
export function NavDock({ items }: { items: ItemNavegacion[] }) {
  const { barra } = useSeccionActual();

  return (
    <PieFlotante>
      <nav
        ref={barra}
        aria-label="Secciones del panel"
        className={cn(DESLIZABLE, "pointer-events-auto gap-1 rounded-full border border-borde bg-fondo p-1.5 shadow-flotante")}
      >
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            title={label}
            className={({ isActive }) =>
              cn(
                "flex h-11 shrink-0 items-center justify-center rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
                FOCO,
                isActive
                  ? "gap-2 bg-primario px-4 text-primario-texto"
                  : "w-11 text-texto-suave hover:bg-primario/10 hover:text-texto",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="size-5 shrink-0" aria-hidden />
                {isActive && label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </PieFlotante>
  );
}

/** Opción 2: cápsula. Solo texto, y una píldora de color se desliza hasta la sección actual. */
export function NavCapsula({ items }: { items: ItemNavegacion[] }) {
  const { barra, indicador } = useSeccionActual();

  return (
    <PieFlotante>
      <nav
        ref={barra}
        aria-label="Secciones del panel"
        className={cn(
          DESLIZABLE,
          "pointer-events-auto relative gap-1 rounded-full border border-borde bg-superficie p-1.5 shadow-flotante",
        )}
      >
        <span
          aria-hidden
          className="absolute inset-y-1.5 rounded-full bg-primario transition-all duration-300"
          style={indicador}
        />
        {items.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "relative shrink-0 rounded-full px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-300",
                FOCO,
                isActive ? "text-primario-texto" : "text-texto-suave hover:text-texto",
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </PieFlotante>
  );
}

/** Opción 3: tabs arriba. Quedan fijas bajo el encabezado, con una línea que se desliza. */
export function NavTabs({ items }: { items: ItemNavegacion[] }) {
  const { barra, indicador } = useSeccionActual();

  return (
    <div className="sticky top-0 z-40 border-b border-borde bg-fondo">
      <nav ref={barra} aria-label="Secciones del panel" className={cn(DESLIZABLE, "contenedor relative gap-1")}>
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex shrink-0 items-center gap-2 rounded-boton px-3 py-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                FOCO,
                isActive ? "text-secundario" : "text-texto-suave hover:text-texto",
              )
            }
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </NavLink>
        ))}
        <span
          aria-hidden
          className="absolute bottom-0 h-0.5 rounded-full bg-primario transition-all duration-300"
          style={indicador}
        />
      </nav>
    </div>
  );
}
