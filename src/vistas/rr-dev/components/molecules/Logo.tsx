import { type MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { APELLIDO, NOMBRE } from "@/lib/identidad";
import { BrandMark } from "@/vistas/rr-dev/components/atoms/BrandMark";
import { ACCESO_ESCONDIDO, sumarToque } from "@/vistas/rr-dev/navegacion";

/** Lo que tarda un cometa en cruzar el logo: el mismo tiempo que `.cometa-logo` en estilos.css */
const COMETA_MS = 1600;
/** Con `brillarAlLlegar`: cuánto después de aparecer pasa el cometa, cuando el logo ya se ve */
const LLEGADA_MS = 700;

interface LogoProps {
  /** Hace pasar un cometa al aparecer, como en el login */
  brillarAlLlegar?: boolean;
}

/**
 * Icono de la marca y mi nombre, con el apellido resaltado. Lleva a Inicio, y con cada toque cruza
 * por debajo del nombre el cometa del menú, con su cola. 7 toques seguidos llevan al login
 * (`ACCESO_ESCONDIDO`). No se selecciona el texto ni hace zoom en el celular al tocarlo seguido
 */
export function Logo({ brillarAlLlegar = false }: LogoProps) {
  const navegar = useNavigate();
  const toques = useRef({ cuenta: 0, ultimo: -Infinity });
  const proximo = useRef(0);
  const relojes = useRef(new Set<number>());
  const [cometas, setCometas] = useState<number[]>([]);

  useEffect(() => {
    const pendientes = relojes.current;
    return () => pendientes.forEach((reloj) => window.clearTimeout(reloj));
  }, []);

  // Si se toca rápido, pasan varios. Cada uno se va al terminar de cruzar
  const pasarCometa = useCallback(() => {
    const cometa = proximo.current++;
    setCometas((lista) => [...lista, cometa]);
    const reloj = window.setTimeout(() => {
      relojes.current.delete(reloj);
      setCometas((lista) => lista.filter((otro) => otro !== cometa));
    }, COMETA_MS);
    relojes.current.add(reloj);
  }, []);

  useEffect(() => {
    if (!brillarAlLlegar) return;
    const reloj = window.setTimeout(pasarCometa, LLEGADA_MS);
    return () => window.clearTimeout(reloj);
  }, [brillarAlLlegar, pasarCometa]);

  function alTocar(evento: MouseEvent<HTMLAnchorElement>) {
    const ahora = performance.now();
    const cuenta = sumarToque(toques.current.cuenta, toques.current.ultimo, ahora);
    const completo = cuenta >= ACCESO_ESCONDIDO.toques;
    toques.current = completo ? { cuenta: 0, ultimo: -Infinity } : { cuenta, ultimo: ahora };
    pasarCometa();

    if (completo) {
      evento.preventDefault();
      void navegar(ACCESO_ESCONDIDO.ruta);
    }
  }

  return (
    <Link
      to="/"
      onClick={alTocar}
      className="logo-isla relative inline-flex touch-manipulation items-center gap-2 font-titulo text-lg font-semibold whitespace-nowrap text-texto select-none sm:text-xl"
    >
      <BrandMark />
      <span>
        {NOMBRE} <span className="text-secundario">{APELLIDO}</span>
      </span>
      {cometas.map((cometa) => (
        <span key={cometa} aria-hidden className="cometa-logo">
          <span className="cola" />
          <span className="cabeza" />
        </span>
      ))}
    </Link>
  );
}
