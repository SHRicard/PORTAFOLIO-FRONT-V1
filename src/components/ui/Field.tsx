import { useCallback, useMemo, useState, type ReactNode } from "react";
import { CampoContexto } from "./CajaCampo";

interface FieldProps {
  label: string;
  /** id del input al que pertenece la etiqueta */
  htmlFor: string;
  /** Una pista corta (ej. "hasta 200 MB"): va debajo del campo */
  ayuda?: string;
  error?: string;
  children: ReactNode;
}

/**
 * Etiqueta + control + mensaje de error, con el espaciado estándar de los formularios.
 * Si el control es de los que llevan la etiqueta adentro (Input, Textarea, Select, CampoFichas,
 * CampoArchivo) y tiene el id de htmlFor, la dibuja él y acá no se repite. Si no, va arriba
 */
export function Field({ label, htmlFor, ayuda, error, children }: FieldProps) {
  const [adentro, setAdentro] = useState(0);
  const registrar = useCallback(() => {
    setAdentro((n) => n + 1);
    return () => setAdentro((n) => n - 1);
  }, []);
  const campo = useMemo(() => ({ id: htmlFor, etiqueta: label, registrar }), [htmlFor, label, registrar]);
  const flota = adentro > 0;

  return (
    <CampoContexto.Provider value={campo}>
      <div className="min-w-0 space-y-1.5">
        {!flota && (
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <label htmlFor={htmlFor} className="text-sm font-medium text-texto">
              {label}
            </label>
            {ayuda && <span className="text-xs text-texto-suave">{ayuda}</span>}
          </div>
        )}
        {children}
        {error && (
          <p role="alert" className="text-sm text-peligro">
            {error}
          </p>
        )}
        {flota && ayuda && <p className="text-xs text-texto-suave">{ayuda}</p>}
      </div>
    </CampoContexto.Provider>
  );
}
