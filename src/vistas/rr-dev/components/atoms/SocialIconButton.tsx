import { Globe, Link2 } from "lucide-react";
import { RED } from "@/features/portafolio/formato";
import type { TipoRed } from "@/features/portafolio/types";
import { BrandLogo } from "@/vistas/rr-dev/components/atoms/BrandLogo";
import { LOGOS_RED } from "@/vistas/rr-dev/logos";

interface SocialIconButtonProps {
  tipo: TipoRed;
  href: string;
}

function IconoRed({ tipo }: { tipo: TipoRed }) {
  if (tipo === "sitio") return <Globe className="size-5" aria-hidden />;
  if (tipo === "otra") return <Link2 className="size-5" aria-hidden />;
  return <BrandLogo logo={LOGOS_RED[tipo]} className="size-5" />;
}

/** Enlace a una red, con su logo. Se abre en otra pestaña. */
export function SocialIconButton({ tipo, href }: SocialIconButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={RED[tipo]}
      title={RED[tipo]}
      className="inline-flex size-11 items-center justify-center rounded-full border border-borde bg-superficie/70 text-texto-suave transition-[color,border-color,background-color,translate] duration-300 ease-(--rebote) hover:-translate-y-0.5 hover:border-secundario/60 hover:bg-primario/8 hover:text-secundario"
    >
      <IconoRed tipo={tipo} />
    </a>
  );
}
