import { act, StrictMode, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/app/store";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { sessionStarted } from "@/features/auth/authActions";
import type { Archivo } from "@/features/archivos/types";
import { BlogLista } from "@/features/blog/BlogLista";
import { EntradaDetalle } from "@/features/blog/EntradaDetalle";
import { EntradaForm } from "@/features/blog/EntradaForm";
import type { Entrada } from "@/features/blog/types";
import type { Estudio } from "@/features/estudios/types";
import type { Experiencia } from "@/features/experiencia/types";
import { PerfilForm } from "@/features/perfil/PerfilForm";
import type { Perfil } from "@/features/perfil/types";
import { ProyectoForm } from "@/features/proyectos/ProyectoForm";
import type { Proyecto } from "@/features/proyectos/types";
import { defaultTheme } from "@/features/theme/defaultTheme";
import { GRUPOS_FUENTES } from "@/features/theme/fuentes";
import { PALETAS } from "@/features/theme/paletas";
import { useAppSelector } from "@/app/hooks";
import { setNavegacion, setPaleta } from "@/features/theme/themeSlice";
import { useAplicarTema } from "@/features/theme/useAplicarTema";
import { varsDeVista } from "@/vistas/useTemaVista";
import { api } from "@/services/api";
import { ConfirmarProvider, useConfirmar } from "@/components/ui/Confirmar";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import HomePage from "@/pages/HomePage";
import { VISTAS } from "@/vistas";
import ArchivosPage from "./ArchivosPage";
import DashboardPage from "./DashboardPage";
import EntradaFormPage from "./EntradaFormPage";
import EntradasPage from "./EntradasPage";
import EstudioFormPage from "./EstudioFormPage";
import EstudiosPage from "./EstudiosPage";
import ExperienciaFormPage from "./ExperienciaFormPage";
import ExperienciaPage from "./ExperienciaPage";
import ProyectoFormPage from "./ProyectoFormPage";
import ProyectosPage from "./ProyectosPage";
import ThemePage from "./ThemePage";

/** Las pantallas del panel renderizadas de verdad, con el backend simulado */

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const fechas = { createdAt: "2026-10-30T12:00:00.000Z", updatedAt: "2026-10-30T12:00:00.000Z" };

const proyecto = (id: string, cambios: Partial<Proyecto> = {}): Proyecto => ({
  id,
  titulo: `P${id}`,
  slug: `p${id}`,
  tipo: "personal",
  rol: "Dev",
  fecha: "2026-09",
  resumen: "R",
  descripcion: "D",
  tecnologias: [],
  repositorios: [],
  galeria: [],
  documentos: [],
  destacado: false,
  estado: "publicado",
  orden: Number(id),
  ...fechas,
  ...cambios,
});

const estudio = (id: string, certificado: Estudio["certificado"] = null): Estudio => ({
  id,
  tipo: "curso",
  institucion: "I",
  titulo: `E${id}`,
  desde: "2022-01",
  hasta: null,
  finalizado: false,
  descripcion: "",
  urlVerificacion: null,
  certificado,
  publicado: true,
  ...fechas,
});

const trabajo = (id: string): Experiencia => ({
  id,
  empresa: `Emp${id}`,
  puesto: "Dev",
  desde: "2022-01",
  hasta: null,
  ubicacion: "",
  modalidad: "remoto",
  descripcion: "D",
  logros: [],
  tecnologias: [],
  publicado: true,
  ...fechas,
});

const perfil = (cambios: Partial<Perfil> = {}): Perfil => ({
  id: "1",
  nombreVisible: "N",
  rol: "R",
  frase: "F",
  ubicacion: { ciudad: "C", pais: "P" },
  modalidad: "remoto",
  disponibilidad: { disponible: true, texto: "" },
  bioCorta: "B",
  bioLarga: "L",
  contacto: {
    correo: "a@b.com",
    telefono: null,
    redes: [],
    mensaje: "",
    abiertoA: [],
    tiempoRespuesta: "",
    horario: "",
    agenda: null,
  },
  habilidades: [],
  idiomas: [],
  datosCuriosos: [],
  foto: null,
  cv: null,
  vista: null,
  ...fechas,
  ...cambios,
});

const entrada = (id: string, cambios: Partial<Entrada> = {}): Entrada => ({
  id,
  titulo: `E${id}`,
  slug: `e${id}`,
  resumen: `Resumen ${id}`,
  contenido: "Párrafo uno.\n\nPárrafo dos.",
  portada: null,
  galeria: [],
  documentos: [],
  etiquetas: [],
  estado: "publicado",
  publicadoEn: "2026-10-30T12:00:00.000Z",
  ...fechas,
  ...cambios,
});

const archivo: Archivo = {
  id: "1",
  publicId: "p/a",
  url: "https://res.cloudinary.com/x/a.webp",
  tipo: "imagen",
  formato: "webp",
  bytes: 1,
  ancho: 1,
  alto: 1,
  nombreOriginal: "a",
  ...fechas,
};

interface Respuesta {
  status?: number;
  body: unknown;
}

const ok = (data: unknown): Respuesta => ({ body: { ok: true, data } });
const listado = (clave: string, items: unknown[]) =>
  ok({ [clave]: items, paginacion: { page: 1, limit: 100, total: items.length, paginas: 1 } });
const rechazo = (...details: { campo: string; mensaje: string }[]): Respuesta => ({
  status: 400,
  body: { ok: false, message: "Datos inválidos", details },
});

const pedidos: { metodo: string; url: string; body: unknown }[] = [];

function servidor(responder: (metodo: string, url: string) => Respuesta | Promise<Respuesta>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (req: Request) => {
      const texto = req.method === "GET" ? "" : await req.clone().text();
      pedidos.push({ metodo: req.method, url: req.url, body: texto ? JSON.parse(texto) : null });
      const { status = 200, body } = await responder(req.method, req.url);
      return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
    }),
  );
}

let raices: Root[] = [];

async function montar(ui: ReactNode, ruta = "/") {
  const store = makeStore();
  store.dispatch(sessionStarted("tok"));
  const caja = document.createElement("div");
  document.body.append(caja);
  const raiz = createRoot(caja);
  raices.push(raiz);
  await act(async () =>
    raiz.render(
      <Provider store={store}>
        <ConfirmarProvider>
          <MemoryRouter initialEntries={[ruta]}>{ui}</MemoryRouter>
        </ConfirmarProvider>
      </Provider>,
    ),
  );
  return { caja, store };
}

const hasta = (condicion: () => void, timeout = 3000) =>
  vi.waitFor(
    async () => {
      await act(async () => {}); // deja que React pinte lo que llegó entre un intento y otro
      condicion();
    },
    { timeout, interval: 20 },
  );

const click = (elemento: Element | null | undefined) => {
  if (!elemento) throw new Error("No está el elemento");
  return act(async () => (elemento as HTMLElement).click());
};

const porEtiqueta = (caja: HTMLElement, etiqueta: string) => caja.querySelector(`[aria-label="${etiqueta}"]`);

/** jsdom no tiene URL.createObjectURL: cada archivo elegido se ve con su URL local (blob:http://localhost/1, /2...) */
function urlsLocales() {
  let n = 0;
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: () => `blob:http://localhost/${++n}` });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: () => {} });
  return () => {
    Reflect.deleteProperty(URL, "createObjectURL");
    Reflect.deleteProperty(URL, "revokeObjectURL");
  };
}

/** El modal de confirmación abierto (useConfirmar), o null */
const modal = (caja: HTMLElement) => caja.querySelector<HTMLDialogElement>("dialog[open]");

/** Espera el modal de confirmación y lo responde: con su botón de confirmar o con «Cancelar» */
async function responderModal(caja: HTMLElement, confirmar: boolean) {
  await hasta(() => expect(modal(caja)).not.toBeNull());
  const botones = modal(caja)!.querySelectorAll("button");
  await click(confirmar ? botones[botones.length - 1] : modal(caja)!.querySelector("[data-cancelar]"));
}
const boton = (caja: HTMLElement, texto: string) =>
  [...caja.querySelectorAll("button")].find((b) => b.textContent?.includes(texto)) ?? null;

async function cambiarValor(campo: HTMLInputElement | HTMLSelectElement, valor: string, evento: string) {
  const prototipo = campo instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototipo, "value")!.set!;
  await act(async () => {
    setter.call(campo, valor);
    campo.dispatchEvent(new Event(evento, { bubbles: true }));
  });
}

