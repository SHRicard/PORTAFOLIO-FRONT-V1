interface StatusBadgeProps {
  etiqueta: string;
}

/** Avisa que estoy disponible para trabajar, con un punto verde que late */
export function StatusBadge({ etiqueta }: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-exito/35 bg-exito/8 px-4 py-1.5 text-sm font-medium text-texto backdrop-blur-sm">
      <span aria-hidden className="punto-estado size-2 shrink-0 rounded-full bg-exito" />
      {etiqueta}
    </span>
  );
}
