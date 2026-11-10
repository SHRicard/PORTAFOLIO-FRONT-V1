import { useState } from "react";
import { Cloud, Image, RotateCcw } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { useConfirmar } from "@/components/ui/Confirmar";
import { VistaFoto } from "@/components/ui/DialogoConfirmar";
import { useEliminarImagenProyectoMutation } from "./proyectosApi";
import type { Proyecto, ResultadoArchivo } from "./types";

/** Lo que se avisa después de eliminar, según qué pasó con el archivo */
const AVISO: Record<ResultadoArchivo, string> = {
  borrado: "Foto eliminada del proyecto y de Cloudinary.",
  "en-uso": "La foto se quitó del proyecto, pero sigue en Cloudinary porque la usa otra parte del portafolio.",
  externo: "La foto se quitó del proyecto. No estaba en Cloudinary, así que no había nada más que borrar.",
};

export interface AvisoFoto {
  tipo: "info" | "error";
  texto: string;
}

/**
 * Lo que hace «Quitar» en una foto del formulario (el tacho de la portada y la X de la galería).
 * Si la foto ya está guardada en el proyecto, la elimina en el momento, con el modal de confirmación: la saca del
 * proyecto y la borra de Cloudinary (DELETE /proyectos/:id/galeria), sin esperar a «Guardar». Si todavía
 * no se guardó (recién subida, pegada a mano o pendiente), solo la saca del formulario
 */
export function useQuitarFoto(proyecto: Proyecto | undefined, hayCambios: boolean) {
  const [eliminar] = useEliminarImagenProyectoMutation();
  const confirmar = useConfirmar();
  /** La URL que se está eliminando, para mostrar su botón cargando */
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<AvisoFoto | null>(null);
  const guardadas = new Set(proyecto?.galeria.map((imagen) => imagen.url).filter(Boolean));

  async function quitar(url: string, sacarDelFormulario: () => void) {
    if (!proyecto || !guardadas.has(url)) {
      sacarDelFormulario();
      return;
    }

    const esPortada = proyecto.galeria[0]?.url === url;
    const confirmado = await confirmar({
      tipo: esPortada ? "Portada" : "Foto de la galería",
      titulo: "¿Eliminar esta foto?",
      vista: <VistaFoto url={url} nombre={url.split("/").pop()?.split("?")[0]} />,
      consecuencias: [
        {
          icono: Image,
          texto: !esPortada
            ? "Sale de la galería del proyecto"
            : proyecto.galeria.length > 1
              ? "Sale del proyecto y la siguiente foto pasa a ser la portada"
              : "Sale del proyecto, que queda sin portada",
        },
        { icono: Cloud, texto: "Se borra de Cloudinary y de Archivos, si nada más del portafolio la usa" },
        { icono: RotateCcw, texto: "No se puede deshacer", tono: "suave" },
      ],
      aviso: hayCambios ? "Los cambios sin guardar del formulario se van a perder." : undefined,
      textoConfirmar: "Eliminar foto",
    });
    if (!confirmado) return;

    setAviso(null);
    setEliminando(url);
    try {
      // Invalida "Proyecto": el formulario se vuelve a cargar sin la foto
      const { archivo } = await eliminar({ id: proyecto.id, url }).unwrap();
      setAviso({ tipo: "info", texto: AVISO[archivo] });
    } catch (err) {
      setAviso({ tipo: "error", texto: getErrorMessage(err) });
    } finally {
      setEliminando(null);
    }
  }

  return { quitar, eliminando, aviso };
}
