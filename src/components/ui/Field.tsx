import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  /** id del input al que pertenece la etiqueta */
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

/** Etiqueta + control + mensaje de error, con el espaciado estándar de los formularios */
export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-texto">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-sm text-peligro">
          {error}
        </p>
      )}
    </div>
  );
}
