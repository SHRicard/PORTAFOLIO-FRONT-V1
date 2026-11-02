import { useEffect } from "react";
import { CvButton } from "@/vistas/rr-dev/components/atoms/CvButton";
import { LanguageBadge } from "@/vistas/rr-dev/components/atoms/LanguageBadge";
import { NavMenu } from "@/vistas/rr-dev/components/molecules/NavMenu";
import { ITEMS_MENU, TEXTOS } from "@/vistas/rr-dev/navegacion";

export const NAV_SHEET_ID = "nav-sheet";

interface NavSheetProps {
  activoId: string;
  cvUrl?: string;
  onCerrar: () => void;
}

/**
 * Menú de celular: un panel de vidrio que sale de la isla. Su fondo invisible tapa la
 * hamburguesa, así que tocarla de nuevo lo cierra. No puede ir adentro de la isla: el
 * desenfoque de la isla le cambiaría el tamaño al fondo y anularía el del panel.
 */
export function NavSheet({ activoId, cvUrl, onCerrar }: NavSheetProps) {
  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onCerrar();
    };

    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [onCerrar]);

  return (
    <>
      <div aria-hidden className="fixed inset-0 z-20 xl:hidden" onClick={onCerrar} />
      <div
        id={NAV_SHEET_ID}
        className="entrada-panel absolute inset-x-0 top-full z-30 mt-2 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-[20px] border border-borde bg-superficie/94 p-3 shadow-(--sombra-panel) backdrop-blur-lg backdrop-saturate-160 xl:hidden"
      >
        <NavMenu items={ITEMS_MENU} activoId={activoId} etiqueta={TEXTOS.navegacion} vertical onNavegar={onCerrar} />
        <div className="mt-3 flex flex-col items-start gap-3">
          <LanguageBadge />
          <CvButton href={cvUrl} etiqueta={TEXTOS.descargarCv} anchoCompleto />
        </div>
      </div>
    </>
  );
}
