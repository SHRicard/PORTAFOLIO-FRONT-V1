import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { getContrastColor, isHexColor } from "@/lib/color";
import { applyTheme, toCssVarName } from "./applyTheme";
import { defaultNavegacion, defaultPaleta, defaultTheme, defaultVistaWeb } from "./defaultTheme";
import { cargarFuente, cargarTodasLasFuentes, combinacionDe, GRUPOS_FUENTES, nombreFuente } from "./fuentes";
import { PALETAS } from "./paletas";
import { VISTAS } from "@/vistas";
import themeReducer, { resetTheme, setNavegacion, setPaleta, setTheme, setVistaWeb } from "./themeSlice";

const FUENTES = GRUPOS_FUENTES.flatMap((grupo) => grupo.fuentes);
const fuente = (label: string) => FUENTES.find((f) => f.label === label)!;

describe("tema", () => {
  it("convierte claves camelCase en variables CSS", () => {
    expect(toCssVarName("primario")).toBe("--primario");
    expect(toCssVarName("fuenteTitulo")).toBe("--fuente-titulo");
    expect(toCssVarName("radioCard")).toBe("--radio-card");
  });

  it("setTheme cambia solo lo indicado y resetTheme vuelve al inicio", () => {
    let state = themeReducer(undefined, setTheme({ primario: "#ff0000" }));
    expect(state.vars.primario).toBe("#ff0000");
    expect(state.vars.secundario).toBe(defaultTheme.secundario);
    state = themeReducer(state, resetTheme());
    expect(state.vars).toEqual(defaultTheme);
  });

  it("setNavegacion cambia el estilo sin tocar las variables y resetTheme lo devuelve", () => {
    let state = themeReducer(undefined, setNavegacion("tabs"));
    expect(state.navegacion).toBe("tabs");
    expect(state.vars).toEqual(defaultTheme);
    state = themeReducer(state, resetTheme());
    expect(state.navegacion).toBe(defaultNavegacion);
  });

  it("applyTheme escribe las variables y calcula el texto sobre el primario", () => {
    const root = document.createElement("div");
    applyTheme({ ...defaultTheme, primario: "#facc15", fuenteTitulo: "Poppins, sans-serif" }, root);
    expect(root.style.getPropertyValue("--primario")).toBe("#facc15");
    expect(root.style.getPropertyValue("--fuente-titulo")).toBe("Poppins, sans-serif");
    expect(root.style.getPropertyValue("--primario-texto")).toBe("#000000"); // amarillo claro -> texto negro
    expect(root.style.getPropertyValue("--peligro-texto")).toBe("#000000"); // rojo por defecto, claro -> texto negro
    expect(root.style.getPropertyValue("--texto-suave")).toBe(defaultTheme.textoSuave);
    expect(root.style.getPropertyValue("--esquema")).toBe("dark");
  });

  it("elige texto blanco sobre colores oscuros y negro sobre claros", () => {
    expect(getContrastColor("#000000")).toBe("#ffffff");
    expect(getContrastColor("#4f46e5")).toBe("#ffffff");
    expect(getContrastColor("#ffffff")).toBe("#000000");
    expect(getContrastColor("#fff")).toBe("#000000");
    expect(getContrastColor("no-es-un-color")).toBe("#ffffff");
  });

  it("valida colores hex", () => {
    expect(isHexColor("#abc")).toBe(true);
    expect(isHexColor("#a1b2c3")).toBe(true);
    expect(isHexColor("red")).toBe(false);
    expect(isHexColor("#12345")).toBe(false);
  });
});

