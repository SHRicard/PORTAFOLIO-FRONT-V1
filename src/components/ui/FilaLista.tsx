import { useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/cn";

/*
 * LAS LISTAS DEL PANEL «LISTA ORDENADA» (proyectos, blog, experiencia, estudios y archivos)
 * Una fila por elemento, con sus columnas: el orden (si la lista se ordena a mano), la miniatura, el
 * nombre con el estado y una línea de resumen, un dato de dos renglones (el tipo y la fecha...), lo que
 * le falta (o, en una lista donde no aplica, otro dato: la carpeta de un archivo) y las acciones. Las columnas dependen del ancho de la lista, no de la pantalla (la lista
 * lleva `@container`): angosta (el celular, la vista previa de un formulario), cada fila se apila; desde
 * `@2xl`, una fila con lo que falta y las acciones en sus columnas; desde `@5xl`, también el dato
 */

const COLUMNAS = {
  conOrden:
    "grid grid-cols-[1.875rem_6rem_minmax(0,1fr)] gap-x-3 gap-y-2.5 " +
    "@2xl:grid-cols-[2.5rem_7.5rem_minmax(0,2fr)_minmax(0,1.3fr)_7rem] @2xl:gap-x-5 " +
    "@5xl:grid-cols-[2.5rem_8.5rem_minmax(0,2.6fr)_minmax(0,1fr)_minmax(0,1.3fr)_7rem]",
  sinOrden:
    "grid grid-cols-[6rem_minmax(0,1fr)] gap-x-3 gap-y-2.5 " +
    "@2xl:grid-cols-[7.5rem_minmax(0,2fr)_minmax(0,1.3fr)_7rem] @2xl:gap-x-5 " +
    "@5xl:grid-cols-[8.5rem_minmax(0,2.6fr)_minmax(0,1fr)_minmax(0,1.3fr)_7rem]",
};

/** Los títulos de las columnas, arriba de la lista. En la lista angosta no van */
export function CabeceraLista({
  conOrden,
  nombre,
  dato,
  columna = "Le falta",
}: {
  conOrden: boolean;
  nombre: string;
  dato: string;
  /** El título de la columna de «Le falta», si la lista la usa para otra cosa (ver `nota` en FilaLista) */
  columna?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        COLUMNAS[conOrden ? "conOrden" : "sinOrden"],
        "hidden border-b border-borde bg-texto/2 px-4.5 py-2.5 text-[0.71875rem] font-semibold tracking-[0.12em] text-texto-suave uppercase @2xl:grid",
      )}
    >
      {conOrden && <span className="text-center">#</span>}
      <span />
      <span>{nombre}</span>
      <span className="hidden @5xl:block">{dato}</span>
      <span>{columna}</span>
      <span />
    </div>
  );
}

interface FilaListaProps {
  /** Solo en las listas que se ordenan a mano: el lugar (1, 2, 3...) entre las flechas */
  orden?: { numero?: number; subir?: ReactNode; bajar?: ReactNode };
  /** La foto de la miniatura (la portada) */
  foto: { url: string | null; alt: string } | null;
  /** Lo que va en la miniatura sin foto, o si su link no carga (ej. las iniciales). Es decorativo */
  sinFoto: string;
  /** h2 en la lista; h3 cuando la fila va dentro de otra sección (la vista previa de un formulario) */
  encabezado?: "h2" | "h3";
  /** El nombre, con lo que va a su lado (la estrella, el badge del estado) */
  titulo: ReactNode;
  resumen: string;
  /** La columna de los dos renglones (ej. el tipo y la fecha) */
  dato: { arriba: string; abajo: string };
  /** Lo que le falta, en ámbar, o null: «Completo» en verde */
  falta?: string | null;
  /** En lugar de lo que le falta, otro dato en esa columna (ej. la carpeta de un archivo) */
  nota?: ReactNode;
  acciones: ReactNode;
}

/** Una fila de una lista del panel. Va dentro de un contenedor con `@container` */
export function FilaLista({
  orden,
  foto,
  sinFoto,
  encabezado: Encabezado = "h2",
  titulo,
  resumen,
  dato,
  falta = null,
  nota,
  acciones,
}: FilaListaProps) {
  return (
    <div
      className={cn(
        COLUMNAS[orden ? "conOrden" : "sinOrden"],
        "items-start p-3 transition-colors duration-300 hover:bg-primario/5 @2xl:items-center @2xl:px-4.5 @2xl:py-3",
      )}
    >
      {orden && (
        <div className="grid justify-items-center font-semibold text-texto-suave tabular-nums">
          {orden.subir}
          {orden.numero !== undefined && <span className="leading-6">{orden.numero}</span>}
          {orden.bajar}
        </div>
      )}

      <Miniatura key={foto?.url} foto={foto} sinFoto={sinFoto} />

      <div className="grid min-w-0 gap-1">
        <Encabezado className="flex flex-wrap items-center gap-2 font-medium text-texto">{titulo}</Encabezado>
        <p className="line-clamp-2 text-sm text-texto-suave @2xl:line-clamp-1">{resumen}</p>
      </div>

      <div className="hidden min-w-0 gap-0.5 text-[0.84375rem] @5xl:grid">
        <span className="truncate text-texto">{dato.arriba}</span>
        <span className="truncate text-texto-suave">{dato.abajo}</span>
      </div>

      <p
        className={cn(
          "flex min-w-0 items-start gap-1.5 text-[0.8125rem] @2xl:col-span-1 @2xl:col-start-auto",
          orden ? "col-span-2 col-start-2" : "col-start-2",
          nota !== undefined ? "text-texto-suave" : falta ? "text-aviso" : "text-exito",
        )}
      >
        {nota !== undefined ? (
          nota
        ) : (
          <>
            {falta ? (
              <CircleAlert className="mt-0.5 size-3.75 shrink-0" aria-hidden />
            ) : (
              <CircleCheck className="mt-0.5 size-3.75 shrink-0" aria-hidden />
            )}
            {falta ?? "Completo"}
          </>
        )}
      </p>

      <div className="col-span-full flex items-center justify-end gap-1 border-t border-borde pt-1.5 @2xl:col-span-1 @2xl:border-0 @2xl:pt-0">
        {acciones}
      </div>
    </div>
  );
}

/** La miniatura en 16:10: la foto, o `sinFoto` si no tiene (o si su link no carga, `onError`) */
function Miniatura({ foto, sinFoto }: { foto: FilaListaProps["foto"]; sinFoto: string }) {
  const [rota, setRota] = useState(false);
  const conFoto = !!foto?.url && !rota;

  return (
    <div className="aspect-16/10 overflow-hidden rounded-boton border border-borde">
      {conFoto ? (
        <img
          src={foto?.url ?? undefined}
          alt={foto?.alt ?? ""}
          loading="lazy"
          onError={() => setRota(true)}
          className="size-full bg-superficie object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="grid size-full place-items-center bg-fondo bg-[radial-gradient(ellipse_at_50%_130%,color-mix(in_srgb,var(--primario)_22%,transparent),transparent_70%)] text-xl font-bold tracking-tight text-secundario/80"
        >
          {sinFoto}
        </div>
      )}
    </div>
  );
}
