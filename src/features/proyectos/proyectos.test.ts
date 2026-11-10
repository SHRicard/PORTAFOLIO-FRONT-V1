// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/app/store";
import { sessionStarted } from "@/features/auth/authActions";
import { getErrorDetail, getErrorMessage } from "@/lib/errors";
import { contarParrafos } from "./formulario";
import { proyectosApi } from "./proyectosApi";
import { aFormulario, aProyectoInput, campoFormulario, PROYECTO_VACIO, proyectoSchema, queFalta } from "./schemas";
import type { Proyecto } from "./types";

const proyecto: Proyecto = {
  id: "1",
  titulo: "Facturación FCT",
  slug: "facturacion-fct",
  tipo: "personal",
  rol: "Creador y desarrollador",
  fecha: "2026-09",
  resumen: "Resumen",
  descripcion: "Párrafo uno.\n\nPárrafo dos.",
  tecnologias: ["React Native", "Expo"],
  repositorios: [
    { nombre: "App", url: "https://github.com/a/b" },
    { nombre: "APK de prueba (Android)", url: "https://github.com/a/b/releases/tag/v1" },
  ],
  // La primera imagen es la portada
  galeria: [
    { url: "https://res.cloudinary.com/x/portada.webp", alt: "Portada" },
    { url: null, alt: "Inicio" },
  ],
  documentos: [{ url: null, titulo: "Manual" }],
  destacado: true,
  estado: "publicado",
  orden: 3,
  createdAt: "2026-10-30T12:00:00.000Z",
  updatedAt: "2026-10-30T12:00:00.000Z",
};

const paginacion = { page: 1, limit: 100, total: 1, paginas: 1 };

const valido = { ...PROYECTO_VACIO, titulo: "Mi app", rol: "Dev", fecha: "2026-01", resumen: "R", descripcion: "D" };

type Reply = { status: number; body: unknown };

