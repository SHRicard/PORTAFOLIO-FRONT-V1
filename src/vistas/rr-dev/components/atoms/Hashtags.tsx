import { cn } from "@/lib/cn";
import { hashtag } from "@/vistas/rr-dev/blog";
import { TEXTOS_BLOG } from "@/vistas/rr-dev/contenido";

interface HashtagsProps {
  etiquetas: string[];
  className?: string;
}

/** Los temas de una publicación, como hashtags de acento */
export function Hashtags({ etiquetas, className }: HashtagsProps) {
  if (!etiquetas.length) return null;

  return (
    <ul
      aria-label={TEXTOS_BLOG.temas}
      className={cn("flex flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-secundario", className)}
    >
      {etiquetas.map((etiqueta) => (
        <li key={etiqueta}>{hashtag(etiqueta)}</li>
      ))}
    </ul>
  );
}