async function elegirArchivo(
  selector: HTMLInputElement,
  archivos: File | File[] = new File(["x"], "foto.webp", { type: "image/webp" }),
) {
  Object.defineProperty(selector, "files", { value: [archivos].flat(), configurable: true });
  await act(async () => {
    selector.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

beforeEach(() => {
  pedidos.length = 0;
  // RTK Query arma el Request con el AbortSignal de jsdom, que el Request de Node no acepta
  const RequestReal = globalThis.Request;
  vi.stubGlobal(
    "Request",
    class extends RequestReal {
      constructor(url: RequestInfo | URL, opciones?: RequestInit) {
        const { signal: _signal, ...resto } = opciones ?? {};
        super(url, resto);
      }
    },
  );
  // jsdom no dibuja en canvas: el sol de la web pública se queda con su foto quieta
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

afterEach(async () => {
  vi.useRealTimers();
  await act(async () => raices.forEach((raiz) => raiz.unmount()));
  raices = [];
  document.body.innerHTML = "";
  Reflect.deleteProperty(navigator, "clipboard");
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("modal de confirmación", () => {
  function Pregunta({ onRespuesta }: { onRespuesta: (confirmado: boolean) => void }) {
    const confirmar = useConfirmar();
    const preguntar = async () =>
      onRespuesta(await confirmar({ tipo: "Prueba", titulo: "¿Seguro?", aviso: "Ojo", textoConfirmar: "Sí, borrar" }));
    return (
      <button type="button" onClick={preguntar}>
        Preguntar
      </button>
    );
  }

  it("responde true al confirmar y false con Cancelar, la X, el fondo o Esc; el foco arranca en «Cancelar»", async () => {
    const respuestas: boolean[] = [];
    const { caja } = await montar(<Pregunta onRespuesta={(r) => respuestas.push(r)} />);
    const formas: ((dialogo: HTMLDialogElement) => Promise<void>)[] = [
      (d) => click(boton(d, "Sí, borrar")),
      (d) => click(d.querySelector("[data-cancelar]")),
      (d) => click(porEtiqueta(d, "Cerrar")),
      (d) => click(d.querySelector(":scope > div[aria-hidden]")), // el fondo
      (d) => act(async () => void d.dispatchEvent(new Event("cancel", { cancelable: true }))), // Esc
    ];

    for (const responder of formas) {
      await click(boton(caja, "Preguntar"));
      await hasta(() => expect(modal(caja)).not.toBeNull());
      expect(modal(caja)?.textContent).toContain("¿Seguro?");
      expect(modal(caja)?.textContent).toContain("Ojo");
      expect(document.activeElement?.textContent).toBe("Cancelar");

      await responder(modal(caja)!);
      await hasta(() => expect(modal(caja)).toBeNull()); // sale despacio y se desmonta
    }

    expect(respuestas).toEqual([true, false, false, false, false]);
  });

  it("con StrictMode no se cierra solo: el aviso de close del montaje doble llega tarde y no cancela", async () => {
    // jsdom no tiene showModal ni close: se imitan como el navegador, que avisa el close en una tarea aparte
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.setAttribute("open", "");
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value(this: HTMLDialogElement) {
        if (!this.open) return;
        this.removeAttribute("open");
        setTimeout(() => this.dispatchEvent(new Event("close")));
      },
    });
    try {
      const respuestas: boolean[] = [];
      const { caja } = await montar(
        <StrictMode>
          <ConfirmarProvider>
            <Pregunta onRespuesta={(r) => respuestas.push(r)} />
          </ConfirmarProvider>
        </StrictMode>,
      );

      await click(boton(caja, "Preguntar"));
      await act(() => new Promise((listo) => setTimeout(listo, 100))); // deja llegar el aviso viejo

      expect(modal(caja)).not.toBeNull();
      expect(respuestas).toEqual([]);
      await click(boton(modal(caja)!, "Sí, borrar"));
      expect(respuestas).toEqual([true]);
    } finally {
      Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
      Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
    }
  });
});

describe("formulario de proyecto", () => {
  const props = { guardando: false, errorGeneral: null, textoGuardar: "Guardar", onGuardar: vi.fn() };
  const enEdicion = (
    <Routes>
      <Route path="/admin/proyectos/:id" element={<ProyectoFormPage />} />
    </Routes>
  );
  // La primera imagen de la galería es la portada
  const conDatos = proyecto("1", {
    repositorios: [{ nombre: "R", url: "https://x.com/r" }],
    galeria: [
      { url: "https://x.com/p.webp", alt: "P" },
      { url: "https://x.com/g.webp", alt: "G" },
    ],
  });

  it("pinta el máximo de imágenes, contando la portada, y no guarda", async () => {
    const onGuardar = vi.fn();
    const galeria = Array.from({ length: 21 }, (_, i) => ({ url: `https://x.com/${i}.webp`, alt: "a" }));
    const { caja } = await montar(
      <ProyectoForm {...props} proyecto={proyecto("1", { galeria })} onGuardar={onGuardar} />,
    );

    await click(boton(caja, "Guardar"));

    // 21 imágenes: la primera va a Portada y quedan 20 en la galería, una de más
    await hasta(() => expect(caja.textContent).toContain("Máximo 20 imágenes, contando la portada"));
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("no tiene campo de dirección: título, tipo, rol y fecha van juntos, del mismo ancho", async () => {
    const { caja } = await montar(<ProyectoForm {...props} proyecto={proyecto("1")} />);
    expect(caja.querySelector("#slug")).toBeNull();
    expect(caja.textContent).not.toContain("Dirección en la web");
    // Los cuatro en la misma grilla, en este orden
    let fila = caja.querySelector("#titulo")!.parentElement!;
    while (!fila.querySelector("#fecha")) fila = fila.parentElement!;
    const ids = [...fila.querySelectorAll("input, select")].map((campo) => campo.id);
    expect(ids).toEqual(["titulo", "tipo", "rol", "fecha"]);
  });

  it("marca los errores del backend en su campo aunque en la API se llamen distinto", async () => {
    servidor((metodo) =>
      metodo === "PATCH"
        ? rechazo(
            { campo: "repositorios.0.url", mensaje: "Repositorio rechazado" },
            { campo: "galeria.0.alt", mensaje: "Portada rechazada" },
            { campo: "galeria.1.alt", mensaje: "Imagen rechazada" },
          )
        : ok({ proyecto: conDatos }),
    );
    const { caja } = await montar(enEdicion, "/admin/proyectos/1");
    await hasta(() => expect(boton(caja, "Guardar cambios")).not.toBeNull());

    await click(boton(caja, "Guardar cambios"));

    await hasta(() => expect(caja.textContent).toContain("Repositorio rechazado"));
    expect(caja.textContent).toContain("Portada rechazada");
    expect(caja.textContent).not.toContain("Datos inválidos"); // no hace falta el error general
    // Con portada, galeria.0 de la API es la portada y galeria.1 es la primera imagen de la galería
    expect(caja.querySelector("#repo-url-0")?.getAttribute("aria-invalid")).toBe("true");
    expect(caja.querySelector("#portadaAlt")?.getAttribute("aria-invalid")).toBe("true");
    expect(caja.querySelector("#galeria-alt-0")?.getAttribute("aria-invalid")).toBe("true");
  });

  it("si un error no tiene campo, muestra el detalle completo", async () => {
    servidor((metodo) =>
      metodo === "PATCH"
        ? rechazo({ campo: "titulo", mensaje: "Título rechazado" }, { campo: "orden", mensaje: "Orden rechazado" })
        : ok({ proyecto: conDatos }),
    );
    const { caja } = await montar(enEdicion, "/admin/proyectos/1");
    await hasta(() => expect(boton(caja, "Guardar cambios")).not.toBeNull());

    await click(boton(caja, "Guardar cambios"));

    await hasta(() => expect(caja.textContent).toContain("orden: Orden rechazado"));
  });

  const tecla = (elemento: Element, key: string) =>
    act(async () => {
      elemento.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    });
  /** El nombre que muestra la barra de arriba (el h1 lleva también el badge del estado) */
  const nombreEnLaBarra = (caja: HTMLElement) => caja.querySelector("h1 > span")?.textContent;
  const vistaPrevia = (caja: HTMLElement) =>
    [...caja.querySelectorAll("aside section")].find((s) => s.textContent?.startsWith("Así se ve en la lista"));

  it("todas las secciones a la vista y, al costado, la vista previa, la publicación y lo que tiene", async () => {
    const { caja } = await montar(<ProyectoForm {...props} proyecto={proyecto("1")} />);

    expect([...caja.querySelectorAll("form > div > div > section h2")].map((h) => h.textContent)).toEqual([
      "Datos principales",
      "La historia",
      "Tecnologías",
      "Enlaces",
      "Imágenes y documentos",
    ]);
    expect([...caja.querySelectorAll("aside h2")].map((h) => h.textContent)).toEqual([
      "Así se ve en la lista",
      "Publicación",
      "Lo que tiene",
    ]);
    const tiene = [...caja.querySelectorAll("aside li")].map((li) => li.textContent);
    expect(tiene).toEqual([
      "Título y resumen",
      "Historia",
      "Faltan las tecnologías",
      "Sin repositorios",
      "Falta la portada",
    ]);
  });

  it("la vista previa es la tarjeta de la lista y cambia mientras se escribe", async () => {
    const { caja } = await montar(<ProyectoForm {...props} proyecto={conDatos} />);
    const tarjeta = vistaPrevia(caja)!;
    expect(tarjeta.querySelector("h3")?.textContent).toContain("P1");
    expect(tarjeta.querySelector('img[src="https://x.com/p.webp"]')).not.toBeNull();

    await cambiarValor(caja.querySelector<HTMLInputElement>("#titulo")!, "Otro nombre", "input");
    await act(async () => {
      const resumen = caja.querySelector<HTMLTextAreaElement>("#resumen")!;
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(resumen, "Nuevo resumen");
      resumen.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(vistaPrevia(caja)?.querySelector("h3")?.textContent).toContain("Otro nombre");
    expect(vistaPrevia(caja)?.textContent).toContain("Nuevo resumen");
    expect(nombreEnLaBarra(caja)).toBe("Otro nombre");
  });

  it("al guardar con errores enfoca el primer campo marcado", async () => {
    const { caja } = await montar(<ProyectoForm {...props} proyecto={proyecto("1", { rol: "" })} />);

    await click(boton(caja, "Guardar"));

    await hasta(() => expect(document.activeElement).toBe(caja.querySelector("#rol")));
    expect(caja.textContent).toContain("Revisá los campos marcados.");
  });

  it("si el backend rechaza un campo, lo enfoca", async () => {
    servidor((metodo) =>
      metodo === "PATCH"
        ? rechazo({ campo: "repositorios.0.url", mensaje: "Repositorio rechazado" })
        : ok({ proyecto: conDatos }),
    );
    const { caja } = await montar(enEdicion, "/admin/proyectos/1");
    await hasta(() => expect(boton(caja, "Guardar cambios")).not.toBeNull());

    await click(boton(caja, "Guardar cambios"));

    await hasta(() => expect(document.activeElement).toBe(caja.querySelector("#repo-url-0")));
  });

  it("las tecnologías se agregan con Enter, se quitan con la cruz y se guardan como lista", async () => {
    const onGuardar = vi.fn();
    const { caja } = await montar(
      <ProyectoForm {...props} proyecto={proyecto("1", { tecnologias: ["React", "Expo"] })} onGuardar={onGuardar} />,
    );
    const campo = caja.querySelector<HTMLInputElement>("#tecnologias")!;

    await cambiarValor(campo, " Node.js ", "input");
    await tecla(campo, "Enter");
    await cambiarValor(campo, "react", "input"); // repetida: no se agrega
    await tecla(campo, "Enter");
    await click(porEtiqueta(caja, "Quitar Expo"));
    expect(caja.textContent).toContain("2 tecnologías");

    await click(boton(caja, "Guardar"));

    await hasta(() => expect(onGuardar).toHaveBeenCalled());
    expect(onGuardar.mock.calls[0]?.[0].tecnologias).toBe("React\nNode.js");
  });

  it("el estado se elige con tres botones y Destacado con un interruptor", async () => {
    const onGuardar = vi.fn();
    const { caja } = await montar(<ProyectoForm {...props} proyecto={proyecto("1")} onGuardar={onGuardar} />);
    expect(caja.textContent).toContain("Se ve en la web");

    await click(caja.querySelector('input[value="privado"]'));
    expect(caja.textContent).toContain("Terminado pero oculto");
    await click(caja.querySelector('input[name="destacado"]'));
    expect(caja.querySelector('input[name="destacado"]')?.getAttribute("role")).toBe("switch");
    // La barra y la vista previa siguen al estado y a la estrella
    expect(caja.querySelector("h1")?.textContent).toContain("Privado");
    expect(vistaPrevia(caja)?.querySelector('[aria-label="Destacado"]')).not.toBeNull();

    await click(boton(caja, "Guardar"));

    await hasta(() => expect(onGuardar).toHaveBeenCalled());
    expect(onGuardar.mock.calls[0]?.[0]).toMatchObject({ estado: "privado", destacado: true });
  });

  it("la barra lleva el nombre y el estado, y «Ver en la web» solo si está publicado", async () => {
    const publicado = await montar(<ProyectoForm {...props} proyecto={proyecto("1", { titulo: "Facturación FCT" })} />);
    expect(nombreEnLaBarra(publicado.caja)).toBe("Facturación FCT");
    expect(publicado.caja.querySelector("h1")?.textContent).toContain("Publicado");
    expect(publicado.caja.querySelector('a[href="/proyectos/p1"]')?.textContent).toContain("Ver en la web");

    const borrador = await montar(<ProyectoForm {...props} proyecto={proyecto("2", { estado: "borrador" })} />);
    expect(borrador.caja.querySelector('a[href="/proyectos/p2"]')).toBeNull();

    const nuevo = await montar(<ProyectoForm {...props} />);
    expect(nombreEnLaBarra(nuevo.caja)).toBe("Nuevo proyecto");
  });

  it("«Volver» va en la barra, como «Guardar» pero en rojo, y lleva a la lista", async () => {
    const { caja } = await montar(<ProyectoForm {...props} proyecto={proyecto("1")} volverA="/admin/proyectos" />);
    const volver = porEtiqueta(caja, "Volver a proyectos")!;
    expect(volver.getAttribute("href")).toBe("/admin/proyectos");
    expect(volver.className).toContain("bg-peligro");
    // Al lado de «Ver en la web» y «Guardar», en la misma barra que el nombre
    expect(volver.parentElement?.textContent).toContain("Guardar");
    expect(volver.closest("div:has(h1)")?.querySelector("h1")?.textContent).toContain("P1");
  });

  it("la portada se ve en su recuadro, sin link, y si no está guardada se quita del formulario sin preguntar", async () => {
    servidor(() => ok({}));
    const limpiar = urlsLocales();
    try {
      const { caja } = await montar(<ProyectoForm {...props} />);
      expect(caja.querySelector("input#portadaUrl")).toBeNull(); // no hay campo para el link
      await elegirArchivo(caja.querySelector<HTMLInputElement>("#portadaUrl-archivo")!);
      expect(caja.querySelector('form > div > div > section img[src="blob:http://localhost/1"]')).not.toBeNull();

      await click(porEtiqueta(caja, "Quitar la imagen"));

      expect(caja.querySelector('img[src="blob:http://localhost/1"]')).toBeNull();
      expect(caja.textContent).toContain("Subí la portada");
      expect(vistaPrevia(caja)?.textContent).toContain("Falta la portada");
      expect(caja.textContent).toContain("Falta la portada");
      expect(modal(caja)).toBeNull();
      expect(pedidos).toHaveLength(0);
    } finally {
      limpiar();
    }
  });

  it("la galería deja elegir varias fotos a la vez: van en miniatura, sin link, y lo que no sirve se avisa", async () => {
    servidor(() => ok({}));
    const limpiar = urlsLocales();
    try {
      const { caja } = await montar(<ProyectoForm {...props} proyecto={conDatos} />);
      const selector = caja.querySelector<HTMLInputElement>("#galeria-archivos")!;
      expect(selector.multiple).toBe(true);

      await elegirArchivo(selector, [
        new File(["x"], "uno.webp", { type: "image/webp" }),
        new File(["x"], "dos.png", { type: "image/png" }),
        new File(["x"], "tres.gif", { type: "image/gif" }),
      ]);

      // La que ya tenía y las dos que sirven, cada una con su descripción; ningún campo con el link
      expect(caja.querySelectorAll('[id^="galeria-alt-"]')).toHaveLength(3);
      expect(caja.querySelector('[id^="galeria-url-"]')).toBeNull();
      expect(caja.querySelector('img[src="blob:http://localhost/1"]')).not.toBeNull();
      expect(caja.querySelector('img[src="blob:http://localhost/2"]')).not.toBeNull();
      expect(caja.textContent).toContain("Se sube al guardar");
      expect(caja.textContent).toContain("tres.gif: Formato no permitido");
      expect(pedidos).toHaveLength(0); // elegir no sube nada

      // Sin guardar, quitar una solo la saca del formulario
      await click(porEtiqueta(caja, "Quitar imagen 3"));
      expect(caja.querySelector('img[src="blob:http://localhost/2"]')).toBeNull();
      expect(modal(caja)).toBeNull();
    } finally {
      limpiar();
    }
  });

  it("quitar una portada guardada la elimina del proyecto y de Cloudinary, y la siguiente foto pasa a portada", async () => {
    let guardado = conDatos;
    servidor((metodo) => {
      if (metodo !== "DELETE") return ok({ proyecto: guardado });
      guardado = { ...guardado, galeria: guardado.galeria.slice(1) };
      return ok({ proyecto: guardado, archivo: "borrado" });
    });
    const { caja } = await montar(enEdicion, "/admin/proyectos/1");
    await hasta(() => expect(porEtiqueta(caja, "Quitar la imagen")).not.toBeNull());

    await click(porEtiqueta(caja, "Quitar la imagen"));
    await hasta(() => expect(modal(caja)).not.toBeNull());
    expect(modal(caja)?.textContent).toContain("Portada");
    expect(modal(caja)?.textContent).toContain("Sale del proyecto y la siguiente foto pasa a ser la portada");
    expect(modal(caja)?.querySelector('img[src="https://x.com/p.webp"]')).not.toBeNull();
    expect(pedidos.some((p) => p.metodo === "DELETE")).toBe(false); // todavía no confirmó
    await responderModal(caja, true);

    await hasta(() => expect(caja.textContent).toContain("Foto eliminada del proyecto y de Cloudinary."));
    expect(pedidos.find((p) => p.metodo === "DELETE")).toMatchObject({
      url: expect.stringContaining("/proyectos/1/galeria"),
      body: { url: "https://x.com/p.webp" },
    });
    // La galería queda vacía y su foto pasa al recuadro de la portada
    await hasta(() => expect(porEtiqueta(caja, "Quitar imagen 1")).toBeNull());
    expect(caja.querySelector('form > div > div > section img[src="https://x.com/g.webp"]')).not.toBeNull();
  });

  it("si Cloudinary falla, la foto de la galería sigue y se ve el error; con cambios sin guardar, la confirmación lo avisa", async () => {
    servidor((metodo) =>
      metodo === "DELETE"
        ? {
            status: 502,
            body: { ok: false, message: "Cloudinary no pudo borrar el archivo. Probá de nuevo en unos minutos" },
          }
        : ok({ proyecto: conDatos }),
    );
    const { caja } = await montar(enEdicion, "/admin/proyectos/1");
    await hasta(() => expect(porEtiqueta(caja, "Quitar imagen 1")).not.toBeNull());
    await cambiarValor(caja.querySelector<HTMLInputElement>("#titulo")!, "Otro título", "input");

    await click(porEtiqueta(caja, "Quitar imagen 1"));
    await hasta(() =>
      expect(modal(caja)?.textContent).toContain("Los cambios sin guardar del formulario se van a perder."),
    );
    await responderModal(caja, true);

    await hasta(() => expect(caja.textContent).toContain("Cloudinary no pudo borrar el archivo"));
    expect(porEtiqueta(caja, "Quitar imagen 1")).not.toBeNull();
    expect(caja.querySelector('form > div > div > section img[src="https://x.com/g.webp"]')).not.toBeNull();
  });

  it("elegir una foto no la sube: se ve con su nombre y se sube recién al guardar, junto con el proyecto", async () => {
    const link = "https://res.cloudinary.com/x/image/upload/v1/portafolio/proyectos/p1/foto.webp";
    const llamadas: { a: string; body: unknown }[] = [];
    const json = (status: number, body: unknown) =>
      new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (entrada: Request | string) => {
        if (typeof entrada === "string") {
          llamadas.push({ a: "cloudinary", body: null });
          return json(200, { public_id: "portafolio/proyectos/p1/foto", secure_url: link, format: "webp", bytes: 1 });
        }
        const firma = entrada.url.endsWith("/archivos/firma");
        llamadas.push({ a: firma ? "firma" : "registro", body: await entrada.clone().json() });
        if (!firma) return json(201, { ok: true, data: { archivo: { ...archivo, url: link } } });
        const reglas = { urlSubida: "https://api.cloudinary.com/v1_1/x/image/upload", campos: {}, formatos: ["webp"] };
        return json(200, { ok: true, data: { firma: { ...reglas, maxBytes: 5 * 1024 * 1024 } } });
      }),
    );
    // jsdom no tiene URL.createObjectURL: el archivo elegido se ve con una URL local
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: () => "blob:http://localhost/foto" });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: () => {} });
    try {
      const onGuardar = vi.fn();
      const { caja } = await montar(<ProyectoForm {...props} proyecto={proyecto("1")} onGuardar={onGuardar} />);

      await elegirArchivo(caja.querySelector<HTMLInputElement>("#portadaUrl-archivo")!);

      expect(llamadas).toHaveLength(0); // elegir no sube nada
      expect(caja.textContent).toContain("foto.webp · se sube al guardar");
      expect(caja.querySelector('form > div > div > section img[src="blob:http://localhost/foto"]')).not.toBeNull();

      await cambiarValor(caja.querySelector<HTMLInputElement>("#portadaAlt")!, "Inicio", "input");
      await click(boton(caja, "Guardar"));

      await hasta(() => expect(onGuardar).toHaveBeenCalled());
      expect(llamadas.map((l) => l.a)).toEqual(["firma", "cloudinary", "registro"]);
      expect(llamadas[0]?.body).toEqual({ tipo: "imagen", carpeta: "proyectos/p1" });
      expect(onGuardar.mock.calls[0]?.[0].portadaUrl).toBe(link);
    } finally {
      Reflect.deleteProperty(URL, "createObjectURL");
      Reflect.deleteProperty(URL, "revokeObjectURL");
    }
  });

  it("el manual va sin link: «PDF guardado» con «Abrir», y el que se elige se sube al guardar", async () => {
    servidor(() => ok({}));
    const limpiar = urlsLocales();
    try {
      const manual = "https://res.cloudinary.com/x/image/upload/v1/portafolio/proyectos/p1/manual.pdf";
      const conManual = proyecto("1", { documentos: [{ url: manual, titulo: "Manual" }] });
      const { caja } = await montar(<ProyectoForm {...props} proyecto={conManual} />);
      expect(caja.textContent).toContain("PDF guardado");
      expect(caja.querySelector(`a[href="${manual}"]`)?.textContent).toContain("Abrir");
      expect([...caja.querySelectorAll("input")].some((campo) => campo.value === manual)).toBe(false); // el link no se ve

      const nuevo = new File(["x"], "manual-nuevo.pdf", { type: "application/pdf" });
      await elegirArchivo(caja.querySelector<HTMLInputElement>("#doc-url-0-archivo")!, nuevo);

      expect(caja.textContent).toContain("manual-nuevo.pdf");
      expect(caja.textContent).toContain("se sube al guardar");
      expect(caja.textContent).not.toContain("PDF guardado");
      expect(pedidos).toHaveLength(0);
    } finally {
      limpiar();
    }
  });

  it("un PDF de más de 10 MB no se elige: avisa que va a GitHub, sin subir nada", async () => {
    servidor(() => ok({}));
    const { caja } = await montar(<ProyectoForm {...props} proyecto={proyecto("1")} />);
    await click(boton(caja, "Agregar documento"));
    const pdf = new File(["x"], "manual.pdf", { type: "application/pdf" });
    Object.defineProperty(pdf, "size", { value: 11 * 1024 * 1024 });

    await elegirArchivo(caja.querySelector<HTMLInputElement>("#doc-url-0-archivo")!, pdf);

    expect(caja.textContent).toContain("El PDF supera el máximo de 10 MB: subilo a GitHub y pegá el link");
    // Se abre el campo para pegar el link de GitHub, vacío
    expect(caja.querySelector<HTMLInputElement>("input#doc-url-0")?.value).toBe("");
    expect(pedidos).toHaveLength(0);
  });
});

describe("formulario de datos públicos", () => {
  it("pinta el máximo de redes y no guarda", async () => {
    const redes = Array.from({ length: 21 }, (_, i) => ({ tipo: "otra" as const, url: `https://x.com/${i}` }));
    servidor(() => ok({ perfil: perfil() }));
    const { caja } = await montar(<PerfilForm perfil={perfil({ contacto: { ...perfil().contacto, redes } })} />);

    await click(boton(caja, "Guardar cambios"));

    await hasta(() => expect(caja.textContent).toContain("Máximo 20 redes"));
    expect(pedidos.filter((p) => p.metodo === "PUT")).toHaveLength(0);
  });

  it("marca los errores del backend en su campo", async () => {
    servidor(() => rechazo({ campo: "ubicacion.ciudad", mensaje: "Ciudad rechazada" }));
    const { caja } = await montar(<PerfilForm perfil={perfil()} />);

    await click(boton(caja, "Guardar cambios"));

    await hasta(() => expect(caja.textContent).toContain("Ciudad rechazada"));
    expect(caja.textContent).not.toContain("Datos inválidos");
  });

  it("un CV pendiente sigue pendiente al guardar", async () => {
    servidor(() => ok({ perfil: perfil() }));
    const { caja } = await montar(<PerfilForm perfil={perfil({ cv: { url: null } })} />);

    await click(boton(caja, "Guardar cambios"));

    await hasta(() => expect(pedidos.some((p) => p.metodo === "PUT")).toBe(true));
    expect(pedidos.find((p) => p.metodo === "PUT")?.body).toMatchObject({ cv: { url: null } });
  });

  it("tiene el formato de los formularios del panel: secciones, vista previa y disponibilidad", async () => {
    servidor(() => ok({ perfil: perfil() }));
    const { caja } = await montar(<PerfilForm perfil={perfil({ nombreVisible: "Ricardo Ramirez" })} />);

    expect(caja.querySelector("h1")?.textContent).toContain("Datos públicos");
    expect(caja.querySelector("h1")?.textContent).toContain("Disponible");
    expect(caja.querySelector('a[href="/"]')?.textContent).toContain("Ver en la web");
    expect([...caja.querySelectorAll("form > div > div > section h2")].map((h) => h.textContent)).toEqual([
      "Presentación",
      "Sobre mí",
      "Foto y CV",
      "Contacto y redes",
      "Habilidades",
      "Idiomas",
      "Datos curiosos",
    ]);
    expect([...caja.querySelectorAll("aside h2")].map((h) => h.textContent)).toEqual([
      "Así te presenta la web",
      "Disponibilidad",
      "Lo que tiene",
    ]);
    // La vista previa cambia mientras se escribe
    await cambiarValor(caja.querySelector<HTMLInputElement>("#rol")!, "Tech Lead", "input");
    expect(caja.querySelector("aside")?.textContent).toContain("Tech Lead");
    // Ni la foto ni el CV muestran un campo de link
    expect(caja.querySelector('input[type="url"]#fotoUrl, input#cvUrl')).toBeNull();

    await click(caja.querySelector('input[name="disponible"]'));
    expect(caja.querySelector("h1")?.textContent).toContain("No disponible");
  });

  it("las habilidades van en fichas por área y se guardan con su categoría", async () => {
    servidor(() => ok({ perfil: perfil() }));
    const habilidades = [
      { nombre: "React", categoria: "front" as const },
      { nombre: "Node.js", categoria: "back" as const },
    ];
    const { caja } = await montar(<PerfilForm perfil={perfil({ habilidades })} />);
    const diseno = caja.querySelector<HTMLInputElement>("#hab-diseno")!;

    await cambiarValor(diseno, "Figma", "input");
    await act(async () => {
      diseno.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    await click(porEtiqueta(caja, "Quitar Node.js"));
    await click(boton(caja, "Guardar cambios"));

    await hasta(() => expect(pedidos.some((p) => p.metodo === "PUT")).toBe(true));
    expect((pedidos.find((p) => p.metodo === "PUT")?.body as { habilidades: unknown }).habilidades).toEqual([
      { nombre: "React", categoria: "front" },
      { nombre: "Figma", categoria: "diseno" },
    ]);
  });

  it("la foto y el CV se suben al guardar, a la carpeta perfil", async () => {
    servidor((metodo) =>
      metodo === "POST"
        ? { status: 503, body: { ok: false, message: "Cloudinary no está configurado en el servidor" } }
        : ok({ perfil: perfil() }),
    );
    const limpiar = urlsLocales();
    try {
      const { caja } = await montar(<PerfilForm perfil={perfil()} />);
      await elegirArchivo(caja.querySelector<HTMLInputElement>("#fotoUrl-archivo")!);
      await elegirArchivo(
        caja.querySelector<HTMLInputElement>("#cvUrl-archivo")!,
        new File(["x"], "cv.pdf", { type: "application/pdf" }),
      );
      expect(pedidos).toHaveLength(0);
      expect(caja.textContent).toContain("cv.pdf");
      await cambiarValor(caja.querySelector<HTMLInputElement>("#fotoAlt")!, "Mi foto", "input");

      await click(boton(caja, "Guardar cambios"));

      await hasta(() => expect(caja.textContent).toContain("No se pudo subir un archivo"));
      expect(pedidos[0]?.body).toEqual({ tipo: "imagen", carpeta: "perfil" });
      expect(pedidos.some((p) => p.metodo === "PUT")).toBe(false);
    } finally {
      limpiar();
    }
  });
});

describe("campos del panel con la etiqueta adentro", () => {
  it("dentro de un Field, el campo dibuja su etiqueta adentro y el Field no la repite", async () => {
    const { caja } = await montar(
      <>
        <Field label="Título" htmlFor="t" ayuda="hasta 80 caracteres">
          <Input id="t" />
        </Field>
        <Field label="Descripción" htmlFor="d">
          <Textarea id="d" />
        </Field>
        <Field label="Tipo" htmlFor="s">
          <Select id="s">
            <option>Uno</option>
          </Select>
        </Field>
      </>,
    );

    for (const id of ["t", "d", "s"]) {
      const etiquetas = caja.querySelectorAll(`label[for="${id}"]`);
      expect(etiquetas).toHaveLength(1);
      // Va en la misma caja que el control, después de él (así sube cuando se escribe)
      expect(etiquetas[0]?.previousElementSibling).toBe(caja.querySelector(`#${id}`));
    }
    // Con la etiqueta adentro hace falta un ejemplo, aunque sea un espacio
    expect(caja.querySelector<HTMLInputElement>("#t")?.placeholder).toBe(" ");
    // La pista pasa debajo del campo
    expect(caja.querySelector("#t")?.closest(".space-y-1\\.5")?.lastElementChild?.textContent).toBe(
      "hasta 80 caracteres",
    );
  });

  it("si el control no lleva etiqueta adentro, el Field la deja arriba", async () => {
    const { caja } = await montar(
      <Field label="Otro" htmlFor="o">
        <div id="o">algo propio</div>
      </Field>,
    );
    expect(caja.querySelector('label[for="o"]')?.textContent).toBe("Otro");
  });

  it("sin Field no inventa una etiqueta, y el ícono sale del tipo", async () => {
    const { caja } = await montar(
      <>
        <Select aria-label="Filtrar por estado">
          <option>Todos</option>
        </Select>
        <Input id="u" type="url" aria-label="Link" />
        <Input id="n" type="url" icono={null} aria-label="Sin ícono" />
      </>,
    );
    expect(caja.querySelector("label")).toBeNull();
    expect(caja.querySelector("#u")?.parentElement?.querySelector("svg")).not.toBeNull();
    expect(caja.querySelector("#n")?.parentElement?.querySelector("svg")).toBeNull();
  });
});

describe("lista de proyectos", () => {
  it("mientras carga la lista completa no muestra la filtrada con las flechas", async () => {
    const todos = [proyecto("1"), proyecto("2", { estado: "borrador" }), proyecto("3", { estado: "privado" })];
    let soltar = () => {};
    let frenar = false;
    servidor(async (_metodo, url) => {
      if (url.includes("estado=publicado")) return listado("proyectos", todos.slice(0, 1));
      if (frenar) await new Promise<void>((resolver) => (soltar = resolver));
      return listado("proyectos", todos);
    });

    const { caja, store } = await montar(<ProyectosPage />);
    await hasta(() => expect(porEtiqueta(caja, "Subir P2")).not.toBeNull());

    const filtro = caja.querySelector("select")!;
    await cambiarValor(filtro, "publicado", "change");
    await hasta(() => expect(porEtiqueta(caja, "Editar P2")).toBeNull());

    // Nadie usa la lista completa: al invalidarla sale del caché y hay que volver a pedirla
    await act(async () => {
      store.dispatch(api.util.invalidateTags(["Proyecto"]));
    });
    frenar = true;
    await cambiarValor(filtro, "", "change");
    await act(async () => {
      await new Promise((resolver) => setTimeout(resolver, 30));
    });

    expect(porEtiqueta(caja, "Editar P1")).toBeNull();
    expect(porEtiqueta(caja, "Bajar P1")).toBeNull();

    await act(async () => soltar());
    await hasta(() => expect(porEtiqueta(caja, "Bajar P1")).not.toBeNull());
  });

  it("una fila por proyecto, en orden: su portada en miniatura, o sus iniciales, y lo que le falta", async () => {
    const conPortada = proyecto("1", { galeria: [{ url: "https://cdn.test/p1.webp", alt: "Pantalla de P1" }] });
    const sinSubir = proyecto("2", { galeria: [{ url: null, alt: "Falta subirla" }] });
    servidor(() => listado("proyectos", [conPortada, sinSubir, proyecto("3")]));

    const { caja } = await montar(<ProyectosPage />);
    await hasta(() => expect(caja.querySelectorAll("li")).toHaveLength(3));

    const [primera, segunda, tercera] = [...caja.querySelectorAll("li")];
    const imagen = primera!.querySelector("img");
    expect(imagen?.getAttribute("src")).toBe("https://cdn.test/p1.webp");
    expect(imagen?.getAttribute("alt")).toBe("Pantalla de P1");
    expect(primera!.textContent).toContain("Completo");
    // Sin imagen, la fila lleva las iniciales en su lugar y dice qué falta
    expect(segunda!.querySelector("img")).toBeNull();
    expect(segunda!.textContent).toContain("Falta subir la portada");
    expect(tercera!.querySelector("img")).toBeNull();
    expect(tercera!.textContent).toContain("P3");
    expect(tercera!.textContent).toContain("Falta la portada");
    expect(tercera!.textContent).toContain("Proyecto personal");
    expect(tercera!.textContent).toContain("sep. 2026");
    expect(porEtiqueta(caja, "Editar P3")).not.toBeNull();
    // El número de cada uno, en orden
    expect([primera, segunda, tercera].map((fila) => fila!.querySelector(".tabular-nums > span")?.textContent)).toEqual(
      ["1", "2", "3"],
    );
  });

  it("si el link de la portada no carga, la miniatura muestra las iniciales", async () => {
    servidor(() =>
      listado("proyectos", [proyecto("1", { galeria: [{ url: "https://cdn.test/rota.webp", alt: "P1" }] })]),
    );

    const { caja } = await montar(<ProyectosPage />);
    await hasta(() => expect(caja.querySelector("li img")).not.toBeNull());

    await act(async () => {
      caja.querySelector("li img")!.dispatchEvent(new Event("error"));
    });

    expect(caja.querySelector("li img")).toBeNull();
    // «P1» no tiene sigla ni palabras largas: va su primera letra
    expect(caja.querySelector("li div[aria-hidden]")?.textContent).toBe("P");
    expect(porEtiqueta(caja, "Editar P1")).not.toBeNull();
  });
});

describe("experiencia y estudios: la lista y el formulario «Con vista previa»", () => {
  /** Lee los estudios; la firma de Cloudinary falla a propósito: alcanza con ver qué pidió */
  function conEstudios(lista: Estudio[]) {
    servidor((metodo) =>
      metodo === "POST"
        ? { status: 503, body: { ok: false, message: "Cloudinary no está configurado en el servidor" } }
        : metodo === "PATCH"
          ? ok({ estudio: lista[0] })
          : listado("estudios", lista),
    );
  }
  const enEstudio = (
    <Routes>
      <Route path="/admin/estudios/:id" element={<EstudioFormPage />} />
      <Route path="/admin/estudios" element={<p>La lista</p>} />
    </Routes>
  );

  it("estudios: la lista tiene el formato de la de proyectos, y agregar y editar llevan a su formulario", async () => {
    conEstudios([estudio("1", { url: null })]);
    const { caja } = await montar(<EstudiosPage />);
    await hasta(() => expect(porEtiqueta(caja, "Editar E1")).not.toBeNull());

    const fila = caja.querySelector("ul > li")!;
    expect(fila.querySelector("h2")?.textContent).toContain("E1");
    expect(fila.textContent).toContain("Publicado");
    expect(fila.textContent).toContain("I · Curso");
    expect(fila.textContent).toContain("ene. 2022 – en curso");
    expect(fila.textContent).toContain("En curso");
    expect(fila.textContent).toContain("Falta la descripción y subir el certificado");
    expect(fila.querySelector('[aria-label^="Subir"]')).toBeNull(); // sin orden a mano
    expect(porEtiqueta(caja, "Editar E1")?.getAttribute("href")).toBe("/admin/estudios/1");
    expect(caja.querySelector('a[href="/admin/estudios/nuevo"]')?.textContent).toContain("Nuevo estudio");
  });

  it("estudios: el formulario guarda y vuelve a la lista", async () => {
    conEstudios([estudio("1")]);
    const { caja } = await montar(enEstudio, "/admin/estudios/1");
    await hasta(() => expect(caja.querySelector("h1")?.textContent).toContain("E1"));

    const volver = porEtiqueta(caja, "Volver a estudios")!;
    expect(volver.getAttribute("href")).toBe("/admin/estudios");
    expect(volver.className).toContain("bg-peligro");
    expect([...caja.querySelectorAll("form > div > div > section h2")].map((h) => h.textContent)).toEqual([
      "Datos principales",
      "Lo que aprendiste",
      "Certificado",
    ]);
    expect([...caja.querySelectorAll("aside h2")].map((h) => h.textContent)).toEqual([
      "Así se ve en la lista",
      "Publicación",
      "Lo que tiene",
    ]);
    // «Finalizado» dice cómo se va a ver: sin fecha de fin está en curso
    expect(caja.textContent).toContain("Se muestra como «En curso»");
    // Apagar «Mostrar en la web» lo marca Oculto en la barra y en la vista previa
    await click(caja.querySelector('input[name="publicado"]'));
    expect(caja.querySelector("h1")?.textContent).toContain("Oculto");

    await click(boton(caja, "Guardar cambios"));

    await hasta(() => expect(caja.textContent).toContain("La lista"));
    expect(pedidos.find((p) => p.metodo === "PATCH")?.body).toMatchObject({ titulo: "E1", publicado: false });
  });

  it("estudios: el certificado elegido se sube al guardar, como documento a la carpeta estudios", async () => {
    conEstudios([estudio("1")]);
    const limpiar = urlsLocales();
    try {
      const { caja } = await montar(enEstudio, "/admin/estudios/1");
      await hasta(() => expect(boton(caja, "Elegir PDF")).not.toBeNull());
      expect(caja.querySelector("#urlVerificacion")).not.toBeNull();

      const pdf = new File(["x"], "certificado.pdf", { type: "application/pdf" });
      await elegirArchivo(caja.querySelector<HTMLInputElement>("#certificadoUrl-archivo")!, pdf);
      expect(pedidos.some((p) => p.metodo === "POST")).toBe(false);
      expect(caja.textContent).toContain("certificado.pdf");

      await click(boton(caja, "Guardar cambios"));

      await hasta(() => expect(caja.textContent).toContain("No se pudo subir el certificado"));
      expect(pedidos.find((p) => p.metodo === "POST")?.body).toEqual({ tipo: "documento", carpeta: "estudios" });
      expect(pedidos.some((p) => p.metodo === "PATCH")).toBe(false);
    } finally {
      limpiar();
    }
  });

  it("estudios: «Quitar» saca el certificado guardado", async () => {
    conEstudios([estudio("1", { url: "https://res.cloudinary.com/x/cert.pdf" })]);
    const { caja } = await montar(enEstudio, "/admin/estudios/1");
    await hasta(() => expect(caja.textContent).toContain("PDF guardado"));

    await click(boton(caja, "Quitar"));
    expect(caja.textContent).toContain("Todavía no tiene el PDF");
    await click(boton(caja, "Guardar cambios"));

    await hasta(() => expect(pedidos.some((p) => p.metodo === "PATCH")).toBe(true));
    expect(pedidos.find((p) => p.metodo === "PATCH")?.body).toMatchObject({ certificado: null });
  });

  it("estudios: un estudio que no existe avisa y deja volver", async () => {
    conEstudios([estudio("1")]);
    const { caja } = await montar(enEstudio, "/admin/estudios/9");
    await hasta(() => expect(caja.textContent).toContain("Ese estudio no existe"));
    expect(caja.querySelector("form")).toBeNull();
    expect(caja.querySelector('a[href="/admin/estudios"]')?.textContent).toContain("Volver a estudios");
  });

  it("experiencia: la lista tiene el formato de la de proyectos, y agregar y editar llevan a su formulario", async () => {
    servidor(() => listado("experiencia", [trabajo("1")]));
    const { caja } = await montar(<ExperienciaPage />);
    await hasta(() => expect(porEtiqueta(caja, "Editar Dev en Emp1")).not.toBeNull());

    const fila = caja.querySelector("ul > li")!;
    expect(fila.querySelector("h2")?.textContent).toContain("Dev en Emp1");
    expect(fila.textContent).toContain("Publicado");
    expect(fila.textContent).toContain("ene. 2022 – actualidad");
    expect(fila.textContent).toContain("Remoto");
    expect(fila.textContent).toContain("Faltan los logros y las tecnologías");
    expect(fila.querySelector('[aria-label^="Subir"]')).toBeNull(); // sin orden a mano
    expect(porEtiqueta(caja, "Editar Dev en Emp1")?.getAttribute("href")).toBe("/admin/experiencia/1");
    expect(caja.querySelector('a[href="/admin/experiencia/nuevo"]')?.textContent).toContain("Nuevo trabajo");
  });

  it("experiencia: el formulario «Con vista previa» guarda y vuelve a la lista", async () => {
    servidor((metodo) =>
      metodo === "PATCH" ? ok({ experiencia: trabajo("1") }) : listado("experiencia", [trabajo("1")]),
    );
    const { caja } = await montar(
      <Routes>
        <Route path="/admin/experiencia/:id" element={<ExperienciaFormPage />} />
        <Route path="/admin/experiencia" element={<p>La lista</p>} />
      </Routes>,
      "/admin/experiencia/1",
    );
    await hasta(() => expect(caja.querySelector("h1")?.textContent).toContain("Dev en Emp1"));

    const volver = porEtiqueta(caja, "Volver a experiencia")!;
    expect(volver.getAttribute("href")).toBe("/admin/experiencia");
    expect(volver.className).toContain("bg-peligro");
    expect([...caja.querySelectorAll("form > div > div > section h2")].map((h) => h.textContent)).toEqual([
      "Datos principales",
      "Lo que hiciste",
      "Logros",
      "Tecnologías",
    ]);
    expect([...caja.querySelectorAll("aside h2")].map((h) => h.textContent)).toEqual([
      "Así se ve en la lista",
      "Publicación",
      "Lo que tiene",
    ]);
    // Apagar «Mostrar en la web» lo marca Oculto en la barra y en la vista previa
    await click(caja.querySelector('input[name="publicado"]'));
    expect(caja.querySelector("h1")?.textContent).toContain("Oculto");

    await click(boton(caja, "Guardar cambios"));

    await hasta(() => expect(caja.textContent).toContain("La lista"));
    expect(pedidos.find((p) => p.metodo === "PATCH")?.body).toMatchObject({ empresa: "Emp1", publicado: false });
  });

  it("experiencia: un trabajo que no existe avisa y deja volver", async () => {
    servidor(() => listado("experiencia", [trabajo("1")]));
    const { caja } = await montar(
      <Routes>
        <Route path="/admin/experiencia/:id" element={<ExperienciaFormPage />} />
      </Routes>,
      "/admin/experiencia/9",
    );
    await hasta(() => expect(caja.textContent).toContain("Ese trabajo no existe"));
    expect(caja.querySelector("form")).toBeNull();
    expect(caja.querySelector('a[href="/admin/experiencia"]')?.textContent).toContain("Volver a experiencia");
  });
});

describe("certificado pendiente", () => {
  it("guardar sin cambios manda { url: null }", async () => {
    const pendiente = estudio("1", { url: null });
    servidor((metodo) => (metodo === "PATCH" ? ok({ estudio: pendiente }) : listado("estudios", [pendiente])));
    const { caja } = await montar(
      <Routes>
        <Route path="/admin/estudios/:id" element={<EstudioFormPage />} />
      </Routes>,
      "/admin/estudios/1",
    );
    await hasta(() => expect(boton(caja, "Guardar cambios")).not.toBeNull());

    await click(boton(caja, "Guardar cambios"));

    await hasta(() => expect(pedidos.some((p) => p.metodo === "PATCH")).toBe(true));
    expect(pedidos.find((p) => p.metodo === "PATCH")?.body).toMatchObject({ certificado: { url: null } });
  });
});

describe("biblioteca de archivos", () => {
  const lectura = (url: string) => {
    if (url.includes("/proyectos")) return listado("proyectos", [proyecto("1")]);
    if (url.includes("/blog")) return listado("entradas", [entrada("1")]);
    return listado("archivos", [archivo]);
  };
  const conArchivo = () => servidor((_metodo, url) => lectura(url));
  // La firma falla a propósito: alcanza con ver qué carpeta pidió
  const sinFirma = () =>
    servidor((metodo, url) =>
      metodo === "POST"
        ? { status: 503, body: { ok: false, message: "Cloudinary no está configurado en el servidor" } }
        : lectura(url),
    );

  // jsdom no tiene URL.createObjectURL: la miniatura de lo elegido usa una URL local
  beforeEach(() => {
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: () => "blob:http://localhost/elegido" });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: () => {} });
  });
  afterEach(() => {
    Reflect.deleteProperty(URL, "createObjectURL");
    Reflect.deleteProperty(URL, "revokeObjectURL");
  });

  /** Elige el archivo, la carpeta de destino (si se pasa: está en «Por subir») y toca el botón de subir */
  async function elegirYSubir(caja: HTMLElement, archivoNuevo?: File, carpeta?: string) {
    await elegirArchivo(caja.querySelector<HTMLInputElement>('input[type="file"]')!, archivoNuevo);
    if (carpeta) {
      await hasta(() => expect(caja.querySelector(`option[value="${carpeta}"]`)).not.toBeNull());
      await cambiarValor(
        caja.querySelector<HTMLSelectElement>('[aria-label="Carpeta de destino"]')!,
        carpeta,
        "change",
      );
    }
    await click(boton(caja, "Subir 1 archivo"));
  }

  it("cada archivo es una fila, con el formato de las otras listas", async () => {
    conArchivo();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(porEtiqueta(caja, "Borrar a")).not.toBeNull());

    const fila = caja.querySelector("ul > li")!;
    expect(fila.querySelector("h2")?.textContent).toContain("a");
    expect(fila.textContent).toContain("Imagen");
    expect(fila.textContent).toContain("Subido el");
    expect(fila.textContent).toContain("WEBP");
    expect(fila.textContent).toContain("1 × 1 px");
    expect(fila.textContent).toContain("Carpeta principal"); // publicId "p/a": sin subcarpeta
    expect(fila.querySelector("img")?.getAttribute("src")).toBe(archivo.url);
    const abrir = porEtiqueta(caja, "Abrir a")!;
    expect(abrir.getAttribute("href")).toBe(archivo.url);
    expect(abrir.getAttribute("rel")).toBe("noopener noreferrer");
    // Sin nada elegido no hay «Por subir» ni dónde elegir la carpeta
    expect(caja.textContent).not.toContain("Por subir");
    expect(caja.querySelector('[aria-label="Carpeta de destino"]')).toBeNull();
  });

  it("avisa si no pudo copiar el link", async () => {
    conArchivo();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(porEtiqueta(caja, "Copiar el link de a")).not.toBeNull());

    await click(porEtiqueta(caja, "Copiar el link de a"));

    await hasta(() => expect(caja.textContent).toContain("No se pudo copiar el link."));
  });

  it("muestra Copiado y vuelve solo", async () => {
    conArchivo();
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(porEtiqueta(caja, "Copiar el link de a")).not.toBeNull());

    vi.useFakeTimers({ toFake: ["setTimeout"] });
    await click(porEtiqueta(caja, "Copiar el link de a"));
    expect(writeText).toHaveBeenCalledWith(archivo.url);
    expect(porEtiqueta(caja, "Link de a copiado")?.getAttribute("title")).toBe("Copiado");

    await act(async () => vi.advanceTimersByTime(2000));
    expect(porEtiqueta(caja, "Copiar el link de a")).not.toBeNull();
  });

  it("elegir no sube nada: queda en «Por subir» hasta tocar el botón, y «Descartar» lo saca", async () => {
    conArchivo();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(boton(caja, "Elegir archivos")).not.toBeNull());
    pedidos.length = 0;

    await elegirArchivo(caja.querySelector<HTMLInputElement>('input[type="file"]')!);

    expect(pedidos.some((p) => p.metodo === "POST")).toBe(false);
    expect(caja.textContent).toContain("Por subir");
    expect(caja.textContent).toContain("foto.webp");
    expect(boton(caja, "Subir 1 archivo")).not.toBeNull();

    await click(boton(caja, "Descartar"));

    expect(caja.textContent).not.toContain("Por subir");
    expect(pedidos.some((p) => p.metodo === "POST")).toBe(false);
  });

  it("lo que no sirve no se agrega y avisa por qué", async () => {
    conArchivo();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(boton(caja, "Elegir archivos")).not.toBeNull());
    const pdf = new File(["x"], "manual.pdf", { type: "application/pdf" });
    Object.defineProperty(pdf, "size", { value: 11 * 1024 * 1024 });

    await elegirArchivo(caja.querySelector<HTMLInputElement>('input[type="file"]')!, pdf);

    expect(caja.textContent).toContain("manual.pdf: El PDF supera el máximo de 10 MB: subilo a GitHub y pegá el link");
    expect(caja.textContent).not.toContain("Por subir");
  });

  it("un PDF se sube como documento a la carpeta elegida", async () => {
    sinFirma();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(boton(caja, "Elegir archivos")).not.toBeNull());

    await elegirYSubir(caja, new File(["x"], "manual.pdf", { type: "application/pdf" }), "proyectos/p1");

    await hasta(() => expect(pedidos.some((p) => p.metodo === "POST")).toBe(true));
    expect(pedidos.find((p) => p.metodo === "POST")?.body).toEqual({ tipo: "documento", carpeta: "proyectos/p1" });
  });

  it("si elegís una entrada del blog, sube a su carpeta", async () => {
    sinFirma();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(boton(caja, "Elegir archivos")).not.toBeNull());

    await elegirYSubir(caja, undefined, "blogs/e1");

    await hasta(() => expect(pedidos.some((p) => p.metodo === "POST")).toBe(true));
    expect(pedidos.find((p) => p.metodo === "POST")?.body).toEqual({ tipo: "imagen", carpeta: "blogs/e1" });
  });

  it("el aviso de borrar habla de todo el portafolio, y con «Cancelar» no se borra", async () => {
    conArchivo();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(porEtiqueta(caja, "Borrar a")).not.toBeNull());

    await click(porEtiqueta(caja, "Borrar a"));
    await hasta(() => expect(modal(caja)?.textContent).toContain("Si tu portafolio lo usa"));
    expect(modal(caja)?.textContent).toContain("Se borra de Cloudinary y de la biblioteca");
    await responderModal(caja, false);

    await hasta(() => expect(modal(caja)).toBeNull());
    expect(pedidos.some((p) => p.metodo === "DELETE")).toBe(false);
  });

  it("si no elegís un proyecto, sube a la carpeta general", async () => {
    sinFirma();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(boton(caja, "Elegir archivos")).not.toBeNull());

    await elegirYSubir(caja);

    await hasta(() => expect(pedidos.some((p) => p.metodo === "POST")).toBe(true));
    expect(pedidos.find((p) => p.metodo === "POST")?.body).toEqual({ tipo: "imagen", carpeta: "biblioteca" });
  });

  it("si elegís un proyecto, sube a su carpeta", async () => {
    sinFirma();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(boton(caja, "Elegir archivos")).not.toBeNull());

    await elegirYSubir(caja, undefined, "proyectos/p1");

    await hasta(() => expect(pedidos.some((p) => p.metodo === "POST")).toBe(true));
    expect(pedidos.find((p) => p.metodo === "POST")?.body).toEqual({ tipo: "imagen", carpeta: "proyectos/p1" });
  });
});

