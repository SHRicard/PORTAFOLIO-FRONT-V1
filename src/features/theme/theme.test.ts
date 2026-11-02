import { describe, expect, it, vi } from "vitest";
import { getContrastColor, isHexColor } from "@/lib/color";
import { applyTheme, toCssVarName } from "./applyTheme";
import { defaultTheme } from "./defaultTheme";
import { cargarFuente, cargarTodasLasFuentes, combinacionDe, GRUPOS_FUENTES, nombreFuente } from "./fuentes";
import themeReducer, { resetTheme, setTheme } from "./themeSlice";

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

  it("applyTheme escribe las variables y calcula el texto sobre el primario", () => {
    const root = document.createElement("div");
    applyTheme({ ...defaultTheme, primario: "#facc15", fuenteTitulo: "Poppins, sans-serif" }, root);
    expect(root.style.getPropertyValue("--primario")).toBe("#facc15");
    expect(root.style.getPropertyValue("--fuente-titulo")).toBe("Poppins, sans-serif");
    expect(root.style.getPropertyValue("--primario-texto")).toBe("#000000"); // amarillo claro -> texto negro
    expect(root.style.getPropertyValue("--peligro-texto")).toBe("#ffffff"); // rojo por defecto -> texto blanco
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
