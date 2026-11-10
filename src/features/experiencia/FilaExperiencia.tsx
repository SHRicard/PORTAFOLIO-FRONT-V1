import type { ReactNode } from "react";
import { iniciales, MODALIDAD, rango } from "@/features/portafolio/formato";
import { Badge } from "@/components/ui/Badge";
import { FilaLista } from "@/components/ui/FilaLista";
import { estadoDe } from "./schemas";
import type { Modalidad } from "./types";

interface FilaExperienciaProps {
  empresa: string;
  puesto: string;
  /** "AAAA-MM", o vacío mientras se escribe */
  desde: string;
  /** "AAAA-MM", o vacío / null: trabajo actual */
  hasta: string | null;
  ubicacion: string;
  modalidad: Modalidad;
  descripcion: string;
  publicado: boolean;
  /** Lo que le falta (`queFalta`), o null si está completo */
  falta: string | null;
  /** Editar y borrar */
  acciones: ReactNode;
  /** h2 en la lista; h3 cuando la fila va dentro de otra sección (la vista previa del formulario) */
  encabezado?: "h2" | "h3";
}

/**
 * Un trabajo en la lista de Experiencia del panel, con el formato de la de proyectos («Lista ordenada»,
 * `FilaLista`) pero sin orden a mano (el backend los ordena por fecha): las iniciales de la empresa en el lugar
 * de la foto, «Puesto en Empresa» con el estado y una línea de la descripción, las fechas y la modalidad, lo que
 * le falta y las acciones. La usan la lista y la vista previa del formulario
 */
export function FilaExperiencia({
  empresa,
  puesto,
  desde,
  hasta,
  ubicacion,
  modalidad,
  descripcion,
  publicado,
  falta,
  acciones,
  encabezado,
}: FilaExperienciaProps) {
  const estado = estadoDe(publicado);
  const nombre = [puesto.trim(), empresa.trim()].filter(Boolean).join(" en ") || "Nuevo trabajo";
  return (
    <FilaLista
      foto={null}
      sinFoto={iniciales(empresa) || "?"}
      encabezado={encabezado}
      titulo={
        <>
          {nombre}
          <Badge estilo={estado.estilo}>{estado.etiqueta}</Badge>
        </>
      }
      resumen={descripcion.trim() || "Sin descripción todavía"}
      dato={{
        arriba: desde ? rango(desde, hasta || null) : "Sin fechas",
        abajo: [MODALIDAD[modalidad], ubicacion.trim()].filter(Boolean).join(" · "),
      }}
      falta={falta}
      acciones={acciones}
    />
  );
}
