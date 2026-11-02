/** Muestra el idioma del sitio. No es un selector: solo está en español. */
export function LanguageBadge() {
  return (
    <span className="inline-flex rounded-full border border-borde bg-superficie/60 p-[3px]">
      <span
        title="Español"
        className="inline-flex h-7.5 min-w-9 items-center justify-center rounded-full bg-primario/18 px-2.5 text-xs font-semibold tracking-[0.06em] text-secundario ring-1 ring-secundario/40 ring-inset"
      >
        ES
      </span>
    </span>
  );
}
