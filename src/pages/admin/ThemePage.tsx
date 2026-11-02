import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { cargarTodasLasFuentes, combinacionDe, GRUPOS_FUENTES, nombreFuente } from "@/features/theme/fuentes";
import { resetTheme, setTheme } from "@/features/theme/themeSlice";
import type { ThemeVars } from "@/features/theme/themeTypes";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CARD_TIPOS } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Subtitle, Title } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";

type ColorKey = "primario" | "secundario" | "fondo" | "texto";
const COLORES: { key: ColorKey; label: string }[] = [
  { key: "primario", label: "Primario" },
  { key: "secundario", label: "Secundario" },
  { key: "fondo", label: "Fondo" },
  { key: "texto", label: "Texto" },
];

/**
 * Hace que la lista la dibuje la página: la nativa no siempre respeta la fuente de cada
 * opción (en Mac, nunca). Los navegadores sin soporte siguen mostrando la lista normal.
 */
const LISTA_DE_FUENTES = cn(
  "items-center [appearance:base-select] [&::picker(select)]:[appearance:base-select] [&::picker-icon]:text-[0.625rem]",
  "[&::picker(select)]:max-h-80 [&::picker(select)]:rounded-boton [&::picker(select)]:border",
  "[&::picker(select)]:border-borde [&::picker(select)]:bg-fondo [&::picker(select)]:text-base",
  "[&::picker(select)]:text-texto [&::picker(select)]:shadow-card",
);

const RADIOS = [
  { label: "Sin redondeo", value: "0px" },
  { label: "Suave", value: "0.375rem" },
  { label: "Medio", value: "0.75rem" },
  { label: "Grande", value: "1.5rem" },
];

/**
 * Pantalla PROVISORIA para probar el sistema de tema en vivo.
 * Cuando exista el servicio de preferencias del backend, estos controles se conectan a él
 * (para guardar) y las opciones salen de su endpoint de opciones.
 */
export default function ThemePage() {
  const dispatch = useAppDispatch();
  const vars = useAppSelector((state) => state.theme.vars);
  const update = (changes: Partial<ThemeVars>) => dispatch(setTheme(changes));

  useEffect(() => {
    cargarTodasLasFuentes();
  }, []);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Title>Apariencia</Title>
        <Subtitle className="mt-1 text-base">Probá cómo cambia toda la app en vivo.</Subtitle>
      </div>

      <Alert>Provisorio: los cambios no se guardan todavía. Al recargar vuelve la apariencia por defecto.</Alert>

      <Card className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          {COLORES.map(({ key, label }) => (
            <label key={key} className="space-y-1.5 text-sm font-medium text-texto">
              {label}
              <input
                type="color"
                value={vars[key]}
                onChange={(e) => update({ [key]: e.target.value })}
                className="block h-10 w-full cursor-pointer rounded-boton border border-borde bg-fondo p-1"
              />
            </label>
          ))}
        </div>

        <div className="space-y-3">
          <label className="block space-y-1.5 text-sm font-medium text-texto">
            Tipografía
            <Select
              value={vars.fuenteTitulo}
              className={LISTA_DE_FUENTES}
              style={{ fontFamily: vars.fuenteTitulo }}
              onChange={(e) => update(combinacionDe(e.target.value))}
            >
              {GRUPOS_FUENTES.map((grupo) => (
                <optgroup key={grupo.label} label={grupo.label}>
                  {grupo.fuentes.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </label>
          <p className="text-sm text-texto-suave">
            Elegí la fuente de los títulos: la de los subtítulos y la del texto se combinan solas.
          </p>

          <div className="space-y-2 rounded-card border border-borde bg-fondo p-5">
            <Title as="h2" tamano="lg">
              Tu nombre o proyecto
            </Title>
            <Subtitle>Un subtítulo corto que acompaña al título</Subtitle>
            <p className="text-texto">
              Así se lee un párrafo en tu portafolio: la historia de un proyecto, qué problema resolvió y cómo lo
              construiste.
            </p>
            <p className="pt-2 text-xs text-texto-suave">
              Títulos: {nombreFuente(vars.fuenteTitulo)} · Subtítulos: {nombreFuente(vars.fuenteSubtitulo)} · Texto:{" "}
              {nombreFuente(vars.fuenteTexto)}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium text-texto">
            Redondeo de cards
            <Select value={vars.radioCard} onChange={(e) => update({ radioCard: e.target.value })}>
              {RADIOS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1.5 text-sm font-medium text-texto">
            Redondeo de botones
            <Select value={vars.radioBoton} onChange={(e) => update({ radioBoton: e.target.value })}>
              {RADIOS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <Button estilo="texto" onClick={() => dispatch(resetTheme())}>
          Restablecer apariencia
        </Button>
      </Card>

      <section className="space-y-4">
        <h2 className="font-subtitulo text-lg font-semibold text-texto">Botones</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Sólido</Button>
          <Button estilo="contorno">Contorno</Button>
          <Button estilo="texto">Texto</Button>
          <Button estilo="peligro">Peligro</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-subtitulo text-lg font-semibold text-texto">Tipos de card</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CARD_TIPOS.map((tipo) => (
            <Card key={tipo} tipo={tipo}>
              <p className="font-titulo font-bold capitalize text-texto">{tipo}</p>
              <p className="mt-1 text-sm text-texto-suave">Así se ve una card de tipo “{tipo}”.</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
