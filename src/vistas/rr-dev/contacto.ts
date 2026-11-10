import { CalendarDays, Globe, Link2, type LucideIcon, Mail, Phone } from "lucide-react";
import { RED } from "@/features/portafolio/formato";
import type { Perfil } from "@/features/portafolio/types";
import { TEXTOS_CONTACTO, type TonoEstadistica } from "@/vistas/rr-dev/contenido";
import { type Logo, LOGO_WHATSAPP, LOGOS_RED } from "@/vistas/rr-dev/logos";

type Contacto = Perfil["contacto"];

/** Una forma de contactarme: una ficha de Contacto */
export interface FormaDeContacto {
  id: string;
  /** El dibujo del emblema: el logo de una marca o un ícono */
  logo?: Logo;
  icono?: LucideIcon;
  tono: TonoEstadistica;
  /** En la fila de la ficha */
  nombre: string;
  /** Debajo del nombre: el correo, el número o la dirección */
  valor: string;
  /** Lo que dice la ficha abierta. Vacío, no dice nada */
  detalle: string;
  href: string;
  /** El texto del botón que lo abre */
  accion: string;
  /** Se abre en otra pestaña */
  externo: boolean;
  /** Lleva el botón para copiar el valor */
  copiable: boolean;
}

/** Los colores de StatsBar, como los proyectos. Las redes arrancan en el segundo */
const TONOS: TonoEstadistica[] = ["info", "exito", "aviso", "rosa"];

/** wa.me y tel: piden solo los dígitos */
export const soloDigitos = (numero: string) => numero.replace(/\D/g, "");

/** La dirección sin https:// ni www., y sin la barra del final */
export const sinProtocolo = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/**
 * Escribir y hablar, en este orden: el correo siempre; WhatsApp y la llamada si hay teléfono (WhatsApp,
 * solo si lo tiene), y la videollamada si hay link para agendar
 */
export function formasDeEscribir(contacto: Contacto): FormaDeContacto[] {
  const { correo, telefono, horario, tiempoRespuesta, agenda } = contacto;
  const formas: FormaDeContacto[] = [
    {
      id: "correo",
      icono: Mail,
      tono: "info",
      nombre: TEXTOS_CONTACTO.correo,
      valor: correo,
      detalle: tiempoRespuesta,
      href: `mailto:${correo}`,
      accion: TEXTOS_CONTACTO.escribir,
      externo: false,
      copiable: true,
    },
  ];
  if (telefono?.whatsapp) {
    formas.push({
      id: "whatsapp",
      logo: LOGO_WHATSAPP,
      tono: "exito",
      nombre: TEXTOS_CONTACTO.whatsapp,
      valor: telefono.numero,
      detalle: horario,
      href: `https://wa.me/${soloDigitos(telefono.numero)}`,
      accion: TEXTOS_CONTACTO.abrirWhatsapp,
      externo: true,
      copiable: false,
    });
  }
  if (telefono) {
    formas.push({
      id: "llamada",
      icono: Phone,
      tono: "aviso",
      nombre: TEXTOS_CONTACTO.llamada,
      valor: telefono.numero,
      detalle: horario,
      href: `tel:+${soloDigitos(telefono.numero)}`,
      accion: TEXTOS_CONTACTO.llamar,
      externo: false,
      copiable: false,
    });
  }
  if (agenda) {
    formas.push({
      id: "agenda",
      icono: CalendarDays,
      tono: "rosa",
      nombre: TEXTOS_CONTACTO.videollamada,
      valor: TEXTOS_CONTACTO.agendaValor,
      detalle: TEXTOS_CONTACTO.agendaDetalle,
      href: agenda,
      accion: TEXTOS_CONTACTO.agendar,
      externo: true,
      copiable: false,
    });
  }
  return formas;
}

/** El dibujo de una red: su logo, un globo para un sitio y un eslabón para otra */
function dibujoDeRed(tipo: Contacto["redes"][number]["tipo"]): Pick<FormaDeContacto, "logo" | "icono"> {
  if (tipo === "sitio") return { icono: Globe };
  if (tipo === "otra") return { icono: Link2 };
  return { logo: LOGOS_RED[tipo] };
}

/** Las redes, en el orden en que se cargaron en el panel */
export function formasDeSeguir(contacto: Contacto): FormaDeContacto[] {
  return contacto.redes.map(({ tipo, url }, i) => ({
    id: `red-${i}`,
    ...dibujoDeRed(tipo),
    tono: TONOS[(i + 1) % TONOS.length]!,
    nombre: RED[tipo],
    valor: sinProtocolo(url),
    detalle: "",
    href: url,
    accion: TEXTOS_CONTACTO.abrirPerfil,
    externo: true,
    copiable: false,
  }));
}

/** Cuántas formas de contactarme hay: las de escribir y las redes */
export const cuantasFormas = (contacto: Contacto) => formasDeEscribir(contacto).length + contacto.redes.length;

/**
 * El mensaje, como las frases de los otros apartados: lo que sigue a los primeros dos puntos va con el
 * degradado. Sin dos puntos, todo va sin degradado
 */
export function partirMensaje(mensaje: string): [string, string] {
  const dosPuntos = mensaje.indexOf(":");
  if (dosPuntos < 0) return [mensaje, ""];
  return [mensaje.slice(0, dosPuntos + 1), mensaje.slice(dosPuntos + 1).trim()];
}
