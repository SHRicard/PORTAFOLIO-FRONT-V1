import { Sparkle } from "lucide-react";
import { useId, useRef } from "react";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Title } from "@/components/ui/Typography";
import { useGetPerfilQuery } from "@/features/portafolio/portafolioApi";
import { getErrorMessage } from "@/lib/errors";
import { PASOS, PLANETAS } from "@/vistas/rr-dev/camara";
import { GradientText } from "@/vistas/rr-dev/components/atoms/GradientText";
import { SocialIconButton } from "@/vistas/rr-dev/components/atoms/SocialIconButton";
import { StatusBadge } from "@/vistas/rr-dev/components/atoms/StatusBadge";
import { ContactList } from "@/vistas/rr-dev/components/molecules/ContactList";
import { SectionReveal } from "@/vistas/rr-dev/components/organisms/SectionReveal";
import { cuantasFormas, formasDeEscribir, formasDeSeguir, partirMensaje } from "@/vistas/rr-dev/contacto";
import { TEXTOS_CONTACTO, TEXTOS_INICIO } from "@/vistas/rr-dev/contenido";
import { useSobrePlaneta } from "@/vistas/rr-dev/hooks/useSobrePlaneta";

/**
 * Al entrar al apartado, en ms, con los tiempos de Proyectos: el título, la cuenta, el mensaje, los
 * rótulos, la primera ficha, «Abierto a», la disponibilidad y las redes del celular. Las fichas se
 * encienden de a una, alternando los costados
 */
const ENCENDIDO = {
  titulo: 0,
  cuenta: 430,
  frase: 1000,
  rotulos: 1300,
  fichas: 1400,
  entreFichas: 160,
  abiertoA: 1200,
  disponible: 1500,
  redes: 2200,
};

/**
 * Los planetas que se ven en este apartado: Júpiter de cerca, Marte a la derecha del centro, y la
 * Tierra, la Luna, Venus y Mercurio junto al sol. Lo que cae encima de uno lleva un vidrio oscuro
 */
const PLANETAS_DETRAS = PLANETAS.slice(0, (PASOS["/contacto"] ?? 4) + 1).map(({ clase }) => clase);

/**
 * Contacto como Proyectos, sobre el espacio visto desde Júpiter. Al centro, arriba, el título,
 * cuántas formas de contactarme hay y mi mensaje (`contacto.mensaje`). Debajo, «Abierto a» y la
 * disponibilidad. Las formas de contactarme van en fichas, con una abierta en cada costado: desde
 * `xl`, «Escribime» a la izquierda (correo, WhatsApp, llamada y videollamada) y «Seguime» a la derecha
 * (las redes), más abajo que Marte. Todo sale de `GET /perfil`, y cada dato opcional se ve solo si
 * tiene valor. Ocupa justo el alto de la pantalla, sin scroll. En una tableta, las dos listas van una
 * al lado de la otra; en el celular, las redes van en una fila de logos
 */
