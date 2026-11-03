import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "@/vistas/rr-dev/components/molecules/Logo";

interface NavRowProps {
  /** Enlaces de escritorio */
  menu: ReactNode;
  /** Idioma de escritorio: el menú de celular muestra el suyo */
  idioma: ReactNode;
  tema: ReactNode;
  /** Botón del CV de escritorio */
  cv: ReactNode;
  /** Botón del menú de celular */
  hamburguesa: ReactNode;
  /** La fila baja de 68 a 56 píxeles */
  compacta: boolean;
}

/** Fila del navbar: logo, enlaces repartidos, idioma, tema, CV y hamburguesa */
export function NavRow({ menu, idioma, tema, cv, hamburguesa, compacta }: NavRowProps) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-4 transition-[height] duration-350 ease-(--salida)",
        compacta ? "h-14" : "h-17",
      )}
    >
      <Logo />
      <div className="hidden min-w-0 grow justify-center xl:flex">{menu}</div>
      <div className="ml-auto flex items-center gap-2 xl:ml-0">
        <div className="hidden xl:block">{idioma}</div>
        {tema}
        {/* El sol de Inicio se ubica debajo del que se vea */}
        <div className="ancla-sol hidden xl:block">{cv}</div>
        <div className="ancla-sol xl:hidden">{hamburguesa}</div>
      </div>
    </div>
  );
}
