import { BookOpen, Languages, Laptop, MapPin } from "lucide-react";
import { useId } from "react";
import { MODALIDAD, NIVEL, parrafos } from "@/features/portafolio/formato";
import type { Perfil } from "@/features/portafolio/types";
import { APELLIDO, NOMBRE, NOMBRE_COMPLETO } from "@/lib/identidad";
import { HeroBadge } from "@/vistas/rr-dev/components/atoms/HeroBadge";
import { PortraitFrame } from "@/vistas/rr-dev/components/atoms/PortraitFrame";
import { ReaderPanel } from "@/vistas/rr-dev/components/organisms/ReaderPanel";
import { TEXTOS_INICIO, TEXTOS_SOBRE_MI } from "@/vistas/rr-dev/contenido";

interface AboutReaderProps {
  perfil: Perfil;
  onCerrar: () => void;
}

const TITULO =
  "font-titulo text-[length:clamp(1.5rem,3vw,1.9rem)] leading-tight font-bold tracking-[-0.02em] text-balance";
const PARRAFO = "text-[1.03rem] leading-[1.75]";

/** La bio entera de Sobre mí, que no entra en la pantalla, en el panel de lectura */
export function AboutReader({ perfil, onCerrar }: AboutReaderProps) {
  const titulo = useId();

  return (
    <ReaderPanel etiqueta={TEXTOS_SOBRE_MI.panelBio} icono={BookOpen} tituloId={titulo} onCerrar={onCerrar}>
      <div className="flex items-center gap-3">
        <div className="w-11 shrink-0">
          <PortraitFrame src={perfil.foto?.url} alt={perfil.foto?.alt ?? NOMBRE_COMPLETO} reservado="" />
        </div>
        <div className="grid">
          <span className="text-[0.95rem] font-semibold">
            {NOMBRE} {APELLIDO}
          </span>
          <span className="text-sm text-texto-suave">{perfil.rol || TEXTOS_INICIO.rol}</span>
        </div>
      </div>

      <h2 id={titulo} className={TITULO}>
        {perfil.frase || TEXTOS_SOBRE_MI.panelBio}
      </h2>
      <div className="flex flex-wrap gap-2">
        <HeroBadge icono={MapPin} etiqueta={`${perfil.ubicacion.ciudad}, ${perfil.ubicacion.pais}`} />
        <HeroBadge icono={Laptop} etiqueta={MODALIDAD[perfil.modalidad]} />
        {perfil.idiomas.map(({ idioma, nivel }) => (
          <HeroBadge key={idioma} icono={Languages} etiqueta={`${idioma} · ${NIVEL[nivel]}`} />
        ))}
      </div>
      <div className="grid gap-3.5">
        {parrafos(perfil.bioLarga).map((parrafo, indice) => (
          <p key={indice} className={PARRAFO}>
            {parrafo}
          </p>
        ))}
      </div>
    </ReaderPanel>
  );
}
