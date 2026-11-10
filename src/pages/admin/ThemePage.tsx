import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { cargarTodasLasFuentes, combinacionDe, GRUPOS_FUENTES, nombreFuente } from "@/features/theme/fuentes";
import { SelectorNavegacion } from "@/features/theme/SelectorNavegacion";
import { SelectorPaleta } from "@/features/theme/SelectorPaleta";
import { SelectorVista } from "@/features/theme/SelectorVista";
import { resetTheme, setTheme } from "@/features/theme/themeSlice";
import type { ThemeVars } from "@/features/theme/themeTypes";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Subtitle, Title } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { NOMBRE_COMPLETO } from "@/lib/identidad";

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

/**
 * Apariencia del panel: colores, navegación y tipografía cambian SOLO el panel (y el login), y
 * todavía no se guardan. Lo único que toca la web pública es «Vista web pública», que elige qué
 * portafolio se ve y sí se guarda en el backend. Los colores de cada portafolio están en su tema.ts
 */
export default function ThemePage() {
  const dispatch = useAppDispatch();
  const vars = useAppSelector((state) => state.theme.vars);
  const update = (changes: Partial<ThemeVars>) => dispatch(setTheme(changes));

  useEffect(() => {
    cargarTodasLasFuentes();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <Title>Apariencia</Title>
        <Subtitle className="mt-1 text-base">Así se ve tu panel. Tus portafolios tienen su propio diseño.</Subtitle>
      </div>

      <Alert>
        Provisorio: los colores, la navegación y la tipografía del panel no se guardan todavía. Al recargar vuelve la
        apariencia por defecto. La vista web pública sí se guarda.
      </Alert>

      <Card>
        <SelectorPaleta />
      </Card>

      <Card>
        <SelectorNavegacion />
      </Card>

      <Card className="space-y-6">
        <div className="space-y-3">
          <label className="block space-y-1.5 text-sm font-medium text-texto">
            Tipografía
            <Select
              flecha={false}
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
              {NOMBRE_COMPLETO}
            </Title>
            <Subtitle>Un subtítulo corto que acompaña al título</Subtitle>
            <p className="text-texto">
              Así se lee un párrafo en tu panel: la historia de un proyecto, qué problema resolvió y cómo lo
              construiste.
            </p>
            <p className="pt-2 text-xs text-texto-suave">
              Títulos: {nombreFuente(vars.fuenteTitulo)} · Subtítulos: {nombreFuente(vars.fuenteSubtitulo)} · Texto:{" "}
              {nombreFuente(vars.fuenteTexto)}
            </p>
          </div>
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

      <Card>
        <SelectorVista />
      </Card>
    </div>
  );
}