describe("blog en el panel", () => {
  const props = { guardando: false, errorGeneral: null, textoGuardar: "Guardar", onGuardar: vi.fn() };
  const enEdicion = (
    <Routes>
      <Route path="/admin/blog/:id" element={<EntradaFormPage />} />
    </Routes>
  );

  it("lista las entradas con su estado y lo que les falta", async () => {
    servidor(() => listado("entradas", [entrada("1", { estado: "borrador", publicadoEn: null })]));
    const { caja } = await montar(<EntradasPage />);

    await hasta(() => expect(porEtiqueta(caja, "Editar E1")).not.toBeNull());
    expect(caja.textContent).toContain("Borrador");
    expect(caja.textContent).toContain("Falta la portada");
    expect(caja.textContent).toContain("Sin publicar");
    expect(porEtiqueta(caja, "Ver E1 en la web")).toBeNull(); // un borrador todavía no está en la web
    // El formato de la lista de proyectos, sin orden a mano: una fila por entrada, sin flechas
    expect(caja.querySelectorAll("ul > li")).toHaveLength(1);
    expect(caja.querySelector('[aria-label^="Subir"]')).toBeNull();
  });

  it("borrar saca la entrada de la lista", async () => {
    let lista = [entrada("1")];
    servidor((metodo) => {
      if (metodo !== "DELETE") return listado("entradas", lista);
      lista = [];
      return ok({ id: "1" });
    });
    const { caja } = await montar(<EntradasPage />);
    await hasta(() => expect(porEtiqueta(caja, "Borrar E1")).not.toBeNull());

    await click(porEtiqueta(caja, "Borrar E1"));
    await responderModal(caja, true);

    await hasta(() => expect(caja.textContent).toContain("No hay entradas para mostrar."));
  });

  it("tiene el formato del formulario de proyectos: barra con «Volver», secciones y vista previa, sin dirección", async () => {
    const { caja } = await montar(<EntradaForm {...props} entrada={entrada("1")} volverA="/admin/blog" />);

    expect(caja.querySelector("h1")?.textContent).toContain("E1");
    expect(caja.querySelector("h1")?.textContent).toContain("Publicada");
    const volver = porEtiqueta(caja, "Volver al blog")!;
    expect(volver.getAttribute("href")).toBe("/admin/blog");
    expect(volver.className).toContain("bg-peligro");
    expect(caja.querySelector('a[href="/blog/e1"]')?.textContent).toContain("Ver en la web");
    expect(caja.querySelector("#slug")).toBeNull();
    expect([...caja.querySelectorAll("form > div > div > section h2")].map((h) => h.textContent)).toEqual([
      "Datos principales",
      "El contenido",
      "Etiquetas",
      "Imágenes y archivos",
    ]);
    expect([...caja.querySelectorAll("aside h2")].map((h) => h.textContent)).toEqual([
      "Así se ve en la lista",
      "Publicación",
      "Lo que tiene",
    ]);
    // Las etiquetas son fichas, la galería elige varias fotos y el estado va en botones
    expect(caja.querySelector("#galeria-archivos")?.hasAttribute("multiple")).toBe(true);
    expect(caja.querySelectorAll('input[type="radio"][name="estado"]')).toHaveLength(2);
  });

  it("elegir la portada no la sube: se sube al guardar, a blogs/<título>", async () => {
    servidor(() => ({ status: 503, body: { ok: false, message: "Cloudinary no está configurado en el servidor" } }));
    const limpiar = urlsLocales();
    try {
      const { caja } = await montar(<EntradaForm {...props} />);
      await cambiarValor(caja.querySelector<HTMLInputElement>("#titulo")!, "Lancé mi app", "input");
      await elegirArchivo(caja.querySelector<HTMLInputElement>("#portadaUrl-archivo")!);
      expect(pedidos).toHaveLength(0); // elegir no sube nada
      expect(caja.textContent).toContain("foto.webp · se sube al guardar");

      await cambiarValor(caja.querySelector<HTMLInputElement>("#portadaAlt")!, "Portada", "input");
      await act(async () => {
        for (const [id, valor] of [["resumen", "R"], ["contenido", "C"]]) {
          const campo = caja.querySelector<HTMLTextAreaElement>(`#${id}`)!;
          Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(campo, valor);
          campo.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
      await click(boton(caja, "Guardar"));

      await hasta(() => expect(pedidos).toHaveLength(1));
      expect(pedidos[0]?.body).toEqual({ tipo: "imagen", carpeta: "blogs/lance-mi-app" });
      await hasta(() => expect(caja.textContent).toContain("No se pudo subir un archivo"));
      expect(props.onGuardar).not.toHaveBeenCalled();
    } finally {
      limpiar();
    }
  });

  it("los archivos adjuntos se suben al guardar, como documento y a la misma carpeta", async () => {
    servidor(() => ({ status: 503, body: { ok: false, message: "Cloudinary no está configurado en el servidor" } }));
    const limpiar = urlsLocales();
    try {
      const { caja } = await montar(
        <EntradaForm {...props} entrada={entrada("1", { documentos: [{ url: null, titulo: "Manual" }] })} />,
      );
      const pdf = new File(["x"], "manual.pdf", { type: "application/pdf" });
      await elegirArchivo(caja.querySelector<HTMLInputElement>("#doc-url-0-archivo")!, pdf);
      expect(pedidos).toHaveLength(0);
      expect(caja.textContent).toContain("manual.pdf");

      await click(boton(caja, "Guardar"));

      await hasta(() => expect(pedidos).toHaveLength(1));
      expect(pedidos[0]?.body).toEqual({ tipo: "documento", carpeta: "blogs/e1" });
    } finally {
      limpiar();
    }
  });

  it("guardar sin cambios conserva las fotos y archivos pendientes", async () => {
    const pendiente = entrada("1", {
      portada: { url: null, alt: "Portada" },
      galeria: [{ url: null, alt: "Foto" }],
      documentos: [{ url: null, titulo: "Manual" }],
    });
    servidor((metodo) => (metodo === "PATCH" ? ok({ entrada: pendiente }) : ok({ entrada: pendiente })));
    const { caja } = await montar(enEdicion, "/admin/blog/1");
    await hasta(() => expect(boton(caja, "Guardar cambios")).not.toBeNull());

    await click(boton(caja, "Guardar cambios"));

    await hasta(() => expect(pedidos.some((p) => p.metodo === "PATCH")).toBe(true));
    expect(pedidos.find((p) => p.metodo === "PATCH")?.body).toMatchObject({
      portada: { url: null, alt: "Portada" },
      galeria: [{ url: null, alt: "Foto" }],
      documentos: [{ url: null, titulo: "Manual" }],
    });
  });

  it("marca los errores del backend en su campo", async () => {
    const conPortada = entrada("1", { portada: { url: "https://x.com/p.webp", alt: "P" } });
    servidor((metodo) =>
      metodo === "PATCH"
        ? rechazo(
            { campo: "portada.alt", mensaje: "Portada rechazada" },
            { campo: "etiquetas.0", mensaje: "Etiqueta rechazada" },
          )
        : ok({ entrada: conPortada }),
    );
    const { caja } = await montar(enEdicion, "/admin/blog/1");
    await hasta(() => expect(boton(caja, "Guardar cambios")).not.toBeNull());

    await click(boton(caja, "Guardar cambios"));

    await hasta(() => expect(caja.textContent).toContain("Portada rechazada"));
    expect(caja.textContent).toContain("Etiqueta rechazada");
    expect(caja.textContent).not.toContain("Datos inválidos");
  });
});

/** Los datos que pide la web pública. `vista` es la que eligió el administrador */
const servidorWebPublica = (vista: string | null = null) =>
  servidor((_metodo, url) => {
    if (url.includes("/perfil")) return ok({ perfil: perfil({ nombreVisible: "Nombre del perfil", vista }) });
    if (url.includes("/proyectos")) return listado("proyectos", []);
    if (url.includes("/experiencia")) return listado("experiencia", []);
    return listado("estudios", []);
  });

describe("mi nombre", () => {
  it("aparece en el encabezado de la web pública, que no tiene pie", async () => {
    servidorWebPublica();
    const { caja } = await montar(<PublicLayout />);
    await hasta(() => expect(caja.querySelector("header")?.textContent).toContain("Ricardo Ramirez"));
    expect(caja.querySelector("footer")).toBeNull();
  });

  it("aparece en las muestras de Apariencia, sin textos de relleno", async () => {
    servidor(() => ok({ perfil: perfil() }));
    const { caja } = await montar(<ThemePage />);
    expect(caja.querySelector("h2")?.textContent).toBe("Ricardo Ramirez");
    expect(caja.querySelector('input[name="paleta"]')?.closest("label")?.textContent).toContain("Ricardo Ramirez");
    expect(caja.textContent).not.toContain("Tu nombre");
  });
});

describe("web pública", () => {
  it("muestra la vista que eligió el administrador en el perfil", async () => {
    servidorWebPublica("basica");
    const { caja } = await montar(<HomePage />);
    await hasta(() => expect(caja.textContent).toContain("Nombre del perfil"));
  });

  it("sin vista elegida (null) o con una que ya no existe, la de por defecto: mi.universo", async () => {
    for (const vista of [null, "no-existe"]) {
      servidorWebPublica(vista);
      const { caja } = await montar(<HomePage />);
      await hasta(() => expect(caja.querySelector("h1")?.textContent, String(vista)).toBe("Ricardo Ramirez"));
      expect(caja.textContent).not.toContain("Nombre del perfil");
    }
  });
});

describe("inicio del panel: la vidriera de portafolios", () => {
  const usuario = { id: "1", nombre: "Ricardo", apellido: "Ramirez" };
  const tarjetas = (caja: HTMLElement) => [...caja.querySelectorAll("ul > li")];
  const aplicado = (caja: HTMLElement) => caja.querySelector<HTMLElement>('li[aria-current="true"]');
  const nombres = (caja: HTMLElement) => tarjetas(caja).map((li) => li.querySelector("h2")?.textContent);

  /** El backend: guarda la vista con PATCH y la devuelve en el perfil. `fallaElPatch` responde un error */
  function servidorDeVistas(inicial: string | null = null, fallaElPatch?: Respuesta) {
    let vista = inicial;
    servidor(async (metodo, url) => {
      if (url.includes("/users/me")) return ok({ user: usuario });
      if (metodo === "PATCH" && url.endsWith("/perfil")) {
        if (fallaElPatch) return fallaElPatch;
        vista = (pedidos.at(-1)!.body as { vista: string | null }).vista;
      }
      return ok({ perfil: perfil({ vista }) });
    });
  }

  it("muestra todos los portafolios en tarjetas, el aplicado primero, sin saludo ni los datos de la cuenta", async () => {
    servidorDeVistas();
    const { caja } = await montar(<DashboardPage />, "/admin");
    await hasta(() => expect(aplicado(caja)).toBeTruthy());
    expect(caja.querySelector("h1")?.textContent).toBe("Tus portafolios");
    expect(caja.textContent).not.toContain("Hola");
    expect(caja.textContent).not.toContain("Ricardo");
    expect(caja.textContent).not.toContain("Tus datos");

    expect(nombres(caja)).toEqual(VISTAS.map(({ nombre }) => nombre));
    expect(tarjetas(caja)[0]).toBe(aplicado(caja));
    expect(caja.querySelectorAll('li[aria-current="true"]')).toHaveLength(1);
  });

  it("el aplicado tiene su cielo propio: la portada desenfocada, la computadora, el celular y el sello", async () => {
    servidorDeVistas();
    const { caja } = await montar(<DashboardPage />, "/admin");
    await hasta(() => expect(aplicado(caja)).toBeTruthy());

    const frente = aplicado(caja)!;
    expect(frente.querySelector("h2")?.textContent).toBe("mi.universo");
    // Lo que sigue al punto va en el color de acento
    expect(frente.querySelector("h2 .text-secundario")?.textContent).toBe(".universo");
    expect(frente.textContent).toContain("Aplicado");
    expect([...frente.querySelectorAll("img")].map((img) => img.getAttribute("alt"))).toEqual([
      "",
      "mi.universo en una computadora",
      "mi.universo en un celular",
    ]);
    // La portada desenfocada de atrás es decorativa
    expect(frente.querySelector("img")?.getAttribute("aria-hidden")).toBe("true");
    expect(frente.querySelector('a[href="/"]')?.textContent).toBe("Ver sitio");
    expect(frente.querySelector("button")).toBeNull();
  });

  it("los demás muestran solo su portada y «Aplicar»", async () => {
    servidorDeVistas();
    const { caja } = await montar(<DashboardPage />, "/admin");
    await hasta(() => expect(aplicado(caja)).toBeTruthy());

    const basica = tarjetas(caja).find((li) => li.querySelector("h2")?.textContent === "Básica")!;
    expect([...basica.querySelectorAll("img")].map((img) => img.getAttribute("alt"))).toEqual([
      "Básica en una computadora",
    ]);
    expect(basica.textContent).not.toContain("Aplicado");
    expect(porEtiqueta(caja, "Aplicar Básica")?.textContent).toBe("Aplicar");
  });

  it("primero va la vista guardada en el perfil", async () => {
    servidorDeVistas("basica");
    const { caja } = await montar(<DashboardPage />, "/admin");
    await hasta(() => expect(aplicado(caja)?.querySelector("h2")?.textContent).toBe("Básica"));
    expect(nombres(caja)).toEqual(["Básica", "mi.universo"]);
  });

  it("«Aplicar» la guarda con PATCH /perfil, y con la respuesta pasa al primer lugar", async () => {
    servidorDeVistas();
    const { caja } = await montar(<DashboardPage />, "/admin");
    await hasta(() => expect(aplicado(caja)).toBeTruthy());

    await click(porEtiqueta(caja, "Aplicar Básica"));

    await hasta(() => expect(aplicado(caja)?.querySelector("h2")?.textContent).toBe("Básica"));
    const patch = pedidos.filter(({ metodo }) => metodo === "PATCH");
    expect(patch.map(({ body }) => body)).toEqual([{ vista: "basica" }]);
    expect(patch[0]!.url).toMatch(/\/perfil$/);
    expect(nombres(caja)[0]).toBe("Básica");
    expect(porEtiqueta(caja, "Aplicar mi.universo")).toBeTruthy();
    expect(porEtiqueta(caja, "Aplicar Básica")).toBeNull();
  });

  it("si el backend rechaza el cambio, avisa con su mensaje y el aplicado sigue igual", async () => {
    servidorDeVistas(null, {
      status: 404,
      body: { ok: false, message: "El perfil todavía no está cargado: crealo primero con PUT /perfil" },
    });
    const { caja } = await montar(<DashboardPage />, "/admin");
    await hasta(() => expect(aplicado(caja)).toBeTruthy());

    await click(porEtiqueta(caja, "Aplicar Básica"));

    await hasta(() =>
      expect(caja.querySelector('[role="alert"]')?.textContent).toContain("El perfil todavía no está cargado"),
    );
    expect(aplicado(caja)?.querySelector("h2")?.textContent).toBe("mi.universo");
  });

  it("si la vista guardada ya no existe, primero va la de por defecto", async () => {
    servidorDeVistas("no-existe");
    const { caja } = await montar(<DashboardPage />, "/admin");
    await hasta(() => expect(aplicado(caja)?.querySelector("h2")?.textContent).toBe("mi.universo"));
  });
});

describe("layout del panel", () => {
  const usuario = { id: "1", nombre: "Ana", apellido: "Pérez" };

  it("muestra las secciones en la barra flotante y marca solo la actual", async () => {
    servidor(() => ok({ user: usuario }));
    const { caja } = await montar(<AdminLayout />, "/admin/blog");

    const barra = porEtiqueta(caja, "Secciones del panel")!;
    expect(barra.querySelectorAll("a")).toHaveLength(9);
    const actuales = barra.querySelectorAll('[aria-current="page"]');
    expect(actuales).toHaveLength(1);
    expect(actuales[0].textContent).toBe("Blog");
  });

  it("centra la sección actual, porque en celular la barra se desliza", async () => {
    servidor(() => ok({ user: usuario }));
    const centrar = vi.fn();
    Element.prototype.scrollIntoView = centrar;

    await montar(<AdminLayout />, "/admin/apariencia");

    expect(centrar).toHaveBeenCalledWith({ inline: "center", block: "nearest" });
    expect((centrar.mock.contexts[0] as Element).textContent).toBe("Apariencia");
    Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  });

  it("dibuja la navegación elegida en Apariencia, en su lugar", async () => {
    servidor(() => ok({ user: usuario }));
    const { caja, store } = await montar(<AdminLayout />, "/admin/blog");
    const barra = () => porEtiqueta(caja, "Secciones del panel")!;
    const nombres = () => [...barra().querySelectorAll("a")].map((a) => a.textContent).filter(Boolean);
    const alPie = () =>
      Boolean(caja.querySelector("main")!.compareDocumentPosition(barra()) & Node.DOCUMENT_POSITION_FOLLOWING);
    const elegir = (estilo: Parameters<typeof setNavegacion>[0]) =>
      act(async () => {
        store.dispatch(setNavegacion(estilo));
      });

    // Por defecto, la cápsula: al pie y con todos los nombres
    expect(alPie()).toBe(true);
    expect(nombres()).toHaveLength(9);

    await elegir("dock");
    expect(alPie()).toBe(true);
    expect(nombres()).toEqual(["Blog"]);

    await elegir("tabs");
    expect(alPie()).toBe(false);
    expect(nombres()).toHaveLength(9);
  });

  it("deja arriba el usuario, el enlace al sitio y el cierre de sesión", async () => {
    servidor(() => ok({ user: usuario }));
    const { caja, store } = await montar(<AdminLayout />, "/admin");

    await hasta(() => expect(caja.querySelector("header")?.textContent).toContain("Ana Pérez"));
    expect(caja.querySelector('header a[href="/"]')?.textContent).toContain("Ver sitio");

    await click(boton(caja, "Cerrar sesión"));
    expect(store.getState().auth.token).toBeNull();
  });
});

describe("apariencia", () => {
  const FUENTES = GRUPOS_FUENTES.flatMap((grupo) => grupo.fuentes);
  const fuente = (label: string) => FUENTES.find((f) => f.label === label)!;
  const selector = (caja: HTMLElement) =>
    [...caja.querySelectorAll("label")].find((l) => l.textContent?.includes("Tipografía"))!.querySelector("select")!;

  // Igual que en la app: el panel aplica su tema (AdminLayout) y la página solo cambia el estado
  function PaginaConTema() {
    useAplicarTema(useAppSelector((state) => state.theme.vars));
    return <ThemePage />;
  }

  /** El backend del selector de vistas: `/perfil/admin` con la vista guardada, y el PATCH que la cambia. `sinPerfil`: 404 */
  function servidorDelPerfil(inicial: string | null = null, sinPerfil = false) {
    let vista = inicial;
    servidor((metodo) => {
      if (sinPerfil) return { status: 404, body: { ok: false, message: "El perfil todavía no está cargado" } };
      if (metodo === "PATCH") vista = (pedidos.at(-1)!.body as { vista: string | null }).vista;
      return ok({ perfil: perfil({ vista }) });
    });
  }
  const tarjetasDeVista = (caja: HTMLElement) => [
    ...caja.querySelectorAll<HTMLInputElement>('input[name="vista-web"]'),
  ];
  // El fieldset deshabilita sus radios mientras carga, mientras guarda y sin perfil
  const vistasHabilitadas = (caja: HTMLElement) => !tarjetasDeVista(caja)[0]?.closest("fieldset")?.disabled;

  beforeEach(() => servidorDelPerfil());
  afterEach(() => document.documentElement.removeAttribute("style"));

  it("los apartados son Colores del panel, Navegación y Vista web pública, sin colores sueltos para elegir", async () => {
    const { caja } = await montar(<ThemePage />);
    expect([...caja.querySelectorAll("legend")].map((l) => l.textContent)).toEqual([
      "Colores del panel",
      "Navegación",
      "Vista web pública",
    ]);
    expect(caja.querySelector('input[type="color"]')).toBeNull();
    expect(caja.textContent).not.toContain("Redondeo");
    expect(caja.textContent).not.toContain("Tipos de card");
  });

  it("ofrece una vista web por cada carpeta de src/vistas, marcada la que guardó el perfil", async () => {
    servidorDelPerfil("basica");
    const { caja } = await montar(<ThemePage />);
    await hasta(() => expect(tarjetasDeVista(caja).find((o) => o.checked)?.value).toBe("basica"));

    expect(tarjetasDeVista(caja).map((o) => o.value)).toEqual(VISTAS.map((v) => v.id));
    expect(tarjetasDeVista(caja).filter((o) => o.checked)).toHaveLength(1);
    // Elegir el diseño no carga la web pública: solo el perfil del panel
    expect(pedidos.map(({ url }) => new URL(url).pathname.split("/").slice(-2).join("/"))).toEqual(["perfil/admin"]);
  });

  it("sin vista guardada (null), marca la de por defecto", async () => {
    const { caja } = await montar(<ThemePage />);
    await hasta(() => expect(tarjetasDeVista(caja).find((o) => o.checked)?.value).toBe("rr-dev"));
  });

  it("elegir una vista la guarda con PATCH /perfil, mandando la id y no el nombre", async () => {
    const { caja } = await montar(<ThemePage />);
    await hasta(() => expect(vistasHabilitadas(caja)).toBe(true));

    await click(tarjetasDeVista(caja).find((o) => o.value === "basica"));

    await hasta(() => expect(tarjetasDeVista(caja).find((o) => o.checked)?.value).toBe("basica"));
    expect(pedidos.filter(({ metodo }) => metodo === "PATCH").map(({ body }) => body)).toEqual([{ vista: "basica" }]);
  });

  it("sin perfil cargado no deja elegir y avisa que primero hay que cargarlo", async () => {
    servidorDelPerfil(null, true);
    const { caja } = await montar(<ThemePage />);

    await hasta(() => expect(caja.textContent).toContain("Primero cargá el perfil: la vista se guarda en él."));
    expect(vistasHabilitadas(caja)).toBe(false);
  });

  it("cada muestra de vista lleva los colores de SU portafolio, y cambiar los del panel no la toca", async () => {
    const { caja, store } = await montar(<ThemePage />);
    const muestra = (id: string) =>
      tarjetasDeVista(caja)
        .find((o) => o.value === id)!
        .closest("label")!
        .querySelector<HTMLElement>(".tema")!;
    const fondoDe = (id: string) => varsDeVista(VISTAS.find((v) => v.id === id)!).fondo;

    expect(muestra("rr-dev").style.getPropertyValue("--fondo")).toBe(fondoDe("rr-dev"));
    expect(muestra("basica").style.getPropertyValue("--fondo")).toBe(fondoDe("basica"));

    await act(async () => {
      store.dispatch(setPaleta("uva-neon"));
    });
    expect(muestra("rr-dev").style.getPropertyValue("--fondo")).toBe(fondoDe("rr-dev"));
  });

  it("ofrece las paletas con una sola marcada, cada una mostrada con sus propios colores", async () => {
    const { caja } = await montar(<ThemePage />);
    const opciones = [...caja.querySelectorAll<HTMLInputElement>('input[name="paleta"]')];

    expect(opciones.map((o) => o.value)).toEqual(PALETAS.map((p) => p.id));
    expect(opciones.filter((o) => o.checked)).toHaveLength(1);

    const muestra = opciones[0].closest("label")!.querySelector<HTMLElement>('[aria-hidden="true"]')!;
    expect(muestra.style.backgroundColor).toBe("rgb(0, 0, 0)");
  });

  it("tiene un apartado de navegación donde siempre hay una sola opción elegida", async () => {
    const { caja, store } = await montar(<ThemePage />);
    const opciones = () => [...caja.querySelectorAll<HTMLInputElement>('input[name="navegacion"]')];
    const elegidas = () =>
      opciones()
        .filter((o) => o.checked)
        .map((o) => o.value);

    expect(opciones().map((o) => o.value)).toEqual(["dock", "capsula", "tabs"]);
    expect(elegidas()).toEqual(["capsula"]);

    await click(opciones().find((o) => o.value === "tabs"));
    expect(elegidas()).toEqual(["tabs"]);
    expect(store.getState().theme.navegacion).toBe("tabs");

    await click(boton(caja, "Restablecer apariencia"));
    expect(elegidas()).toEqual(["capsula"]);
  });

  it("se elige una sola tipografía entre todas las fuentes", async () => {
    const { caja } = await montar(<ThemePage />);
    expect(selector(caja).options).toHaveLength(FUENTES.length);
    expect(caja.textContent).not.toContain("Fuente de subtítulos");
    expect(caja.textContent).not.toContain("Fuente del texto");
  });

  it("muestra cada nombre con su propia fuente, también la elegida con el selector cerrado", async () => {
    const lora = fuente("Lora");
    const { caja } = await montar(<ThemePage />);

    const opcion = [...selector(caja).options].find((o) => o.value === lora.value)!;
    expect(opcion.style.fontFamily).toBe(lora.value);

    await cambiarValor(selector(caja), lora.value, "change");
    expect(selector(caja).style.fontFamily).toBe(lora.value);
  });

  it("elegir el título aplica su combinación, carga las tres fuentes y las nombra", async () => {
    const lexend = fuente("Lexend");
    const serif = fuente("Source Serif 4");
    const { caja } = await montar(<PaginaConTema />);
    const cargaTitulo = vi.spyOn(lexend, "cargar").mockResolvedValue(undefined);
    const cargaTexto = vi.spyOn(serif, "cargar").mockResolvedValue(undefined);

    await cambiarValor(selector(caja), lexend.value, "change");

    const estilos = document.documentElement.style;
    expect(estilos.getPropertyValue("--fuente-titulo")).toBe(lexend.value);
    expect(estilos.getPropertyValue("--fuente-subtitulo")).toBe(lexend.value);
    expect(estilos.getPropertyValue("--fuente-texto")).toBe(serif.value);
    expect(cargaTitulo).toHaveBeenCalled();
    expect(cargaTexto).toHaveBeenCalled();
    expect(caja.textContent).toContain("Títulos: Lexend · Subtítulos: Lexend · Texto: Source Serif 4");
  });

  it("restablecer vuelve a las tres fuentes por defecto", async () => {
    const { caja } = await montar(<PaginaConTema />);

    await cambiarValor(selector(caja), fuente("Lora").value, "change");
    await click(boton(caja, "Restablecer apariencia"));

    const estilos = document.documentElement.style;
    expect(selector(caja).value).toBe(defaultTheme.fuenteTitulo);
    expect(estilos.getPropertyValue("--fuente-titulo")).toBe(defaultTheme.fuenteTitulo);
    expect(estilos.getPropertyValue("--fuente-subtitulo")).toBe(defaultTheme.fuenteSubtitulo);
    expect(estilos.getPropertyValue("--fuente-texto")).toBe(defaultTheme.fuenteTexto);
  });
});

describe("blog en la web", () => {
  it("lista las publicaciones con su enlace", async () => {
    servidor(() => listado("entradas", [entrada("1", { etiquetas: ["node", "react"] })]));
    const { caja } = await montar(<BlogLista />);

    await hasta(() => expect(caja.querySelector('a[href="/blog/e1"]')?.textContent).toBe("E1"));
    expect(caja.textContent).toContain("Resumen 1");
    expect(caja.textContent).toContain("node · react");
    expect(caja.textContent).toContain("de octubre de 2026");
  });

  it("avisa si todavía no hay publicaciones", async () => {
    servidor(() => listado("entradas", []));
    const { caja } = await montar(<BlogLista />);

    await hasta(() => expect(caja.textContent).toContain("Todavía no hay publicaciones."));
  });

  it("muestra la entrada con sus fotos y archivos", async () => {
    const completa = entrada("1", {
      portada: { url: "https://x.com/portada.webp", alt: "Portada" },
      galeria: [{ url: "https://x.com/foto.webp", alt: "Una foto" }],
      documentos: [{ url: "https://x.com/manual.pdf", titulo: "Manual" }],
    });
    servidor(() => ok({ entrada: completa }));
    const { caja } = await montar(<EntradaDetalle slug="e1" />);

    await hasta(() => expect(caja.querySelector("h1")?.textContent).toBe("E1"));
    expect([...caja.querySelectorAll("p")].map((p) => p.textContent)).toContain("Párrafo dos.");
    expect(caja.querySelector('img[alt="Portada"]')?.getAttribute("src")).toBe("https://x.com/portada.webp");
    expect(caja.querySelector('img[alt="Una foto"]')).not.toBeNull();
    expect(caja.querySelector('a[href="https://x.com/manual.pdf"]')?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("muestra el contenido como texto, nunca como HTML", async () => {
    servidor(() => ok({ entrada: entrada("1", { contenido: "<img src=x onerror=alert(1)>" }) }));
    const { caja } = await montar(<EntradaDetalle slug="e1" />);

    await hasta(() => expect(caja.textContent).toContain("<img src=x onerror=alert(1)>"));
    expect(caja.querySelector("img")).toBeNull();
  });

  it("si no existe o no está publicada, lo dice", async () => {
    servidor(() => ({ status: 404, body: { ok: false, message: "Entrada no encontrada" } }));
    const { caja } = await montar(<EntradaDetalle slug="no-existe" />);

    await hasta(() => expect(caja.textContent).toContain("Esta publicación no existe o no está publicada."));
  });
});
