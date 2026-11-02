import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/app/store";
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
import { useApplyTheme } from "@/features/theme/useApplyTheme";
import { api } from "@/services/api";
import ArchivosPage from "./ArchivosPage";
import EntradaFormPage from "./EntradaFormPage";
import EntradasPage from "./EntradasPage";
import EstudiosPage from "./EstudiosPage";
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
  enlaces: { demo: null, demoPorSolicitud: false, repositorios: [], tiendas: [], apkDemo: null },
  portada: null,
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
  correoContacto: "a@b.com",
  redes: [],
  habilidades: [],
  idiomas: [],
  datosCuriosos: [],
  foto: null,
  cv: null,
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
        <MemoryRouter initialEntries={[ruta]}>{ui}</MemoryRouter>
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

const archivoApk = (tipo = "application/vnd.android.package-archive") => new File(["x"], "Mi App.apk", { type: tipo });

async function elegirArchivo(selector: HTMLInputElement, archivoNuevo = new File(["x"], "foto.webp", { type: "image/webp" })) {
  Object.defineProperty(selector, "files", { value: [archivoNuevo], configurable: true });
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

describe("formulario de proyecto", () => {
  const props = { guardando: false, errorGeneral: null, textoGuardar: "Guardar", onGuardar: vi.fn() };
  const enEdicion = (
    <Routes>
      <Route path="/admin/proyectos/:id" element={<ProyectoFormPage />} />
    </Routes>
  );
  const conDatos = proyecto("1", {
    enlaces: {
      demo: null,
      demoPorSolicitud: false,
      repositorios: [{ nombre: "R", url: "https://x.com/r" }],
      tiendas: [],
      apkDemo: null,
    },
    portada: { url: "https://x.com/p.webp", alt: "P" },
  });

  it("pinta el máximo de la galería y no guarda", async () => {
    const onGuardar = vi.fn();
    const galeria = Array.from({ length: 21 }, (_, i) => ({ url: `https://x.com/${i}.webp`, alt: "a" }));
    const { caja } = await montar(<ProyectoForm {...props} proyecto={proyecto("1", { galeria })} onGuardar={onGuardar} />);

    await click(boton(caja, "Guardar"));

    await hasta(() => expect(caja.textContent).toContain("Máximo 20 imágenes en la galería"));
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("el texto de ayuda del slug solo aparece al crear", async () => {
    const nuevo = await montar(<ProyectoForm {...props} />);
    expect(nuevo.caja.querySelector<HTMLInputElement>("#slug")?.placeholder).toContain("Vacío");

    const edicion = await montar(<ProyectoForm {...props} proyecto={proyecto("1")} />);
    expect(edicion.caja.querySelector<HTMLInputElement>("#slug")?.placeholder).toBe("");
  });

  it("marca los errores del backend en su campo aunque en la API se llamen distinto", async () => {
    servidor((metodo) =>
      metodo === "PATCH"
        ? rechazo(
            { campo: "enlaces.repositorios.0.url", mensaje: "Repositorio rechazado" },
            { campo: "portada.alt", mensaje: "Portada rechazada" },
          )
        : ok({ proyecto: conDatos }),
    );
    const { caja } = await montar(enEdicion, "/admin/proyectos/1");
    await hasta(() => expect(boton(caja, "Guardar cambios")).not.toBeNull());

    await click(boton(caja, "Guardar cambios"));

    await hasta(() => expect(caja.textContent).toContain("Repositorio rechazado"));
    expect(caja.textContent).toContain("Portada rechazada");
    expect(caja.textContent).not.toContain("Datos inválidos"); // no hace falta el error general
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

  it("la APK de un proyecto sube a apk/<slug>", async () => {
    servidor(() => ({ status: 503, body: { ok: false, message: "S3 no está configurado en el servidor" } }));
    const { caja } = await montar(<ProyectoForm {...props} proyecto={proyecto("1")} />);

    await elegirArchivo(caja.querySelector<HTMLInputElement>('#apkUrl ~ input[type="file"]')!, archivoApk());

    await hasta(() => expect(pedidos).toHaveLength(1));
    expect(pedidos[0]?.body).toEqual({ tipo: "apk", carpeta: "apk/p1", nombre: "Mi App.apk" });
    await hasta(() => expect(caja.textContent).toContain("S3 no está configurado en el servidor"));
  });

  it("un proyecto nuevo sube a la carpeta de su título", async () => {
    servidor(() => ({ status: 503, body: { ok: false, message: "Cloudinary no está configurado en el servidor" } }));
    const { caja } = await montar(<ProyectoForm {...props} />);

    await cambiarValor(caja.querySelector<HTMLInputElement>("#titulo")!, "Mi App Ñandú", "input");
    await elegirArchivo(caja.querySelector<HTMLInputElement>('#portadaUrl ~ input[type="file"]')!);

    await hasta(() => expect(pedidos).toHaveLength(1));
    expect(pedidos[0]?.body).toEqual({ tipo: "imagen", carpeta: "proyectos/mi-app-nandu" });
  });
});

describe("formulario de datos públicos", () => {
  it("pinta el máximo de redes y no guarda", async () => {
    const redes = Array.from({ length: 21 }, (_, i) => ({ tipo: "otra" as const, url: `https://x.com/${i}` }));
    servidor(() => ok({ perfil: perfil() }));
    const { caja } = await montar(<PerfilForm perfil={perfil({ redes })} />);

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
});

describe("borrar lo que está abierto en el formulario", () => {
  function conEstudios(lista = [estudio("1"), estudio("2")]) {
    servidor((metodo, url) => {
      if (metodo !== "DELETE") return listado("estudios", lista);
      lista = lista.filter((e) => !url.endsWith(`/${e.id}`));
      return ok({ id: "1" });
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);
  }

  it("estudios: cierra el formulario si borrás el abierto", async () => {
    conEstudios();
    const { caja } = await montar(<EstudiosPage />);
    await hasta(() => expect(porEtiqueta(caja, "Editar E1")).not.toBeNull());
    await click(porEtiqueta(caja, "Editar E1"));
    expect(caja.textContent).toContain("Editar estudio");

    await click(porEtiqueta(caja, "Borrar E1"));

    await hasta(() => expect(porEtiqueta(caja, "Editar E1")).toBeNull());
    expect(caja.textContent).not.toContain("Editar estudio");
  });

  it("estudios: lo deja abierto si borrás otro", async () => {
    conEstudios();
    const { caja } = await montar(<EstudiosPage />);
    await hasta(() => expect(porEtiqueta(caja, "Editar E1")).not.toBeNull());
    await click(porEtiqueta(caja, "Editar E1"));

    await click(porEtiqueta(caja, "Borrar E2"));

    await hasta(() => expect(porEtiqueta(caja, "Editar E2")).toBeNull());
    expect(caja.textContent).toContain("Editar estudio");
  });

  it("experiencia: cierra el formulario si borrás el abierto", async () => {
    let lista = [trabajo("1")];
    servidor((metodo) => {
      if (metodo !== "DELETE") return listado("experiencia", lista);
      lista = [];
      return ok({ id: "1" });
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { caja } = await montar(<ExperienciaPage />);
    await hasta(() => expect(porEtiqueta(caja, "Editar Dev en Emp1")).not.toBeNull());
    await click(porEtiqueta(caja, "Editar Dev en Emp1"));
    expect(caja.querySelector("form")).not.toBeNull();

    await click(porEtiqueta(caja, "Borrar Dev en Emp1"));

    await hasta(() => expect(porEtiqueta(caja, "Editar Dev en Emp1")).toBeNull());
    expect(caja.querySelector("form")).toBeNull();
  });
});

describe("certificado pendiente", () => {
  it("guardar sin cambios manda { url: null }", async () => {
    const pendiente = estudio("1", { url: null });
    servidor((metodo) => (metodo === "PATCH" ? ok({ estudio: pendiente }) : listado("estudios", [pendiente])));
    const { caja } = await montar(<EstudiosPage />);
    await hasta(() => expect(porEtiqueta(caja, "Editar E1")).not.toBeNull());
    await click(porEtiqueta(caja, "Editar E1"));

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

  it("avisa si no pudo copiar el link", async () => {
    conArchivo();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(boton(caja, "Copiar link")).not.toBeNull());

    await click(boton(caja, "Copiar link"));

    await hasta(() => expect(caja.textContent).toContain("No se pudo copiar el link."));
  });

  it("muestra Copiado y vuelve solo", async () => {
    conArchivo();
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(boton(caja, "Copiar link")).not.toBeNull());

    vi.useFakeTimers({ toFake: ["setTimeout"] });
    await click(boton(caja, "Copiar link"));
    expect(writeText).toHaveBeenCalledWith(archivo.url);
    expect(caja.textContent).toContain("Copiado");

    await act(async () => vi.advanceTimersByTime(2000));
    expect(boton(caja, "Copiar link")).not.toBeNull();
  });

  it("un APK va a apk/<slug> si elegiste un proyecto", async () => {
    sinFirma();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(caja.querySelector('option[value="proyectos/p1"]')).not.toBeNull());

    await cambiarValor(caja.querySelector<HTMLSelectElement>('[aria-label="Carpeta de destino"]')!, "proyectos/p1", "change");
    await elegirArchivo(caja.querySelector<HTMLInputElement>('input[type="file"]')!, archivoApk(""));

    await hasta(() => expect(pedidos.some((p) => p.metodo === "POST")).toBe(true));
    expect(pedidos.find((p) => p.metodo === "POST")?.body).toEqual({ tipo: "apk", carpeta: "apk/p1", nombre: "Mi App.apk" });
  });

  it("un APK sin proyecto elegido va a apk/, nunca a la carpeta general", async () => {
    sinFirma();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(boton(caja, "Subir archivo")).not.toBeNull());

    await elegirArchivo(caja.querySelector<HTMLInputElement>('input[type="file"]')!, archivoApk());

    await hasta(() => expect(pedidos.some((p) => p.metodo === "POST")).toBe(true));
    expect(pedidos.find((p) => p.metodo === "POST")?.body).toEqual({ tipo: "apk", carpeta: "apk", nombre: "Mi App.apk" });
  });

  it("si elegís una entrada del blog, sube a su carpeta", async () => {
    sinFirma();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(caja.querySelector('option[value="blogs/e1"]')).not.toBeNull());

    await cambiarValor(caja.querySelector<HTMLSelectElement>('[aria-label="Carpeta de destino"]')!, "blogs/e1", "change");
    await elegirArchivo(caja.querySelector<HTMLInputElement>('input[type="file"]')!);

    await hasta(() => expect(pedidos.some((p) => p.metodo === "POST")).toBe(true));
    expect(pedidos.find((p) => p.metodo === "POST")?.body).toEqual({ tipo: "imagen", carpeta: "blogs/e1" });
  });

  it("el aviso de borrar habla de todo el portafolio", async () => {
    conArchivo();
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(false);
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(porEtiqueta(caja, "Borrar a")).not.toBeNull());

    await click(porEtiqueta(caja, "Borrar a"));

    expect(confirmar.mock.calls[0]?.[0]).toContain("Si tu portafolio lo usa");
  });

  it("si no elegís un proyecto, sube a la carpeta general", async () => {
    sinFirma();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(boton(caja, "Subir archivo")).not.toBeNull());

    await elegirArchivo(caja.querySelector<HTMLInputElement>('input[type="file"]')!);

    await hasta(() => expect(pedidos.some((p) => p.metodo === "POST")).toBe(true));
    expect(pedidos.find((p) => p.metodo === "POST")?.body).toEqual({ tipo: "imagen", carpeta: "biblioteca" });
  });

  it("si elegís un proyecto, sube a su carpeta", async () => {
    sinFirma();
    const { caja } = await montar(<ArchivosPage />);
    await hasta(() => expect(caja.querySelector('option[value="proyectos/p1"]')).not.toBeNull());

    await cambiarValor(caja.querySelector<HTMLSelectElement>('[aria-label="Carpeta de destino"]')!, "proyectos/p1", "change");
    await elegirArchivo(caja.querySelector<HTMLInputElement>('input[type="file"]')!);

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
    expect(caja.textContent).toContain("Sin portada");
    expect(porEtiqueta(caja, "Ver E1 en la web")).toBeNull(); // un borrador todavía no está en la web
  });

  it("borrar saca la entrada de la lista", async () => {
    let lista = [entrada("1")];
    servidor((metodo) => {
      if (metodo !== "DELETE") return listado("entradas", lista);
      lista = [];
      return ok({ id: "1" });
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { caja } = await montar(<EntradasPage />);
    await hasta(() => expect(porEtiqueta(caja, "Borrar E1")).not.toBeNull());

    await click(porEtiqueta(caja, "Borrar E1"));

    await hasta(() => expect(caja.textContent).toContain("No hay entradas para mostrar."));
  });

  it("una entrada nueva sube a blogs/<título>", async () => {
    servidor(() => ({ status: 503, body: { ok: false, message: "Cloudinary no está configurado en el servidor" } }));
    const { caja } = await montar(<EntradaForm {...props} />);

    await cambiarValor(caja.querySelector<HTMLInputElement>("#titulo")!, "Lancé mi app", "input");
    await elegirArchivo(caja.querySelector<HTMLInputElement>('input[type="file"]')!);

    await hasta(() => expect(pedidos).toHaveLength(1));
    expect(pedidos[0]?.body).toEqual({ tipo: "imagen", carpeta: "blogs/lance-mi-app" });
  });

  it("los archivos adjuntos suben como documento a la misma carpeta", async () => {
    servidor(() => ({ status: 503, body: { ok: false, message: "Cloudinary no está configurado en el servidor" } }));
    const { caja } = await montar(<EntradaForm {...props} entrada={entrada("1", { documentos: [{ url: null, titulo: "Manual" }] })} />);

    await elegirArchivo(caja.querySelector<HTMLInputElement>('#doc-url-0 ~ input[type="file"]')!);

    await hasta(() => expect(pedidos).toHaveLength(1));
    expect(pedidos[0]?.body).toEqual({ tipo: "documento", carpeta: "blogs/e1" });
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
        ? rechazo({ campo: "portada.alt", mensaje: "Portada rechazada" }, { campo: "etiquetas.0", mensaje: "Etiqueta rechazada" })
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

describe("apariencia", () => {
  const FUENTES = GRUPOS_FUENTES.flatMap((grupo) => grupo.fuentes);
  const fuente = (label: string) => FUENTES.find((f) => f.label === label)!;
  const selector = (caja: HTMLElement) =>
    [...caja.querySelectorAll("label")].find((l) => l.textContent?.includes("Tipografía"))!.querySelector("select")!;

  // Igual que en la app: App usa useApplyTheme y la página solo cambia el estado
  function PaginaConTema() {
    useApplyTheme();
    return <ThemePage />;
  }

  afterEach(() => document.documentElement.removeAttribute("style"));

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
