import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { iniciales, mes, TIPO_PROYECTO } from "@/features/portafolio/formato";
import { Badge } from "@/components/ui/Badge";
import { FilaLista } from "@/components/ui/FilaLista";
import { ESTADO_ESTILO, ESTADO_LABELS } from "./schemas";
import type { EstadoProyecto, Imagen, TipoProyecto } from "./types";

interface FilaProyectoProps {
  /** El lugar en la lista (1, 2, 3...); sin número, solo las flechas */
  numero?: number;
  titulo: string;
  destacado: boolean;
  estado: EstadoProyecto;
  resumen: string;
  tipo: TipoProyecto;
  /** "AAAA-MM", o vacío mientras se escribe */
  fecha: string;
  /** La primera imagen de la galería */
  portada: Imagen | null;
  /** Lo que le falta (`queFalta`), o null si está completo */
  falta: string | null;
  /** Las flechas para ordenar, arriba y abajo del número. Sin ellas (con un filtro), solo el número */
  subir?: ReactNode;
  bajar?: ReactNode;
  /** Ver en la web, editar y borrar */
  acciones: ReactNode;
  /** h2 en la lista; h3 cuando la fila va dentro de otra sección (la vista previa del formulario) */
  encabezado?: "h2" | "h3";
}

/**
 * Un proyecto en la lista del panel («Lista ordenada», `FilaLista`): el número con sus flechas, la miniatura
 * (la portada, o sus iniciales), el nombre con la estrella, el estado y una línea de resumen, el tipo y la
 * fecha, lo que le falta y las acciones. La usan la lista y la vista previa del formulario
 */
export function FilaProyecto({
  numero,
  titulo,
  destacado,
  estado,
  resumen,
  tipo,
  fecha,
  portada,
  falta,
  subir,
  bajar,
  acciones,
  encabezado,
}: FilaProyectoProps) {
  return (
    <FilaLista
      orden={{ numero, subir, bajar }}
      foto={portada}
      sinFoto={iniciales(titulo)}
      encabezado={encabezado}
      titulo={
        <>
          {titulo}
          {destacado && <Star className="size-4 text-secundario" aria-label="Destacado" />}
          <Badge estilo={ESTADO_ESTILO[estado]}>{ESTADO_LABELS[estado]}</Badge>
        </>
      }
      resumen={resumen}
      dato={{ arriba: TIPO_PROYECTO[tipo], abajo: fecha ? mes(fecha) : "Sin fecha" }}
      falta={falta}
      acciones={acciones}
    />
  );
}
