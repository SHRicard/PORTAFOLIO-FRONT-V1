interface StatusBadgeProps {
  etiqueta: string;
  /** Los ms en que se enciende al entrar al apartado (ver `useEncendido`) */
  encender?: number;
}

/** Avisa que estoy disponible para trabajar, con un punto verde que late */
export function StatusBadge({ etiqueta, encender }: StatusBadgeProps) {
  return (
    <span
      data-encender={encender}
      className="inline-flex items-center gap-2 rounded-full border border-exito/35 bg-exito/8 px-4 py-1.5 text-sm font-medium text-texto backdrop-blur-sm"
    >
      <span aria-hidden className="punto-estado size-2 shrink-0 rounded-full bg-exito" />
      {etiqueta}
    </span>
  );
}
