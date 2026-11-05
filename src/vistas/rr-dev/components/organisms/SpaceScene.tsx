import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { LUNA, TIERRA } from "@/vistas/rr-dev/astros";
import {
  duracion,
  escalaSol,
  type Medidas,
  pasoDe,
  PLANETAS,
  seDibuja,
  suavizar,
  ubicacion,
} from "@/vistas/rr-dev/camara";
import { AuroraGlow } from "@/vistas/rr-dev/components/atoms/AuroraGlow";
import { Planet } from "@/vistas/rr-dev/components/atoms/Planet";
import { Satellites } from "@/vistas/rr-dev/components/atoms/Satellites";
import { ShootingStar } from "@/vistas/rr-dev/components/atoms/ShootingStar";
import { StarField } from "@/vistas/rr-dev/components/atoms/StarField";
import { Sun } from "@/vistas/rr-dev/components/atoms/Sun";
import { prefiereMenosMovimiento } from "@/vistas/rr-dev/movimiento";

/**
 * El espacio de fondo de Inicio, Sobre mí, Habilidades, Proyectos, Contacto y el blog: el cielo de
 * estrellas, la estrella fugaz, la aurora, el sol a lo lejos y los planetas, vistos desde uno que
 * mira al sol. Va detrás de todas las páginas y no se desmonta al cambiar de apartado: la cámara se
 * aleja (o se acerca) hasta el planeta del apartado nuevo. En las demás páginas no está.
 */
export function SpaceScene() {
  const { pathname } = useLocation();
  const destino = pasoDe(pathname);
  if (destino === undefined) return null;

  // El cielo queda montado entre un apartado y otro: así las estrellas no saltan
  return (
    <div className="rr-dev escena pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <StarField />
      <ShootingStar />
      <AuroraGlow />
      {destino !== undefined && <Viaje destino={destino} />}
    </div>
  );
}

function Viaje({ destino }: { destino: number }) {
  // Las variables de la cámara van en los astros y no en toda la escena: así las estrellas, que no
  // se mueven, no se recalculan en cada cuadro del viaje
  const astros = useRef<HTMLDivElement>(null);
  const cajas = useRef<(HTMLDivElement | null)[]>([]);
  const camara = useRef<{ paso: number; medidas?: Medidas }>({ paso: destino });
  // Hasta qué paso se dibujan los planetas: durante el viaje, el más lejano de los dos
  const [hasta, setHasta] = useState(destino);

  const ubicarPlaneta = useCallback((numero: number, caja: HTMLDivElement) => {
    const { paso, medidas } = camara.current;
    if (!medidas) return;
    const { x, y, diametro } = ubicacion(numero, paso, medidas);
    caja.style.setProperty("--x", `${x}px`);
    caja.style.setProperty("--y", `${y}px`);
    caja.style.setProperty("--diametro", `${diametro}px`);
  }, []);

  // El sol se achica primero: su lugar depende de su tamaño, y el de los planetas, del lugar del sol
  const mover = useCallback(
    (paso: number) => {
      const fondo = astros.current;
      if (!fondo) return;
      camara.current.paso = paso;
      fondo.style.setProperty("--escala", String(escalaSol(paso)));
      const sol = fondo.querySelector(".sistema-solar")?.getBoundingClientRect();
      const medidas = {
        ancho: innerWidth,
        alto: innerHeight,
        solX: sol ? sol.left + sol.width / 2 : 0,
        solY: sol ? sol.top + sol.height / 2 : 0,
      };
      camara.current.medidas = medidas;
      fondo.style.setProperty("--sol-x", `${medidas.solX}px`);
      fondo.style.setProperty("--sol-y", `${medidas.solY}px`);
      cajas.current.forEach((caja, numero) => caja && ubicarPlaneta(numero, caja));
    },
    [ubicarPlaneta],
  );

  // Antes de pintar, para que nada se vea fuera de lugar
  useLayoutEffect(() => {
    mover(camara.current.paso);
    const reubicar = () => mover(camara.current.paso);
    addEventListener("resize", reubicar);
    // El sol va debajo del botón del CV, que cambia un poco de ancho cuando llega la letra
    let montado = true;
    void document.fonts?.ready.then(() => montado && reubicar());
    return () => {
      montado = false;
      removeEventListener("resize", reubicar);
    };
  }, [mover]);

  useEffect(() => {
    const desde = camara.current.paso;
    if (desde === destino) return;
    if (prefiereMenosMovimiento()) {
      mover(destino);
      setHasta(destino);
      return;
    }

    setHasta(Math.max(desde, destino));
    const segundos = duracion(desde, destino);
    let inicio: number | undefined;
    let cuadro = requestAnimationFrame(function viajar(ahora) {
      inicio ??= ahora;
      const avance = Math.min((ahora - inicio) / 1000 / segundos, 1);
      mover(desde + (destino - desde) * suavizar(avance));
      if (avance < 1) cuadro = requestAnimationFrame(viajar);
      else setHasta(destino);
    });
    return () => cancelAnimationFrame(cuadro);
  }, [destino, mover]);

  // Los satélites se ven de cerca con la Tierra de cerca, y de lejos un paso después
  const lejaniaTierra = useCallback(() => Math.min(Math.max(camara.current.paso - 2, 0), 1), []);

  return (
    <div ref={astros} className="astros">
      <div aria-hidden className="sistema-solar">
        <Sun />
      </div>
      {PLANETAS.map(
        ({ astro, clase }, numero) =>
          seDibuja(numero, hasta) && (
            <div
              key={clase}
              ref={(caja) => {
                cajas.current[numero] = caja;
                // Recién montado ya va en su lugar, sin esperar al cuadro siguiente
                if (caja) ubicarPlaneta(numero, caja);
              }}
              aria-hidden
              className={`astro ${clase}`}
            >
              <Planet astro={astro} />
              {astro === TIERRA && (
                <>
                  <Satellites lejania={lejaniaTierra} />
                  <div className="luna-noche">
                    <Planet astro={LUNA} />
                  </div>
                </>
              )}
            </div>
          ),
      )}
    </div>
  );
}