function mockFetch(handler: (req: Request) => Reply) {
  const fn = vi.fn(async (req: Request) => {
    const { status, body } = handler(req);
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

function storeConSesion() {
  const store = makeStore();
  store.dispatch(sessionStarted("tok123"));
  return store;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("formulario de proyectos", () => {
  it("un proyecto guardado ida y vuelta por el formulario no pierde datos", () => {
    // El slug no viaja: el formulario no lo edita y el proyecto conserva el que tenía
    const { id: _id, orden: _orden, createdAt: _c, updatedAt: _u, slug: _slug, ...original } = proyecto;
    const valores = proyectoSchema.parse(aFormulario(proyecto));
    expect(aProyectoInput(valores)).toEqual(original);
  });

  it("el slug no se manda y sin portada la galería no suma nada", () => {
    const input = aProyectoInput(proyectoSchema.parse(valido));
    expect(input.slug).toBeUndefined();
    expect(input.repositorios).toEqual([]);
    expect(input.galeria).toEqual([]);
  });

  it("aFormulario separa la primera imagen de la galería en el campo Portada", () => {
    const valores = aFormulario(proyecto);
    expect(valores.portadaUrl).toBe("https://res.cloudinary.com/x/portada.webp");
    expect(valores.portadaAlt).toBe("Portada");
    expect(valores.galeria).toEqual([{ url: "", alt: "Inicio" }]);
    expect(valores.repositorios).toEqual(proyecto.repositorios);
  });

  it("aProyectoInput pone la portada primera en la galería, aunque todavía no tenga link", () => {
    const conLink = aProyectoInput(
      proyectoSchema.parse({
        ...valido,
        portadaUrl: "https://x.com/p.webp",
        portadaAlt: "P",
        galeria: [{ url: "https://x.com/1.webp", alt: "Uno" }],
      }),
    );
    expect(conLink.galeria).toEqual([
      { url: "https://x.com/p.webp", alt: "P" },
      { url: "https://x.com/1.webp", alt: "Uno" },
    ]);

    const pendiente = aProyectoInput(proyectoSchema.parse({ ...valido, portadaAlt: "Falta subirla" }));
    expect(pendiente.galeria).toEqual([{ url: null, alt: "Falta subirla" }]);
  });

  it("acepta hasta 20 imágenes contando la portada", () => {
    const veinte = Array.from({ length: 20 }, (_, i) => ({ url: `https://x.com/${i}.webp`, alt: "a" }));
    const sinPortada = proyectoSchema.safeParse({ ...valido, galeria: veinte });
    expect(sinPortada.success).toBe(true);

    const conPortada = proyectoSchema.safeParse({
      ...valido,
      portadaUrl: "https://x.com/p.webp",
      portadaAlt: "P",
      galeria: veinte,
    });
    expect(conPortada.error?.issues[0]).toMatchObject({
      path: ["galeria"],
      message: "Máximo 20 imágenes, contando la portada",
    });
  });

  it("las tecnologías se separan por línea, sin vacíos", () => {
    const input = aProyectoInput(proyectoSchema.parse({ ...valido, tecnologias: " React \n\nNode\n" }));
    expect(input.tecnologias).toEqual(["React", "Node"]);
  });

  it("rechaza lo mismo que el backend", () => {
    const mensaje = (datos: object) => proyectoSchema.safeParse({ ...valido, ...datos }).error?.issues[0]?.message;
    expect(mensaje({ titulo: "" })).toBe("Este campo es obligatorio");
    expect(mensaje({ resumen: "x".repeat(161) })).toBe("Máximo 160 caracteres");
    expect(mensaje({ fecha: "2026-13" })).toBe("Usá el formato AAAA-MM (ej. 2024-07)");
    expect(mensaje({ portadaUrl: "http://inseguro.com", portadaAlt: "P" })).toBe(
      "La URL tiene que empezar con https://",
    );
  });

  it("una portada con imagen necesita descripción", () => {
    const resultado = proyectoSchema.safeParse({ ...valido, portadaUrl: "https://x.com/a.webp" });
    expect(resultado.error?.issues[0]?.path).toEqual(["portadaAlt"]);
  });

  it("queFalta dice en una línea lo que le falta al proyecto, o null si está completo", () => {
    expect(queFalta(proyecto)).toBe("Falta subir 1 foto y el PDF");
    // La portada es la primera imagen: con descripción y sin link, falta subirla
    const sinSubir = (url: string | null) => ({ url, alt: "A" });
    expect(
      queFalta({
        galeria: [sinSubir(null), ...Array(6).fill(sinSubir(null))],
        documentos: [{ url: null, titulo: "M" }],
      }),
    ).toBe("Falta subir la portada, 6 fotos y el PDF");
    expect(queFalta({ galeria: [sinSubir(null)], documentos: [] })).toBe("Falta subir la portada");
    expect(queFalta({ galeria: [], documentos: [] })).toBe("Falta la portada");
    expect(
      queFalta({
        galeria: [],
        documentos: [
          { url: null, titulo: "M" },
          { url: null, titulo: "N" },
        ],
      }),
    ).toBe("Falta la portada y subir 2 PDF");
    expect(queFalta({ galeria: [sinSubir("https://x.com/p.webp")], documentos: [] })).toBeNull();
  });
});

describe("ayudas del formulario", () => {
  it("cuenta los párrafos separados por una línea en blanco", () => {
    expect(contarParrafos("Uno.\n\nDos.\n   \nTres.")).toBe(3);
    expect(contarParrafos("Una línea\notra del mismo párrafo")).toBe(1);
    expect(contarParrafos("")).toBe(0);
  });
});

describe("errores del backend en el formulario", () => {
  it("traduce los nombres de la API a los del formulario", () => {
    expect(campoFormulario("titulo")).toBe("titulo");
    expect(campoFormulario("repositorios.0.url")).toBe("repositorios.0.url");
    expect(campoFormulario("tecnologias.3")).toBe("tecnologias");
    expect(campoFormulario("documentos")).toBe("documentos.root");
    expect(campoFormulario("galeria")).toBe("galeria.root");
  });

  it("con portada en el formulario, galeria.0 de la API es la portada y las demás se corren un lugar", () => {
    expect(campoFormulario("galeria.0.alt", true)).toBe("portadaAlt");
    expect(campoFormulario("galeria.0.url", true)).toBe("portadaUrl");
    expect(campoFormulario("galeria.2.url", true)).toBe("galeria.1.url");
    // Sin portada, la galería del formulario es la de la API
    expect(campoFormulario("galeria.0.alt")).toBe("galeria.0.alt");
  });

  it("devuelve null para lo que no tiene dónde mostrarse", () => {
    expect(campoFormulario("orden")).toBeNull();
    expect(campoFormulario("destacado")).toBeNull();
    // Lo viejo ya no existe
    expect(campoFormulario("enlaces.demo")).toBeNull();
    expect(campoFormulario("portada.alt")).toBeNull();
  });
});

describe("servicio de proyectos (RTK Query)", () => {
  it("el listado del panel lleva el token y pide el máximo por página", async () => {
    const fetchMock = mockFetch(() => ({
      status: 200,
      body: { ok: true, data: { proyectos: [proyecto], paginacion } },
    }));
    const store = storeConSesion();

    const { data } = await store.dispatch(proyectosApi.endpoints.getProyectosAdmin.initiate({ estado: "borrador" }));

    const req = fetchMock.mock.calls[0]![0];
    expect(req.url).toContain("/proyectos/admin?limit=100&estado=borrador");
    expect(req.headers.get("authorization")).toBe("Bearer tok123");
    expect(data).toEqual([proyecto]);
  });

  it("con más de 100 proyectos trae todas las páginas, porque reordenar necesita la lista completa", async () => {
    const fetchMock = mockFetch((req) => {
      const page = Number(new URL(req.url).searchParams.get("page") ?? 1);
      const data = { proyectos: [{ ...proyecto, id: String(page) }], paginacion: { ...paginacion, page, paginas: 2 } };
      return { status: 200, body: { ok: true, data } };
    });
    const store = storeConSesion();

    const { data } = await store.dispatch(proyectosApi.endpoints.getProyectosAdmin.initiate({ estado: "borrador" }));

    expect(data?.map((p) => p.id)).toEqual(["1", "2"]);
    expect(fetchMock.mock.calls[1]![0].url).toContain("/proyectos/admin?limit=100&estado=borrador&page=2");
  });

  it("reordenar manda todos los ids en un solo body", async () => {
    const fetchMock = mockFetch(() => ({ status: 200, body: { ok: true, data: { proyectos: [] } } }));
    const store = storeConSesion();

    await store.dispatch(proyectosApi.endpoints.reordenarProyectos.initiate(["b", "a"]));

    const req = fetchMock.mock.calls[0]![0];
    expect(req.method).toBe("PUT");
    expect(await req.clone().json()).toEqual({ ids: ["b", "a"] });
  });

  it("guardar vuelve a pedir la lista sola", async () => {
    const fetchMock = mockFetch((req) =>
      req.method === "PATCH"
        ? { status: 200, body: { ok: true, data: { proyecto } } }
        : { status: 200, body: { ok: true, data: { proyectos: [proyecto], paginacion } } },
    );
    const store = storeConSesion();

    const suscripcion = store.dispatch(proyectosApi.endpoints.getProyectosAdmin.initiate());
    await suscripcion;
    await store.dispatch(
      proyectosApi.endpoints.actualizarProyecto.initiate({ id: "1", cambios: { estado: "privado" } }),
    );
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3)); // lista, PATCH y lista otra vez

    suscripcion.unsubscribe();
  });

  it("expone los errores del backend, incluido el 403 de un usuario que no es administrador", async () => {
    mockFetch(() => ({ status: 403, body: { ok: false, message: "Solo el administrador puede hacer esto" } }));
    const store = storeConSesion();

    const { error } = await store.dispatch(proyectosApi.endpoints.getProyectosAdmin.initiate());

    expect(getErrorMessage(error)).toBe("Solo el administrador puede hacer esto");
  });

  it("muestra el detalle por campo que manda el backend", async () => {
    mockFetch(() => ({
      status: 400,
      body: {
        ok: false,
        message: "Datos inválidos",
        details: [{ campo: "galeria.0.alt", mensaje: "Este campo es obligatorio" }],
      },
    }));
    const store = storeConSesion();

    const resultado = await store.dispatch(
      proyectosApi.endpoints.crearProyecto.initiate(aProyectoInput(proyectoSchema.parse(valido))),
    );

    expect(getErrorDetail(resultado.error)).toBe("Datos inválidos. galeria.0.alt: Este campo es obligatorio");
  });

  it("eliminar una foto manda su url en el body del DELETE y vuelve a pedir el proyecto", async () => {
    const url = "https://res.cloudinary.com/x/portada.webp";
    const fetchMock = mockFetch((req) =>
      req.method === "DELETE"
        ? { status: 200, body: { ok: true, data: { proyecto: { ...proyecto, galeria: [] }, archivo: "borrado" } } }
        : { status: 200, body: { ok: true, data: { proyecto } } },
    );
    const store = storeConSesion();

    const suscripcion = store.dispatch(proyectosApi.endpoints.getProyectoAdmin.initiate("1"));
    await suscripcion;
    const { data } = await store.dispatch(proyectosApi.endpoints.eliminarImagenProyecto.initiate({ id: "1", url }));

    const req = fetchMock.mock.calls[1]![0];
    expect(req.method).toBe("DELETE");
    expect(req.url).toContain("/proyectos/1/galeria");
    expect(req.headers.get("authorization")).toBe("Bearer tok123");
    expect(await req.clone().json()).toEqual({ url });
    expect(data?.archivo).toBe("borrado");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3)); // proyecto, DELETE y proyecto otra vez

    suscripcion.unsubscribe();
  });

  it("si Cloudinary falla, muestra el mensaje del backend", async () => {
    mockFetch(() => ({
      status: 502,
      body: { ok: false, message: "Cloudinary no pudo borrar el archivo. Probá de nuevo en unos minutos" },
    }));
    const store = storeConSesion();

    const { error } = await store.dispatch(
      proyectosApi.endpoints.eliminarImagenProyecto.initiate({ id: "1", url: "https://res.cloudinary.com/x/a.webp" }),
    );

    expect(getErrorMessage(error)).toBe("Cloudinary no pudo borrar el archivo. Probá de nuevo en unos minutos");
  });
});
