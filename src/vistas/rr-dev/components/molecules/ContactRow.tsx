import { ArrowRight, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ContactEmblem } from "@/vistas/rr-dev/components/atoms/ContactEmblem";
import { BOTON_FICHA, FLECHA_BOTON_FICHA, FoldRow } from "@/vistas/rr-dev/components/molecules/FoldRow";
import type { FormaDeContacto } from "@/vistas/rr-dev/contacto";
import { TEXTOS_CONTACTO } from "@/vistas/rr-dev/contenido";

/** En la que entra abierta: cuánto después de su fila aparecen el detalle y los botones */
const DEMORA = { detalle: 300, botones: 600 };
/** Lo que dura «Copiado» antes de volver a «Copiar» */
const AVISO_MS = 1800;

interface ContactRowProps {
  forma: FormaDeContacto;
  abierta: boolean;
  onAbrir: () => void;
  /** Los ms en que se enciende al entrar al apartado (ver `useEncendido`) */
  encender?: number;
}

/**
 * Una forma de contactarme como una ficha de la lista (`FoldRow`), igual que un proyecto: en la fila,
 * el emblema, el nombre y el correo, el número o la dirección. Abierta, un detalle (cuánto tardo en
 * responder, mi horario) y el botón que lo abre: «Escribir», «Abrir WhatsApp», «Llamar», «Agendar» o
 * «Abrir perfil». El correo se puede copiar
 */
export function ContactRow({ forma, abierta, onAbrir, encender }: ContactRowProps) {
  return (
    <FoldRow
      tono={forma.tono}
      abierta={abierta}
      onAbrir={onAbrir}
      encender={encender}
      emblema={<ContactEmblem forma={forma} />}
      titulo={forma.nombre}
      subtitulo={forma.valor}
    >
      {(despues) => (
        <>
          {forma.detalle && (
            <p
              data-encender={despues(DEMORA.detalle)}
              data-respaldo
              className="sombra-texto text-[0.8125rem] leading-normal text-texto xl:text-[length:clamp(0.78125rem,1.6cqh,0.9375rem)]"
            >
              {forma.detalle}
            </p>
          )}
          <div data-encender={despues(DEMORA.botones)} className="flex flex-wrap items-center gap-2">
            <a
              href={forma.href}
              {...(forma.externo && { target: "_blank", rel: "noopener noreferrer" })}
              className={BOTON_FICHA}
            >
              {forma.accion}
              <span className="sr-only">: {forma.nombre}</span>
              <ArrowRight className={FLECHA_BOTON_FICHA} aria-hidden />
            </a>
            {forma.copiable && <BotonCopiar texto={forma.valor} />}
          </div>
        </>
      )}
    </FoldRow>
  );
}

/** Copia el texto y avisa en el mismo botón: «Copiado», o que no se pudo */
function BotonCopiar({ texto }: { texto: string }) {
  const [estado, setEstado] = useState<"listo" | "copiado" | "error">("listo");
  const reloj = useRef(0);
  useEffect(() => () => window.clearTimeout(reloj.current), []);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("copiado");
    } catch {
      setEstado("error");
    }
    window.clearTimeout(reloj.current);
    reloj.current = window.setTimeout(() => setEstado("listo"), AVISO_MS);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="inline-flex h-7.5 items-center gap-1.5 rounded-full border border-borde bg-superficie/75 px-3 text-[0.75rem] text-texto-suave backdrop-blur-sm transition-colors duration-300 hover:border-(--tono)/60 hover:text-(--tono) xl:h-[clamp(1.6875rem,3.6cqh,2.125rem)] xl:text-[length:clamp(0.6875rem,1.35cqh,0.78125rem)]"
    >
      <Copy className="size-3.5" aria-hidden />
      <span aria-live="polite">
        {estado === "copiado"
          ? TEXTOS_CONTACTO.copiado
          : estado === "error"
            ? TEXTOS_CONTACTO.noSeCopio
            : TEXTOS_CONTACTO.copiar}
      </span>
    </button>
  );
}
