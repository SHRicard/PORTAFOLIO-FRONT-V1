interface TechTagProps {
  etiqueta: string;
}

/** Una palabra con un rombito de acento adelante */
export function TechTag({ etiqueta }: TechTagProps) {
  return (
    <span className="inline-flex items-center gap-3 font-medium whitespace-nowrap text-texto before:size-1.5 before:rotate-45 before:rounded-[1px] before:bg-secundario">
      {etiqueta}
    </span>
  );
}
