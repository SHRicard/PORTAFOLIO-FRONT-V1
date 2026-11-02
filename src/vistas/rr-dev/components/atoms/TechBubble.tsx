import { cva, type VariantProps } from "class-variance-authority";
import { BrandLogo } from "@/vistas/rr-dev/components/atoms/BrandLogo";
import type { Tecnologia } from "@/vistas/rr-dev/contenido";
import { LOGOS_TECNOLOGIA } from "@/vistas/rr-dev/logos";

const burbuja = cva(
  "inline-flex items-center justify-center rounded-full border border-borde bg-superficie/75 text-texto-suave shadow-(--sombra-isla) backdrop-blur-[10px] transition-[color,border-color,scale] duration-300 ease-(--rebote) hover:scale-108 hover:border-secundario/60 hover:text-secundario",
  {
    variants: {
      tamano: { sm: "size-10", md: "size-12", lg: "size-14" },
    },
    defaultVariants: { tamano: "md" },
  },
);

const logo = cva("", {
  variants: {
    tamano: { sm: "size-4.5", md: "size-5.5", lg: "size-6.5" },
  },
  defaultVariants: { tamano: "md" },
});

interface TechBubbleProps extends VariantProps<typeof burbuja> {
  tecnologia: Tecnologia;
}

/** Burbuja de vidrio con el logo de una tecnología. Su nombre se ve al pasar por encima. */
export function TechBubble({ tecnologia, tamano }: TechBubbleProps) {
  return (
    <span role="img" aria-label={tecnologia.label} title={tecnologia.label} className={burbuja({ tamano })}>
      <BrandLogo logo={LOGOS_TECNOLOGIA[tecnologia.id]} className={logo({ tamano })} />
    </span>
  );
}
