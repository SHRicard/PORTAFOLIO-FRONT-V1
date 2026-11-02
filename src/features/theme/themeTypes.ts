/**
 * Variables del tema que se pueden elegir. Cada clave camelCase se convierte en la
 * variable CSS correspondiente: fuenteTitulo -> --fuente-titulo, radioCard -> --radio-card.
 * Las variables CSS están definidas en src/index.css.
 */
export interface ThemeVars {
  // colores (hex #RRGGBB)
  primario: string;
  secundario: string;
  fondo: string;
  texto: string;
  peligro: string;
  // tipografía (valor de font-family)
  fuenteTitulo: string;
  fuenteSubtitulo: string;
  fuenteTexto: string;
  // formas (valores CSS: rem, px, sombras)
  radioCard: string;
  radioBoton: string;
  sombraCard: string;
}
