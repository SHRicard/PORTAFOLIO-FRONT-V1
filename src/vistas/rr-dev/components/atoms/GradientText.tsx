interface GradientTextProps {
  children: string;
}

/** Texto pintado con el degradado de la paleta. Es para títulos grandes: `primario` no se lee en texto chico. */
export function GradientText({ children }: GradientTextProps) {
  return (
    <span className="bg-linear-120 from-secundario via-primario to-secundario bg-clip-text text-transparent">
      {children}
    </span>
  );
}
