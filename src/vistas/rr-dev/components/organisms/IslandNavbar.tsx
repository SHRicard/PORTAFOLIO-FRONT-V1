import { useCallback, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useGetPerfilQuery } from "@/features/portafolio/portafolioApi";
import { cn } from "@/lib/cn";
import { BurgerButton } from "@/vistas/rr-dev/components/atoms/BurgerButton";
import { CvButton } from "@/vistas/rr-dev/components/atoms/CvButton";
import { LanguageBadge } from "@/vistas/rr-dev/components/atoms/LanguageBadge";
import { ThemeToggle } from "@/vistas/rr-dev/components/atoms/ThemeToggle";
import { NavMenu } from "@/vistas/rr-dev/components/molecules/NavMenu";
import { NavRow } from "@/vistas/rr-dev/components/molecules/NavRow";
import { NAV_SHEET_ID, NavSheet } from "@/vistas/rr-dev/components/organisms/NavSheet";
import { useScrollPasado } from "@/vistas/rr-dev/hooks/useScrollPasado";
import { ITEMS_MENU, seccionActiva, TEXTOS } from "@/vistas/rr-dev/navegacion";

/**
 * "Isla flotante": una cápsula de vidrio separada del borde, con un destello que recorre
 * su contorno. Se compacta al hacer scroll y un cometa vuela al enlace activo.
 */
export function IslandNavbar() {
  const { pathname } = useLocation();
  const { data: perfil } = useGetPerfilQuery();
  const compacta = useScrollPasado(16);
  const [abierto, setAbierto] = useState(false);
  const hamburguesa = useRef<HTMLButtonElement>(null);

  const activoId = seccionActiva(pathname);
  const cvUrl = perfil?.cv?.url;

  const cerrar = useCallback(() => {
    setAbierto(false);
    hamburguesa.current?.focus();
  }, []);

  return (
    <header className="rr-dev sticky top-0 z-40 pt-3">
      <div className="contenedor relative">
        <div
          className={cn(
            "isla relative rounded-[20px] px-[clamp(12px,2vw,24px)] backdrop-blur-lg backdrop-saturate-160 transition-[background-color,box-shadow] duration-350",
            compacta ? "bg-superficie/82 shadow-(--sombra-isla-alta)" : "bg-superficie/62 shadow-(--sombra-isla)",
          )}
        >
          <NavRow
            compacta={compacta}
            menu={<NavMenu items={ITEMS_MENU} activoId={activoId} etiqueta={TEXTOS.navegacion} />}
            idioma={<LanguageBadge />}
            tema={<ThemeToggle etiqueta={TEXTOS.cambiarTema} />}
            cv={<CvButton href={cvUrl} etiqueta={TEXTOS.descargarCv} />}
            hamburguesa={
              <BurgerButton
                ref={hamburguesa}
                abierto={abierto}
                controla={NAV_SHEET_ID}
                etiquetas={{ abrir: TEXTOS.abrirMenu, cerrar: TEXTOS.cerrarMenu }}
                onClick={() => setAbierto((valor) => !valor)}
              />
            }
          />
        </div>
        {abierto && <NavSheet activoId={activoId} cvUrl={cvUrl} onCerrar={cerrar} />}
      </div>
    </header>
  );
}
