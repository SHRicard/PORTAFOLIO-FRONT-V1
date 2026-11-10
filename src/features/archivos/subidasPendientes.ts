import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSubirArchivoMutation } from "./archivosApi";
import type { TipoArchivo } from "./types";

interface Pendiente {
  archivo: File;
  tipo: TipoArchivo;
  /** La URL de Cloudinary, cuando ya se subió (si guardar falla después, no se vuelve a subir) */
  subida?: string;
}

/**
 * Los archivos elegidos en un formulario que todavía no se subieron. Mientras tanto, el campo guarda
 * una URL local (blob:) que sirve para la vista previa; se suben todos juntos al guardar
 */
export interface SubidasPendientes {
  /** Guarda el archivo elegido y devuelve su URL local, para ponerla en el campo */
  agregar: (archivo: File, tipo: TipoArchivo) => string;
  /** El archivo que todavía no se subió, si esa URL es de uno */
  pendiente: (url: string) => File | undefined;
  /** Sube los archivos que siguen en `valores` y devuelve los valores con sus URL de Cloudinary. Si uno falla, lanza su error */
  subir: <T>(valores: T, carpeta?: string) => Promise<T>;
  subiendo: boolean;
}

/** Dentro de este contexto, CampoArchivo no sube al elegir: deja el archivo pendiente hasta guardar */
export const SubidasPendientesContexto = createContext<SubidasPendientes | null>(null);

/** Copia `valor` pasando cada texto por `cambiar`, también dentro de listas y objetos */
function cambiarTextos<T>(valor: T, cambiar: (texto: string) => string): T {
  if (typeof valor === "string") return cambiar(valor) as T;
  if (Array.isArray(valor)) return valor.map((v) => cambiarTextos(v, cambiar)) as T;
  if (valor && typeof valor === "object") {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, cambiarTextos(v, cambiar)])) as T;
  }
  return valor;
}

/** Crea las subidas pendientes de un formulario. Se pasan a sus campos con SubidasPendientesContexto */
export function useSubidasPendientes(): SubidasPendientes {
  const [subirArchivo] = useSubirArchivoMutation();
  const [subiendo, setSubiendo] = useState(false);
  const pendientes = useRef(new Map<string, Pendiente>());

  // Las URL locales ocupan memoria hasta que se liberan
  useEffect(() => {
    const mapa = pendientes.current;
    return () => mapa.forEach((_pendiente, url) => URL.revokeObjectURL(url));
  }, []);

  const agregar = useCallback((archivo: File, tipo: TipoArchivo) => {
    const url = URL.createObjectURL(archivo);
    pendientes.current.set(url, { archivo, tipo });
    return url;
  }, []);

  const pendiente = useCallback((url: string) => pendientes.current.get(url)?.archivo, []);

  const subir = useCallback(
    async <T>(valores: T, carpeta?: string): Promise<T> => {
      const porSubir = new Set<Pendiente>();
      cambiarTextos(valores, (texto) => {
        const p = pendientes.current.get(texto);
        if (p && !p.subida) porSubir.add(p);
        return texto;
      });

      if (porSubir.size > 0) {
        setSubiendo(true);
        try {
          for (const p of porSubir) {
            p.subida = (await subirArchivo({ archivo: p.archivo, tipo: p.tipo, carpeta }).unwrap()).url;
          }
        } finally {
          setSubiendo(false);
        }
      }
      return cambiarTextos(valores, (texto) => pendientes.current.get(texto)?.subida ?? texto);
    },
    [subirArchivo],
  );

  return useMemo(() => ({ agregar, pendiente, subir, subiendo }), [agregar, pendiente, subir, subiendo]);
}
