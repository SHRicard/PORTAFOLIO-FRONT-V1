import type { ReactNode } from "react";
import { Folder } from "lucide-react";
import { fechaLarga } from "@/features/portafolio/formato";
import { Badge } from "@/components/ui/Badge";
import { FilaLista } from "@/components/ui/FilaLista";
import type { Archivo, TipoArchivo } from "./types";

export const TIPO_ARCHIVO: Record<TipoArchivo, { etiqueta: string; estilo: "primario" | "neutro" }> = {
  imagen: { etiqueta: "Imagen", estilo: "primario" },
  documento: { etiqueta: "PDF", estilo: "neutro" },
};

/** El nombre con el que se subió o, si no lo tiene, su publicId */
export const nombreDe = (archivo: Archivo) => archivo.nombreOriginal ?? archivo.publicId;

/** 1258291 -> "1,2 MB"; lo de menos de 100 KB, en KB (8192 -> "8 KB"), para que no diga «0 MB» */
export const megas = (bytes: number) =>
  bytes < 100 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toLocaleString("es-AR", { maximumFractionDigits: 1 })} MB`;

/**
 * La carpeta del archivo dentro de la del portafolio, sacada del publicId:
 * "portafolio/proyectos/facturacion-fct/qx8v" -> "proyectos/facturacion-fct". Sin subcarpeta, null
 */
export function carpetaDelArchivo(publicId: string): string | null {
  return publicId.split("/").slice(1, -1).join("/") || null;
}

interface FilaArchivoProps {
  archivo: Archivo;
  /** Abrir, copiar el link y borrar */
  acciones: ReactNode;
}

/**
 * Un archivo en la biblioteca del panel, con el formato de las otras listas («Lista ordenada», `FilaLista`):
 * la miniatura (o «PDF»), el nombre con su tipo y cuándo se subió, el formato y el tamaño, la carpeta (en la
 * columna que en las otras listas es «Le falta») y las acciones
 */
export function FilaArchivo({ archivo, acciones }: FilaArchivoProps) {
  const tipo = TIPO_ARCHIVO[archivo.tipo];
  const carpeta = carpetaDelArchivo(archivo.publicId);
  return (
    <FilaLista
      foto={archivo.tipo === "imagen" ? { url: archivo.url, alt: "" } : null}
      sinFoto="PDF"
      titulo={
        <>
          <span className="min-w-0 truncate" title={nombreDe(archivo)}>
            {nombreDe(archivo)}
          </span>
          <Badge estilo={tipo.estilo}>{tipo.etiqueta}</Badge>
        </>
      }
      resumen={`Subido el ${fechaLarga(archivo.createdAt)}`}
      dato={{
        arriba: `${archivo.formato.toUpperCase()} · ${megas(archivo.bytes)}`,
        abajo: archivo.ancho && archivo.alto ? `${archivo.ancho} × ${archivo.alto} px` : "Documento",
      }}
      nota={
        <>
          <Folder className="mt-0.5 size-3.75 shrink-0" aria-hidden />
          <span className="min-w-0 truncate" title={carpeta ?? undefined}>
            {carpeta ?? "Carpeta principal"}
          </span>
        </>
      }
      acciones={acciones}
    />
  );
}