export default function ContactoPage() {
  const escena = useRef<HTMLDivElement>(null);
  const redesId = useId();
  const { data: perfil, error } = useGetPerfilQuery();
  useSobrePlaneta(escena, PLANETAS_DETRAS);

  const contacto = perfil?.contacto;
  const escribir = contacto ? formasDeEscribir(contacto) : [];
  const seguir = contacto ? formasDeSeguir(contacto) : [];
  const [frase, remate] = partirMensaje(contacto?.mensaje ?? "");
  // La izquierda y la derecha se turnan: la 1.ª de la izquierda, la 1.ª de la derecha, la 2.ª de la izquierda...
  const encenderDe = (costado: 0 | 1) => (lugar: number) =>
    ENCENDIDO.fichas + (2 * lugar + costado) * ENCENDIDO.entreFichas;

  return (
    <SectionReveal>
      {/*
        El alto de la pantalla menos la barra (5rem) y la mitad del margen de la página, que se
        recupera con -my-6: así entra todo sin scroll, como Proyectos
      */}
      <div ref={escena} className="escena-contacto -my-6 h-[calc(100dvh-8rem)]">
        <div className="grid h-full grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-y-[clamp(1rem,3cqh,2rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,32.5rem)_minmax(0,1fr)] xl:gap-x-8 xl:gap-y-0 min-[106.25rem]:grid-cols-[minmax(0,1fr)_minmax(0,41.25rem)_minmax(0,1fr)] min-[106.25rem]:gap-x-12">
          {/* Arriba, al centro */}
          <div className="sombra-texto flex min-w-0 flex-col items-center gap-[clamp(0.375rem,1.2cqh,1rem)] text-center xl:col-start-2 xl:row-start-1 xl:pt-[clamp(0px,2.5cqh,1.5rem)]">
            <Title
              data-encender={ENCENDIDO.titulo}
              data-respaldo
              className="text-[length:clamp(2rem,6cqh,2.75rem)] leading-[1.05] tracking-[-0.03em] xl:text-[length:clamp(2.75rem,7cqh,4.75rem)]"
            >
              <GradientText>{TEXTOS_CONTACTO.titulo}</GradientText>
            </Title>

            {error ? (
              <Alert tipo="error">{getErrorMessage(error)}</Alert>
            ) : !contacto ? (
              <Spinner />
            ) : (
              <>
                <p
                  data-encender={ENCENDIDO.cuenta}
                  data-respaldo
                  className="flex items-center gap-2.5 font-subtitulo text-[0.9375rem] leading-tight font-medium text-texto md:gap-4 md:text-[length:clamp(1rem,2.2cqh,1.375rem)]"
                >
                  <span
                    aria-hidden
                    className="h-px w-4.5 shrink-0 bg-linear-to-r from-transparent to-secundario md:w-10"
                  />
                  {TEXTOS_CONTACTO.cuenta(cuantasFormas(contacto))}
                  <span
                    aria-hidden
                    className="h-px w-4.5 shrink-0 bg-linear-to-r from-secundario to-transparent md:w-10"
                  />
                </p>
                {frase && (
                  <p
                    data-encender={ENCENDIDO.frase}
                    data-respaldo
                    className="frase-contacto max-w-[42ch] text-[0.875rem] leading-[1.6] text-balance text-texto md:text-[length:clamp(0.9375rem,1.8cqh,1.125rem)]"
                  >
                    {frase}
                    {remate && (
                      <>
                        {" "}
                        <GradientText>{remate}</GradientText>
                      </>
                    )}
                  </p>
                )}
              </>
            )}
          </div>

          {/*
            Debajo de xl, las listas y «Abierto a» se reparten el alto que deja el texto. Desde xl esta
            caja no cuenta (`contents`): cada lista va a su costado y «Abierto a», al centro
          */}
          {perfil && contacto && (
            <div className="flex min-h-0 flex-col justify-evenly gap-[clamp(0.75rem,2.5cqh,1.5rem)] md:grid md:grid-cols-2 md:content-center md:items-start md:gap-x-10 xl:contents">
              <ContactList
                rotulo={TEXTOS_CONTACTO.escribime}
                formas={escribir}
                encenderRotulo={ENCENDIDO.rotulos}
                encenderDe={encenderDe(0)}
                className={
                  seguir.length === 0
                    ? "md:col-span-2 md:mx-auto md:w-full md:max-w-md xl:col-span-1 xl:col-start-1 xl:row-span-2 xl:row-start-1 xl:max-w-none xl:pt-[clamp(1.5rem,6.7cqh,4rem)]"
                    : "xl:col-start-1 xl:row-span-2 xl:row-start-1 xl:pt-[clamp(1.5rem,6.7cqh,4rem)]"
                }
              />

              {seguir.length > 0 && (
                <>
                  {/* Desde la tableta, en fichas; más abajo que Marte, que está a la derecha del centro */}
                  <ContactList
                    rotulo={TEXTOS_CONTACTO.seguime}
                    formas={seguir}
                    encenderRotulo={ENCENDIDO.rotulos}
                    encenderDe={encenderDe(1)}
                    className="hidden md:grid xl:col-start-3 xl:row-span-2 xl:row-start-1 xl:pt-[max(calc(22cqh+1.5rem),calc(76cqh-22rem))]"
                  />
                  {/* En el celular, una fila de logos, como las redes de Inicio */}
                  <div className="grid justify-items-center gap-2.5 md:hidden">
                    <p
                      id={redesId}
                      aria-hidden
                      data-encender={ENCENDIDO.redes}
                      data-respaldo
                      className="text-[0.6875rem] font-medium tracking-[.24em] text-texto-suave uppercase"
                    >
                      {TEXTOS_CONTACTO.seguime}
                    </p>
                    <ul aria-labelledby={redesId} data-encender={ENCENDIDO.redes} className="flex flex-wrap justify-center gap-3">
                      {contacto.redes.map((red) => (
                        <li key={red.url}>
                          <SocialIconButton tipo={red.tipo} href={red.url} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {(contacto.abiertoA.length > 0 || perfil.disponibilidad.disponible) && (
                <div className="flex min-w-0 flex-col items-center gap-[clamp(0.5rem,1.8cqh,1.125rem)] text-center md:col-span-2 xl:col-span-1 xl:col-start-2 xl:row-start-2 xl:self-start xl:pt-[clamp(1rem,3.5cqh,2.25rem)]">
                  {contacto.abiertoA.length > 0 && (
                    <div className="abierto-contacto grid justify-items-center gap-2 xl:gap-[clamp(0.375rem,1.1cqh,0.625rem)]">
                      <p
                        data-encender={ENCENDIDO.abiertoA}
                        data-respaldo
                        className="text-[0.6875rem] font-medium tracking-[.24em] text-texto-suave uppercase xl:text-[length:clamp(0.6875rem,1.3cqh,0.8rem)]"
                      >
                        {TEXTOS_CONTACTO.abiertoA}
                      </p>
                      <ul
                        data-encender={ENCENDIDO.abiertoA}
                        className="flex max-w-[34rem] flex-wrap justify-center gap-1.5 xl:max-w-[clamp(22rem,calc(38cqh+4rem),34rem)] xl:gap-2"
                      >
                        {contacto.abiertoA.map((tema) => (
                          <li
                            key={tema}
                            className="inline-flex items-center gap-1.5 rounded-full border border-secundario/30 bg-[color-mix(in_srgb,var(--primario)_14%,color-mix(in_srgb,var(--superficie)_82%,transparent))] px-2.5 py-1 text-[0.71875rem] whitespace-nowrap text-texto backdrop-blur-sm xl:px-[clamp(0.625rem,1.35cqh,0.8125rem)] xl:py-[clamp(0.25rem,0.6cqh,0.375rem)] xl:text-[length:clamp(0.71875rem,1.4cqh,0.84375rem)]"
                          >
                            <Sparkle className="size-3 shrink-0 text-secundario" aria-hidden />
                            {tema}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {perfil.disponibilidad.disponible && (
                    <div className="hidden md:block">
                      <StatusBadge
                        etiqueta={perfil.disponibilidad.texto || TEXTOS_INICIO.disponible}
                        encender={ENCENDIDO.disponible}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionReveal>
  );
}
