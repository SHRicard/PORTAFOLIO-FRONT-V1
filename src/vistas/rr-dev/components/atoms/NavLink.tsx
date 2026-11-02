import type { ReactNode, Ref } from "react";
import { Link } from "react-router";
import { cn } from "@/lib/cn";

interface NavLinkProps {
  href: string;
  activo: boolean;
  /** Menú de celular: ocupa todo el ancho, con un punto antes del texto */
  vertical: boolean;
  onClick?: () => void;
  ref?: Ref<HTMLAnchorElement>;
  children: ReactNode;
}

export function NavLink({ href, activo, vertical, onClick, ref, children }: NavLinkProps) {
  return (
    <Link
      ref={ref}
      to={href}
      onClick={onClick}
      aria-current={activo ? "true" : undefined}
      className={cn(
        "relative z-10 inline-flex items-center font-subtitulo text-[0.9rem] font-medium whitespace-nowrap transition-colors hover:text-secundario",
        activo ? "text-secundario" : "text-texto",
        vertical
          ? "w-full rounded-lg py-3 pr-4 pl-7 hover:bg-primario/10"
          : cn("rounded-full px-3 py-2", !activo && "hover:bg-primario/8"),
        vertical &&
          activo &&
          "after:absolute after:top-1/2 after:left-3 after:size-1.5 after:-translate-y-1/2 after:rounded-full after:bg-secundario after:shadow-[0_0_8px_var(--secundario)]",
      )}
    >
      {children}
    </Link>
  );
}
