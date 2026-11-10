import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { AuroraGlow } from "@/vistas/rr-dev/components/atoms/AuroraGlow";
import { StarField } from "@/vistas/rr-dev/components/atoms/StarField";
import { Sun } from "@/vistas/rr-dev/components/atoms/Sun";
import { Logo } from "@/vistas/rr-dev/components/molecules/Logo";

/**
 * El login como un amanecer: el cielo de RR-DEV y el sol de Inicio, que sale por abajo y tiñe el
 * cielo con su luz. Arriba, el logo, en el mismo lugar que en la isla, con su cometa al llegar, y
 * «Volver al inicio». Al centro, lo que se le pase: el saludo y el formulario. Ocupa la pantalla
 * entera, sin scroll. El tamaño del sol y cuánto asoma están en `.amanecer` (estilos.css)
 */
export function SunriseScene({ children }: { children: ReactNode }) {
  return (
    <div className="rr-dev amanecer relative isolate flex min-h-dvh flex-col overflow-hidden bg-fondo text-texto">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <StarField />
        <AuroraGlow />
        <div className="tinte-amanecer" />
        <div className="sol-amanecer">
          <Sun />
        </div>
      </div>

      {/* Como el encabezado de la isla: 12px arriba, el 90% del ancho y una fila de 68px */}
      <header className="entra-amanecer pt-3">
        <div className="contenedor flex h-17 items-center justify-between gap-4 px-[clamp(12px,2vw,24px)]">
          <Logo brillarAlLlegar />
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-texto/10 bg-superficie/50 p-2.5 text-sm text-texto-suave backdrop-blur-sm transition-colors duration-300 hover:text-texto sm:px-3.5 sm:py-2"
          >
            <ArrowLeft className="size-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">Volver al inicio</span>
          </Link>
        </div>
      </header>

      {/* Lo de abajo queda libre para el sol */}
      <main className="contenedor grid flex-1 place-items-center pt-4 pb-[calc(var(--asoma)+1rem)]">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
