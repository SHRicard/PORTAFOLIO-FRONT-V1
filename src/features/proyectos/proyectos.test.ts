// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/app/store";
import { sessionStarted } from "@/features/auth/authActions";
import { getErrorDetail, getErrorMessage } from "@/lib/errors";
import { proyectosApi } from "./proyectosApi";
import {
  aFormulario,
  aProyectoInput,
  campoFormulario,
  pendientes,
  PROYECTO_VACIO,
  proyectoSchema,
} from "./schemas";
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
  enlaces: {
    demo: null,
    demoPorSolicitud: true,
    repositorios: [{ nombre: "App", url: "https://github.com/a/b" }],
    tiendas: [{ tienda: "playStore", app: "FCT", url: null }],
    apkDemo: { url: null, nota: "Puede tardar en arrancar." },
  },
  portada: { url: "https://res.cloudinary.com/x/portada.webp", alt: "Portada" },
  galeria: [{ url: null, alt: "Inicio" }],
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
    const { id: _id, orden: _orden, createdAt: _c, updatedAt: _u, ...original } = proyecto;
    const valores = proyectoSchema.parse(aFormulario(proyecto));
    expect(aProyectoInput(valores)).toEqual(original);
  });

  it("los campos vacíos viajan como null y el slug vacío no se manda", () => {
    const input = aProyectoInput(proyectoSchema.parse(valido));
    expect(input.slug).toBeUndefined();
    expect(input.enlaces?.demo).toBeNull();
    expect(input.enlaces?.apkDemo).toBeNull();
    expect(input.portada).toBeNull();
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
    expect(mensaje({ demo: "http://inseguro.com" })).toBe("La URL tiene que empezar con https://");
    expect(mensaje({ slug: "admin" })).toBe('El slug "admin" está reservado');
    expect(mensaje({ slug: "Con Espacios" })).toBe("Solo minúsculas, números y guiones (ej. mi-proyecto)");
  });

  it("una portada con imagen necesita descripción", () => {
    const resultado = proyectoSchema.safeParse({ ...valido, portadaUrl: "https://x.com/a.webp" });
    expect(resultado.error?.issues[0]?.path).toEqual(["portadaAlt"]);
  });

  it("pendientes lista lo que le falta al proyecto", () => {
    expect(pendientes(proyecto)).toEqual(["Imágenes sin subir", "Documentos sin subir", "Tiendas sin link", "APK sin link"]);
  });
});

describe("errores del backend en el formulario", () => {
  it("traduce los nombres de la API a los del formulario", () => {
    expect(campoFormulario("titulo")).toBe("titulo");
    expect(campoFormulario("enlaces.demo")).toBe("demo");
    expect(campoFormulario("enlaces.apkDemo.url")).toBe("apkUrl");
    expect(campoFormulario("enlaces.repositorios.0.url")).toBe("repositorios.0.url");
    expect(campoFormulario("portada.alt")).toBe("portadaAlt");
    expect(campoFormulario("galeria.2.alt")).toBe("galeria.2.alt");
    expect(campoFormulario("tecnologias.3")).toBe("tecnologias");
    expect(campoFormulario("enlaces.tiendas")).toBe("tiendas.root");
    expect(campoFormulario("documentos")).toBe("documentos.root");
  });

  it("devuelve null para lo que no tiene dónde mostrarse", () => {
    expect(campoFormulario("orden")).toBeNull();
    expect(campoFormulario("destacado")).toBeNull();
    expect(campoFormulario("enlaces.demoPorSolicitud")).toBeNull();
  });
});

describe("servicio de proyectos (RTK Query)", () => {
  it("el listado del panel lleva el token y pide el máximo por página", async () => {
    const fetchMock = mockFetch(() => ({ status: 200, body: { ok: true, data: { proyectos: [proyecto], paginacion } } }));
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
});
