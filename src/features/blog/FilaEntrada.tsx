import type { ReactNode } from "react";
import { fechaLarga, iniciales } from "@/features/portafolio/formato";
import { Badge } from "@/components/ui/Badge";
import { FilaLista } from "@/components/ui/FilaLista";
import { ESTADO_ESTILO, ESTADO_LABELS } from "./schemas";
import type { EstadoEntrada, ImagenEntrada } from "./types";

/** Hasta 3 etiquetas como hashtags, y «+N» si hay más: «#react #lanzamiento +2» */
function etiquetasCortas(etiquetas: string[]): string {
  if (etiquetas.length === 0) return "Sin etiquetas";
  const resto = etiquetas.length - 3;
  return `${etiquetas
    .slice(0, 3)
    .map((etiqueta) => `#${etiqueta}`)
    .join(" ")}${resto > 0 ? ` +${resto}` : ""}`;
}

interface FilaEntradaProps {
  titulo: string;
  estado: EstadoEntrada;
  resumen: string;
  etiquetas: string[];
  /** La primera publicación (ISO), o null si todavía no se publicó */
  publicadoEn: string | null;
  portada: ImagenEntrada | null;
  /** Lo que le falta (`queFalta`), o null si está completa */
  falta: string | null;
  /** Ver en la web, editar y borrar */
  acciones: ReactNode;
  /** h2 en la lista; h3 cuando la fila va dentro de otra sección (la vista previa del formulario) */
  encabezado?: "h2" | "h3";
}

/**
 * Una entrada en la lista del blog del panel, con el formato de la de proyectos («Lista ordenada», `FilaLista`)
 * pero sin orden a mano: la miniatura (la portada, o sus iniciales), el nombre con el estado y una línea de
 * resumen, las etiquetas y la fecha de publicación, lo que le falta y las acciones. La usan la lista y la
 * vista previa del formulario
 */
export function FilaEntrada({
  titulo,
  estado,
  resumen,
  etiquetas,
  publicadoEn,
  portada,
  falta,
  acciones,
  encabezado,
}: FilaEntradaProps) {
  return (
    <FilaLista
      foto={portada}
      sinFoto={iniciales(titulo)}
      encabezado={encabezado}
      titulo={
        <>
          {titulo}
          <Badge estilo={ESTADO_ESTILO[estado]}>{ESTADO_LABELS[estado]}</Badge>
        </>
      }
      resumen={resumen}
      dato={{
        arriba: etiquetasCortas(etiquetas),
        abajo: publicadoEn ? `Publicada el ${fechaLarga(publicadoEn)}` : "Sin publicar",
      }}
      falta={falta}
      acciones={acciones}
    />
  );
}
