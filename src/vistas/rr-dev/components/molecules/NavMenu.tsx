import { useRef } from "react";
import { NavIndicator } from "@/vistas/rr-dev/components/atoms/NavIndicator";
import { NavLink } from "@/vistas/rr-dev/components/atoms/NavLink";
import { useIndicadorDeslizante } from "@/vistas/rr-dev/hooks/useIndicadorDeslizante";
import type { ItemMenu } from "@/vistas/rr-dev/navegacion";

interface NavMenuProps {
  items: ItemMenu[];
  activoId: string;
  etiqueta: string;
  /** Menú de celular: uno debajo del otro y sin pastilla */
  vertical?: boolean;
  /** Se llama después de tocar un enlace (para cerrar el menú de celular) */
  onNavegar?: () => void;
}

export function NavMenu({ items, activoId, etiqueta, vertical = false, onNavegar }: NavMenuProps) {
  const enlaces = useRef<(HTMLAnchorElement | null)[]>([]);
  const indicador = useRef<HTMLSpanElement>(null);

  const indiceActivo = items.findIndex(({ id }) => id === activoId);
  useIndicadorDeslizante(enlaces, indicador, indiceActivo);

  return (
    <nav aria-label={etiqueta} className="w-full">
      <div className="relative">
        {!vertical && <NavIndicator ref={indicador} visible={indiceActivo >= 0} />}
        {/* Los enlaces se reparten todo el ancho libre de la fila */}
        <ul className={vertical ? "space-y-1" : "flex justify-evenly gap-1"}>
          {items.map((item, indice) => (
            <li
              key={item.id}
              className={vertical ? "entrada-enlace" : undefined}
              style={vertical ? { animationDelay: `${100 + indice * 50}ms` } : undefined}
            >
              <NavLink
                ref={(enlace) => {
                  enlaces.current[indice] = enlace;
                }}
                href={item.href}
                activo={item.id === activoId}
                vertical={vertical}
                onClick={onNavegar}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
