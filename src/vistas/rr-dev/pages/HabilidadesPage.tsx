import { useRef } from "react";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Title } from "@/components/ui/Typography";
import { useGetPerfilQuery } from "@/features/portafolio/portafolioApi";
import { getErrorMessage } from "@/lib/errors";
import { PASOS, PLANETAS } from "@/vistas/rr-dev/camara";
import { GradientText } from "@/vistas/rr-dev/components/atoms/GradientText";
import { SkillRow } from "@/vistas/rr-dev/components/molecules/SkillRow";
import { SkillSide } from "@/vistas/rr-dev/components/molecules/SkillSide";
import { SectionReveal } from "@/vistas/rr-dev/components/organisms/SectionReveal";
import { TEXTOS_HABILIDADES } from "@/vistas/rr-dev/contenido";
import { armarAreas, repartirColumnas } from "@/vistas/rr-dev/habilidades";
import { useSobrePlaneta } from "@/vistas/rr-dev/hooks/useSobrePlaneta";

/** Al entrar al apartado, en ms, con los tiempos de Sobre mí: el título, la cuenta, la frase, cada costado y los renglones del celular */
const ENCENDIDO = {
  titulo: 0,
  cuenta: 430,
  frase: 1000,
  izquierda: 1400,
  derecha: 1850,
  renglones: 1400,
};
/** Ms entre un renglón del celular y el siguiente */
const PASO_RENGLON = 600;

/** El planeta de cerca en este apartado: lo que cae encima lleva un vidrio oscuro */
const PLANETA = PLANETAS[PASOS["/habilidades"] ?? 2]?.clase ?? "tierra";

/**
 * Habilidades como Sobre mí, sobre el espacio visto desde la Tierra. Al centro, el título, cuántas
 * tecnologías y áreas hay y una frase: que sigo aprendiendo. A los costados, desde `xl`, una
 * constelación por área en columnas parejas: las dos áreas con más habilidades pegadas al texto, una
 * de cada lado, y las demás afuera. La izquierda termina antes de la Tierra y la derecha empieza
 * debajo del sol, Mercurio y Venus. Ocupa justo el alto de la pantalla, sin scroll. Debajo de `xl`,
 * el texto va arriba y cada área en un renglón
 */
export default function HabilidadesPage() {
  const escena = useRef<HTMLDivElement>(null);
  const { data: perfil, error } = useGetPerfilQuery();
  useSobrePlaneta(escena, PLANETA);

  const habilidades = perfil?.habilidades ?? [];
  const areas = armarAreas(habilidades);
  const { izquierda, derecha } = repartirColumnas(areas);

  return (
    <SectionReveal>
      {/*
        El alto de la pantalla menos la barra (5rem) y la mitad del margen de la página, que se
        recupera con -my-6: así entra todo sin scroll, como Sobre mí
      */}
      <div ref={escena} className="escena-habilidades -my-6 h-[calc(100dvh-8rem)]">
        <div className="grid h-full grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,32.5rem)_minmax(0,1fr)] xl:gap-x-8 min-[106.25rem]:grid-cols-[minmax(0,1fr)_minmax(0,41.25rem)_minmax(0,1fr)] min-[106.25rem]:gap-x-12">
          {/* Arriba, a la altura del texto: más abajo quedaría encima de la Tierra */}
          <div className="hidden min-h-0 pt-[clamp(0px,4cqh,3rem)] xl:block">
            <div className="h-[min(37rem,58cqh)]">
              {izquierda.length > 0 && (
                <SkillSide columnas={izquierda} lado="izquierda" encender={ENCENDIDO.izquierda} />
              )}
            </div>
          </div>

          <div className="sombra-texto flex min-h-0 min-w-0 flex-col items-center gap-[clamp(0.75rem,2.8cqh,1.5rem)] text-center xl:justify-center">
            <div className="flex flex-col items-center gap-[clamp(0.375rem,1.2cqh,1rem)]">
              <Title
                data-encender={ENCENDIDO.titulo}
                data-respaldo
                className="text-[length:clamp(2rem,6cqh,2.75rem)] leading-[1.05] tracking-[-0.03em] xl:text-[length:clamp(2.75rem,7cqh,4.75rem)]"
              >
                <GradientText>{TEXTOS_HABILIDADES.titulo}</GradientText>
              </Title>

              {error ? (
                <Alert tipo="error">{getErrorMessage(error)}</Alert>
              ) : !perfil ? (
                <Spinner />
              ) : (
                <>
                  {habilidades.length > 0 && (
                    <p
                      data-encender={ENCENDIDO.cuenta}
                      data-respaldo
                      className="cuenta-habilidades flex items-center gap-2.5 font-subtitulo text-[0.9375rem] leading-tight font-medium text-texto md:gap-4 md:text-[length:clamp(1rem,2.2cqh,1.375rem)]"
                    >
                      <span
                        aria-hidden
                        className="h-px w-4.5 shrink-0 bg-linear-to-r from-transparent to-secundario md:w-10"
                      />
                      {TEXTOS_HABILIDADES.cuenta(habilidades.length, areas.length)}
                      <span
                        aria-hidden
                        className="h-px w-4.5 shrink-0 bg-linear-to-r from-secundario to-transparent md:w-10"
                      />
                    </p>
                  )}
                  <p
                    data-encender={ENCENDIDO.frase}
                    data-respaldo
                    className="frase-habilidades max-w-[32ch] text-[0.875rem] leading-[1.6] text-balance text-texto md:text-[length:clamp(0.9375rem,1.8cqh,1.125rem)]"
                  >
                    {TEXTOS_HABILIDADES.frase} <GradientText>{TEXTOS_HABILIDADES.fraseRemate}</GradientText>
                  </p>
                </>
              )}
            </div>

            {/* Debajo de xl no hay costados: cada área va en un renglón */}
            {areas.length > 0 && (
              <div className="grid justify-items-center gap-[clamp(0.5rem,2.2cqh,1.25rem)] [--burbuja:clamp(1.375rem,4.2cqh,1.875rem)] xl:hidden">
                {areas.map((area, orden) => (
                  <SkillRow
                    key={area.categoria}
                    area={area}
                    encender={ENCENDIDO.renglones + orden * PASO_RENGLON}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Empieza debajo del sol, Mercurio y Venus, y un poco más afuera que en Sobre mí: así no queda pegada a Venus */}
          <div className="hidden min-h-0 pt-[max(11rem,27cqh)] xl:block xl:pl-2.5 min-[106.25rem]:pl-10">
            {derecha.length > 0 && <SkillSide columnas={derecha} lado="derecha" encender={ENCENDIDO.derecha} />}
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}
