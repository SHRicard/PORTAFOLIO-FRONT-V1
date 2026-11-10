import type { ReactNode } from "react";
import { estadoEstudio, iniciales, rango, TIPO_ESTUDIO } from "@/features/portafolio/formato";
import { Badge } from "@/components/ui/Badge";
import { FilaLista } from "@/components/ui/FilaLista";
import { estadoDe } from "./schemas";
import type { TipoEstudio } from "./types";

interface FilaEstudioProps {
  titulo: string;
  institucion: string;
  tipo: TipoEstudio;
  /** "AAAA-MM", o vacío mientras se escribe */
  desde: string;
  /** "AAAA-MM", o vacío / null: en curso */
  hasta: string | null;
  finalizado: boolean;
  publicado: boolean;
  /** Lo que le falta (`queFalta`), o null si está completo */
  falta: string | null;
  /** Editar y borrar */
  acciones: ReactNode;
  /** h2 en la lista; h3 cuando la fila va dentro de otra sección (la vista previa del formulario) */
  encabezado?: "h2" | "h3";
}

/**
 * Un estudio en la lista de Estudios del panel, con el formato de la de proyectos («Lista ordenada»,
 * `FilaLista`) pero sin orden a mano (el backend los ordena por fecha): las iniciales de la institución en el
 * lugar de la foto, el título con el estado y debajo la institución y el tipo, las fechas y si se terminó, lo
 * que le falta y las acciones. La usan la lista y la vista previa del formulario
 */
export function FilaEstudio({
  titulo,
  institucion,
  tipo,
  desde,
  hasta,
  finalizado,
  publicado,
  falta,
  acciones,
  encabezado,
}: FilaEstudioProps) {
  const estado = estadoDe(publicado);
  return (
    <FilaLista
      foto={null}
      sinFoto={iniciales(institucion) || "?"}
      encabezado={encabezado}
      titulo={
        <>
          {titulo.trim() || "Nuevo estudio"}
          <Badge estilo={estado.estilo}>{estado.etiqueta}</Badge>
        </>
      }
      resumen={`${institucion.trim() || "Sin institución"} · ${TIPO_ESTUDIO[tipo]}`}
      dato={{
        arriba: desde ? rango(desde, hasta || null, "en curso") : "Sin fechas",
        abajo: estadoEstudio({ hasta: hasta || null, finalizado }),
      }}
      falta={falta}
      acciones={acciones}
    />
  );
}
