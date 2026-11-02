import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle role="status" aria-label="Cargando" className={cn("size-6 animate-spin text-primario", className)} />;
}

/** Pantalla completa centrada, para mientras se verifica la sesión */
export function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}
