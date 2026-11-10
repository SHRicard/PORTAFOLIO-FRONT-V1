import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cva } from "class-variance-authority";
import { EyeOff, FileText, ImageOff, Trash2, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

/** Lo que tarda en entrar y en salir: calmo, sin saltos */
export const DURACION_DIALOGO = 480;

export interface Consecuencia {
  icono: LucideIcon;
  texto: string;
  /** peligro = lo que se pierde · suave = un dato, como «No se puede deshacer» */
  tono?: "peligro" | "suave";
}

export interface OpcionesConfirmar {
  /** Qué se borra, arriba en mayúsculas: «Proyecto», «Foto de la galería»... */
  tipo: string;
  titulo: string;
  /** Lo que se va a borrar, a la vista: <VistaFoto /> o <VistaFicha /> */
  vista?: ReactNode;
  /** Qué pasa al confirmar, una línea cada una */
  consecuencias?: Consecuencia[];
  /** Cómo sacarlo de la web sin borrarlo («Si solo querés ocultarlo...») */
  sugerencia?: string;
  /** Algo más que se pierde, como los cambios sin guardar */
  aviso?: string;
  textoConfirmar: string;
}

const iconoConsecuenciaVariants = cva("grid size-7.5 shrink-0 place-items-center rounded-lg", {
  variants: {
    tono: {
      peligro: "bg-peligro/13 text-peligro",
      suave: "bg-texto/6 text-texto-suave",
    },
  },
  defaultVariants: { tono: "peligro" },
});

const notaVariants = cva("flex items-start gap-2.5 rounded-boton border px-3 py-2.5 text-[0.8125rem] leading-snug", {
  variants: {
    tipo: {
      sugerencia: "border-info/26 bg-info/9 text-texto [&>svg]:text-info",
      aviso: "border-aviso/28 bg-aviso/8 text-aviso",
    },
  },
});

interface DialogoConfirmarProps {
  opciones: OpcionesConfirmar;
  /** Se llama una sola vez, apenas se elige: true = confirmó */
  onResponder: (confirmado: boolean) => void;
  /** Ya terminó de salir: se puede desmontar */
  onCerrado: () => void;
}

/**
 * El modal «Con lo que se borra»: muestra lo que se va a borrar y qué pasa al confirmar. Es un <dialog>
 * modal: el resto de la página queda inerte, el foco arranca en «Cancelar» y vuelve adonde estaba al
 * cerrar. Esc, la X y un toque en el fondo cancelan. No se usa suelto: se pide con useConfirmar()
 */
export function DialogoConfirmar({ opciones, onResponder, onCerrado }: DialogoConfirmarProps) {
  const { tipo, titulo, vista, consecuencias = [], sugerencia, aviso, textoConfirmar } = opciones;
  const dialogo = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const respondido = useRef(false);
  const salida = useRef<number>(undefined);
  const idTitulo = useId();

  useLayoutEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (!elemento.open) {
      if (typeof elemento.showModal === "function") elemento.showModal();
      else elemento.setAttribute("open", ""); // jsdom no tiene showModal
    }
    elemento.querySelector<HTMLButtonElement>("[data-cancelar]")?.focus();
    // Que el navegador vea primero el estado de salida: así la entrada se anima
    void elemento.offsetHeight;
    const cuadro = requestAnimationFrame(() => setVisible(true));
    return () => {
      cancelAnimationFrame(cuadro);
      if (typeof elemento.close === "function") elemento.close();
      else elemento.removeAttribute("open");
    };
  }, []);

  useEffect(() => () => window.clearTimeout(salida.current), []);

  function responder(confirmado: boolean) {
    if (respondido.current) return;
    respondido.current = true;
    onResponder(confirmado);
    setVisible(false);
    salida.current = window.setTimeout(onCerrado, DURACION_DIALOGO);
  }

  return (
    <dialog
      ref={dialogo}
      aria-labelledby={idTitulo}
      // Esc: se cancela con la misma salida que los botones
      onCancel={(evento) => {
        evento.preventDefault();
        responder(false);
      }}
      // Solo si el navegador lo cerró por su cuenta. El aviso llega tarde: en desarrollo, StrictMode lo
      // cierra y lo vuelve a abrir al montarlo, y ese aviso viejo no tiene que cancelarlo
      onClose={() => {
        if (!dialogo.current?.open) responder(false);
      }}
      className="fixed inset-0 m-0 size-full max-h-none max-w-none grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] place-items-center overflow-hidden bg-transparent px-4 py-5 text-texto backdrop:bg-transparent open:grid sm:p-6"
    >
      {/* El fondo: un toque cancela */}
      <div
        aria-hidden
        onClick={() => responder(false)}
        className={cn(
          "fixed inset-0 bg-sombra/70 backdrop-blur-sm transition-opacity duration-[380ms] ease-out motion-reduce:transition-none",
          visible ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        className={cn(
          "relative grid max-h-full w-full max-w-120 grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-[calc(var(--radio-card)+0.25rem)] border border-borde bg-superficie shadow-[0_28px_70px_-16px_var(--sombra)]",
          "transition-[opacity,translate,scale] duration-[480ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-2.5 scale-98 opacity-0",
        )}
      >
        {/* Si no entra en la pantalla, se desliza por dentro y los botones quedan fijos abajo */}
        <div className="grid content-start gap-4 overflow-y-auto overscroll-contain p-4.5 pb-5 sm:px-5.5 sm:pt-5 sm:pb-5.5">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs tracking-[0.1em] text-texto-suave uppercase">
              <span aria-hidden className="size-2 rounded-full bg-peligro shadow-[0_0_10px_var(--peligro)]" />
              {tipo}
            </p>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => responder(false)}
              className="-my-1.5 -mr-2 grid size-8 place-items-center rounded-boton text-texto-suave transition-colors hover:bg-texto/6 hover:text-texto focus-visible:outline-2 focus-visible:outline-secundario"
            >
              <X className="size-4.5" aria-hidden />
            </button>
          </div>

          {vista}

          <h2 id={idTitulo} className="font-subtitulo text-lg leading-snug font-semibold text-balance text-texto">
            {titulo}
          </h2>

          {consecuencias.length > 0 && (
            <ul className="grid gap-2.5">
              {consecuencias.map(({ icono: Icono, texto, tono }) => (
                <li key={texto} className="flex items-center gap-3 text-sm leading-snug text-texto">
                  <span className={iconoConsecuenciaVariants({ tono })}>
                    <Icono className="size-4" aria-hidden />
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
          )}

          {sugerencia && (
            <p className={notaVariants({ tipo: "sugerencia" })}>
              <EyeOff className="mt-px size-4 shrink-0" aria-hidden />
              {sugerencia}
            </p>
          )}
          {aviso && (
            <p className={notaVariants({ tipo: "aviso" })}>
              <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden />
              {aviso}
            </p>
          )}
        </div>

        <div className="grid grid-cols-[minmax(6rem,auto)_minmax(0,1fr)] gap-2 border-t border-borde bg-fondo/45 px-4.5 pt-3.5 pb-4.5 sm:flex sm:justify-end sm:px-5.5 sm:py-3.5">
          <Button estilo="texto" data-cancelar className="h-11 sm:h-10" onClick={() => responder(false)}>
            Cancelar
          </Button>
          <Button estilo="peligro" className="h-11 sm:h-10" onClick={() => responder(true)}>
            <Trash2 className="size-4" aria-hidden />
            {textoConfirmar}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

/** Para el modal: la foto que se va a borrar, con su nombre encima */
export function VistaFoto({ url, nombre }: { url: string; nombre?: string }) {
  const [rota, setRota] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-[0.625rem] border border-borde bg-fondo">
      {rota ? (
        <div className="grid aspect-16/10 max-h-50 w-full place-items-center text-texto-suave">
          <ImageOff className="size-6" aria-hidden />
        </div>
      ) : (
        <img
          src={url}
          alt=""
          onError={() => setRota(true)}
          className="aspect-16/10 max-h-50 w-full object-cover object-top"
        />
      )}
      {nombre && (
        <span className="absolute bottom-2.5 left-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-full border border-borde bg-fondo/72 px-2.5 py-1 text-xs text-texto">
          {nombre}
        </span>
      )}
    </div>
  );
}

interface VistaFichaProps {
  titulo: string;
  /** La portada, si tiene. Sin imagen va el ícono */
  imagen?: string | null;
  icono?: LucideIcon;
  /** Un <Badge /> con el estado, por ejemplo */
  etiqueta?: ReactNode;
  detalle?: string;
}

/** Para el modal: una ficha chica de lo que se va a borrar (un proyecto, una entrada, un PDF...) */
export function VistaFicha({ titulo, imagen, icono: Icono = FileText, etiqueta, detalle }: VistaFichaProps) {
  const [rota, setRota] = useState(false);
  return (
    <div className="flex items-center gap-3 rounded-[0.625rem] border border-borde bg-fondo p-2.5">
      <div className="grid aspect-16/10 w-23 shrink-0 place-items-center overflow-hidden rounded-md border border-borde bg-superficie text-texto-suave">
        {imagen && !rota ? (
          <img src={imagen} alt="" onError={() => setRota(true)} className="size-full object-cover" />
        ) : (
          <Icono className="size-5" aria-hidden />
        )}
      </div>
      <div className="min-w-0">
        <p className="font-medium wrap-break-word text-texto">{titulo}</p>
        {(etiqueta || detalle) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-texto-suave">
            {etiqueta}
            {detalle && <span>{detalle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
