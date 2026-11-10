import { useState } from "react";
import { MapPin } from "lucide-react";
import { iniciales, MODALIDAD } from "@/features/portafolio/formato";
import { cn } from "@/lib/cn";
import { NOMBRE_COMPLETO } from "@/lib/identidad";
import type { Modalidad } from "./types";

interface TarjetaPerfilProps {
  nombre: string;
  rol: string;
  frase: string;
  ciudad: string;
  pais: string;
  modalidad: Modalidad;
  disponible: boolean;
  disponibilidadTexto: string;
  /** La foto (una URL de Cloudinary o la local de una elegida), o vacío */
  foto: string;
  fotoAlt: string;
}

/**
 * Cómo te presenta la web, en chico: la foto (o las iniciales), el nombre, el rol, la frase, dónde estás y
 * si estás disponible. Es la vista previa de Datos públicos: cambia mientras se escribe
 */
export function TarjetaPerfil({
  nombre,
  rol,
  frase,
  ciudad,
  pais,
  modalidad,
  disponible,
  disponibilidadTexto,
  foto,
  fotoAlt,
}: TarjetaPerfilProps) {
  const [rota, setRota] = useState<string | null>(null);
  const nombreVisible = nombre.trim() || NOMBRE_COMPLETO;
  const lugar = [ciudad.trim(), pais.trim()].filter(Boolean).join(", ");
  const conFoto = !!foto && rota !== foto;

  return (
    <div className="grid gap-3.5 rounded-card border border-borde bg-fondo p-4">
      <div className="flex items-center gap-3.5">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-borde bg-superficie bg-[radial-gradient(ellipse_at_50%_130%,color-mix(in_srgb,var(--primario)_26%,transparent),transparent_70%)]">
          {conFoto ? (
            <img src={foto} alt={fotoAlt} onError={() => setRota(foto)} className="size-full object-cover object-top" />
          ) : (
            <span aria-hidden className="text-lg font-bold tracking-tight text-secundario/85">
              {iniciales(nombreVisible)}
            </span>
          )}
        </div>
        <div className="grid min-w-0 gap-0.5">
          <p className="font-titulo text-lg leading-tight font-semibold wrap-break-word text-texto">{nombreVisible}</p>
          <p className="text-sm text-secundario">{rol.trim() || "Sin rol todavía"}</p>
        </div>
      </div>

      <p className={cn("text-sm", frase.trim() ? "text-texto" : "text-texto-suave")}>
        {frase.trim() ? `«${frase.trim()}»` : "Sin frase todavía"}
      </p>

      <p className="flex items-start gap-1.5 text-[0.8125rem] text-texto-suave">
        <MapPin className="mt-0.5 size-3.75 shrink-0" aria-hidden />
        {[lugar || "Sin ubicación", MODALIDAD[modalidad]].join(" · ")}
      </p>

      <p className="flex items-start gap-2 border-t border-borde pt-3 text-[0.8125rem]">
        <span
          aria-hidden
          className={cn(
            "mt-1.5 size-2 shrink-0 rounded-full",
            disponible ? "bg-exito shadow-[0_0_10px_var(--exito)]" : "bg-texto-suave",
          )}
        />
        <span className="min-w-0">
          <span className={cn("font-semibold", disponible ? "text-exito" : "text-texto-suave")}>
            {disponible ? "Disponible" : "No disponible"}
          </span>
          {disponibilidadTexto.trim() && <span className="text-texto-suave"> · {disponibilidadTexto.trim()}</span>}
        </span>
      </p>
    </div>
  );
}