describe("vistas de la web pública", () => {
  it("la vista por defecto existe y las ids no se repiten", () => {
    const ids = VISTAS.map((v) => v.id);
    expect(ids).toContain(defaultVistaWeb);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cada diseño tiene su propio nombre", () => {
    const nombres = VISTAS.map((v) => v.nombre.trim());
    expect(nombres.every(Boolean)).toBe(true);
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it("setVistaWeb la cambia sin tocar el resto y resetTheme la devuelve", () => {
    let state = themeReducer(undefined, setVistaWeb("otra"));
    expect(state.vistaWeb).toBe("otra");
    expect(state.vars).toEqual(defaultTheme);
    state = themeReducer(state, resetTheme());
    expect(state.vistaWeb).toBe(defaultVistaWeb);
  });
});

describe("paletas", () => {
  const luminancia = (hex: string) => {
    const [r, g, b] = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };
  const contraste = (a: string, b: string) => {
    const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
    return (claro! + 0.05) / (oscuro! + 0.05);
  };

  it("toda paleta se lee bien: el texto y los enlaces pasan WCAG AA", () => {
    for (const { nombre, colores } of PALETAS) {
      for (const fondo of [colores.fondo, colores.superficie]) {
        for (const color of [colores.texto, colores.textoSuave, colores.secundario, colores.peligro]) {
          expect(contraste(color, fondo), `${nombre}: ${color} sobre ${fondo}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("el rojo de alertas y etiquetas se lee sobre su propio tinte", () => {
    const canal = (hex: string, i: number) => parseInt(hex.slice(i, i + 2), 16);
    const tinte = (color: string, fondo: string) =>
      `#${[1, 3, 5]
        .map((i) => Math.round(canal(color, i) * 0.1 + canal(fondo, i) * 0.9))
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")}`;

    for (const { nombre, colores } of PALETAS) {
      for (const fondo of [colores.fondo, colores.superficie]) {
        const sobreTinte = contraste(colores.peligro, tinte(colores.peligro, fondo));
        expect(sobreTinte, `${nombre}: peligro sobre su tinte en ${fondo}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("los colores de cada paleta son hex de 6 dígitos y las ids no se repiten", () => {
    for (const { colores } of PALETAS) {
      const { esquema: _esquema, ...hex } = colores;
      for (const color of Object.values(hex)) expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(new Set(PALETAS.map((p) => p.id)).size).toBe(PALETAS.length);
  });

  it("setPaleta cambia todos los colores, sin tocar fuentes ni formas", () => {
    const antes = themeReducer(undefined, setTheme({ fondo: "#123456", texto: "#654321", radioCard: "2rem" }));
    const state = themeReducer(antes, setPaleta(defaultPaleta.id));
    expect(state.vars.fondo).toBe(defaultPaleta.colores.fondo);
    expect(state.vars.texto).toBe(defaultPaleta.colores.texto);
    expect(state.vars.radioCard).toBe("2rem");
    expect(state.paleta).toBe(defaultPaleta.id);
  });

  it("una paleta que no existe se ignora", () => {
    const antes = themeReducer(undefined, setTheme({ fondo: "#123456" }));
    expect(themeReducer(antes, setPaleta("no-existe"))).toEqual(antes);
  });

  it("index.css arranca con la paleta por defecto, para que no parpadee al cargar", () => {
    const css = readFileSync("src/index.css", "utf-8");
    for (const [clave, valor] of Object.entries(defaultPaleta.colores)) {
      expect(css).toContain(`${toCssVarName(clave)}: ${valor};`);
    }
  });
});

describe("fuentes", () => {
  it("no repite opciones e incluye las fuentes por defecto, para que el selector las muestre", () => {
    const valores = FUENTES.map((f) => f.value);
    expect(new Set(valores).size).toBe(valores.length);
    expect(valores).toContain(defaultTheme.fuenteTitulo);
    expect(valores).toContain(defaultTheme.fuenteSubtitulo);
    expect(valores).toContain(defaultTheme.fuenteTexto);
  });

  it("incluye las fuentes que acepta el backend", () => {
    const labels = FUENTES.map((f) => f.label);
    for (const nombre of ["Inter", "Poppins", "Roboto", "Montserrat", "Playfair Display", "Lora", "Space Grotesk"]) {
      expect(labels).toContain(nombre);
    }
  });

  it("usa el nombre con el que cada paquete registra la fuente y siempre deja un respaldo", () => {
    expect(fuente("Inter").value).toBe('"Inter Variable", ui-sans-serif, system-ui, sans-serif');
    expect(fuente("Poppins").value).toBe('"Poppins", ui-sans-serif, system-ui, sans-serif');
    expect(fuente("Lora").value).toBe('"Lora Variable", ui-serif, Georgia, serif');
    expect(fuente("Fira Code").value).toBe('"Fira Code Variable", ui-monospace, Menlo, monospace');
  });

  it("cada fuente tiene una combinación propia, armada con fuentes que existen", () => {
    const valores = FUENTES.map((f) => f.value);
    for (const { label, value } of FUENTES) {
      const combinacion = combinacionDe(value);
      expect(combinacion.fuenteTitulo, label).toBe(value);
      expect(valores, label).toContain(combinacion.fuenteSubtitulo);
      expect(valores, label).toContain(combinacion.fuenteTexto);
    }
    // Una fuente nueva sin combinación repetiría la misma en las tres partes
    const sinCombinar = FUENTES.filter((f) => {
      const { fuenteSubtitulo, fuenteTexto } = combinacionDe(f.value);
      return fuenteSubtitulo === f.value && fuenteTexto === f.value;
    });
    expect(sinCombinar.map((f) => f.label)).toEqual(["Sistema (sans-serif)"]);
  });

  it("al elegir el título salen el subtítulo y el texto de su combinación", () => {
    expect(combinacionDe(fuente("Lexend").value)).toEqual({
      fuenteTitulo: fuente("Lexend").value,
      fuenteSubtitulo: fuente("Lexend").value,
      fuenteTexto: fuente("Source Serif 4").value,
    });
    expect(combinacionDe(fuente("Playfair Display").value)).toEqual({
      fuenteTitulo: fuente("Playfair Display").value,
      fuenteSubtitulo: fuente("Lato").value,
      fuenteTexto: fuente("Lato").value,
    });
  });

  it("una fuente desconocida se usa en las tres partes y se muestra tal cual", () => {
    expect(combinacionDe("Comic Sans MS")).toEqual({
      fuenteTitulo: "Comic Sans MS",
      fuenteSubtitulo: "Comic Sans MS",
      fuenteTexto: "Comic Sans MS",
    });
    expect(nombreFuente("Comic Sans MS")).toBe("Comic Sans MS");
    expect(nombreFuente(fuente("Lora").value)).toBe("Lora");
  });

  it("cargarFuente baja la fuente elegida y solo esa", async () => {
    const inter = vi.spyOn(fuente("Inter"), "cargar").mockResolvedValue(undefined);
    const roboto = vi.spyOn(fuente("Roboto"), "cargar").mockResolvedValue(undefined);
    await cargarFuente(fuente("Inter").value);
    expect(inter).toHaveBeenCalledOnce();
    expect(roboto).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it("cargarFuente no falla con las del sistema, con valores desconocidos ni si la descarga se cae", async () => {
    await expect(cargarFuente(fuente("Serif").value)).resolves.toBeUndefined();
    await expect(cargarFuente("Comic Sans MS")).resolves.toBeUndefined();
    vi.spyOn(fuente("Lora"), "cargar").mockRejectedValue(new Error("sin conexión"));
    await expect(cargarFuente(fuente("Lora").value)).resolves.toBeUndefined();
    vi.restoreAllMocks();
  });

  it("cargarTodasLasFuentes pide el archivo de cada fuente aunque una falle", async () => {
    const load = vi.fn().mockResolvedValue([]);
    load.mockRejectedValueOnce(new Error("sin conexión"));
    Object.defineProperty(document, "fonts", { value: { load }, configurable: true });
    const cargas = FUENTES.filter((f) => f.cargar).map((f) => vi.spyOn(f, "cargar").mockResolvedValue(undefined));

    await expect(cargarTodasLasFuentes()).resolves.toBeUndefined();

    cargas.forEach((cargar) => expect(cargar).toHaveBeenCalledOnce());
    expect(load).toHaveBeenCalledTimes(FUENTES.length);
    expect(load).toHaveBeenCalledWith(`16px ${fuente("Inter").value}`, "Inter");
    Reflect.deleteProperty(document, "fonts");
    vi.restoreAllMocks();
  });
});
