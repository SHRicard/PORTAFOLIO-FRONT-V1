// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/app/store";
import { sessionStarted } from "@/features/auth/authActions";
import { getErrorMessage } from "@/lib/errors";
import { blogApi } from "./blogApi";
import { aEntradaInput, aFormulario, campoFormulario, ENTRADA_VACIA, entradaSchema, pendientes } from "./schemas";
import type { Entrada } from "./types";

const entrada: Entrada = {
  id: "1",
  titulo: "Lancé mi app",
  slug: "lance-mi-app",
  resumen: "Resumen",
  contenido: "Párrafo uno.\n\nPárrafo dos.",
  portada: { url: "https://res.cloudinary.com/x/portada.webp", alt: "Portada" },
  galeria: [{ url: null, alt: "Foto" }],
  documentos: [{ url: null, titulo: "Manual" }],
  etiquetas: ["node", "react"],
  estado: "publicado",
  publicadoEn: "2026-10-30T12:00:00.000Z",
  createdAt: "2026-10-30T12:00:00.000Z",
  updatedAt: "2026-10-30T12:00:00.000Z",
};

const paginacion = { page: 1, limit: 100, total: 1, paginas: 1 };
const valido = { ...ENTRADA_VACIA, titulo: "T", resumen: "R", contenido: "C" };

function mockFetch(handler: (req: Request) => { status: number; body: unknown }) {
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

describe("formulario del blog", () => {
  it("una entrada ida y vuelta por el formulario no pierde datos", () => {
    const { id: _id, publicadoEn: _p, createdAt: _c, updatedAt: _u, ...original } = entrada;
    expect(aEntradaInput(entradaSchema.parse(aFormulario(entrada)))).toEqual(original);
  });

  it("lo vacío viaja como null y el slug vacío no se manda", () => {
    const input = aEntradaInput(entradaSchema.parse(valido));
    expect(input.slug).toBeUndefined();
    expect(input.portada).toBeNull();
    expect(input.estado).toBe("borrador");
  });

  it("las etiquetas se separan por línea, sin vacíos", () => {
    const input = aEntradaInput(entradaSchema.parse({ ...valido, etiquetas: " node \n\nreact\n" }));
    expect(input.etiquetas).toEqual(["node", "react"]);
  });

  it("rechaza lo mismo que el backend", () => {
    const mensaje = (datos: object) => entradaSchema.safeParse({ ...valido, ...datos }).error?.issues[0]?.message;
    expect(mensaje({ titulo: "" })).toBe("Este campo es obligatorio");
    expect(mensaje({ resumen: "x".repeat(201) })).toBe("Máximo 200 caracteres");
    expect(mensaje({ contenido: "x".repeat(20001) })).toBe("Máximo 20000 caracteres");
    expect(mensaje({ slug: "admin" })).toBe('El slug "admin" está reservado');
    expect(mensaje({ etiquetas: Array(11).fill("x").join("\n") })).toBe("Máximo 10 elementos");
    expect(mensaje({ etiquetas: "x".repeat(31) })).toBe("Cada línea admite hasta 30 caracteres");
    expect(mensaje({ galeria: Array(21).fill({ url: "", alt: "a" }) })).toBe("Máximo 20 imágenes en la galería");
    expect(mensaje({ documentos: Array(11).fill({ url: "", titulo: "a" }) })).toBe("Máximo 10 documentos");
  });

  it("una portada con imagen necesita descripción", () => {
    const resultado = entradaSchema.safeParse({ ...valido, portadaUrl: "https://x.com/a.webp" });
    expect(resultado.error?.issues[0]?.path).toEqual(["portadaAlt"]);
  });

  it("pendientes lista lo que le falta a la entrada", () => {
    expect(pendientes(entrada)).toEqual(["Imágenes sin subir", "Documentos sin subir"]);
    expect(pendientes({ ...entrada, portada: null, galeria: [], documentos: [] })).toEqual(["Sin portada"]);
  });

  it("traduce los nombres de la API a los del formulario", () => {
    expect(campoFormulario("titulo")).toBe("titulo");
    expect(campoFormulario("portada.alt")).toBe("portadaAlt");
    expect(campoFormulario("etiquetas.3")).toBe("etiquetas");
    expect(campoFormulario("galeria.1.alt")).toBe("galeria.1.alt");
    expect(campoFormulario("documentos")).toBe("documentos.root");
    expect(campoFormulario("publicadoEn")).toBeNull();
  });
});

describe("servicio del blog (RTK Query)", () => {
  it("la lectura pública no manda token", async () => {
    const fetchMock = mockFetch(() => ({ status: 200, body: { ok: true, data: { entradas: [entrada], paginacion } } }));

    const { data } = await makeStore().dispatch(blogApi.endpoints.getEntradas.initiate());

    const req = fetchMock.mock.calls[0]![0];
    expect(req.url).toContain("/blog?limit=100");
    expect(req.headers.get("authorization")).toBeNull();
    expect(data).toEqual([entrada]);
  });

  it("trae todas las páginas", async () => {
    mockFetch((req) => {
      const page = Number(new URL(req.url).searchParams.get("page") ?? 1);
      const data = { entradas: [{ ...entrada, id: String(page) }], paginacion: { ...paginacion, page, paginas: 2 } };
      return { status: 200, body: { ok: true, data } };
    });

    const { data } = await makeStore().dispatch(blogApi.endpoints.getEntradas.initiate());

    expect(data?.map((e) => e.id)).toEqual(["1", "2"]);
  });

  it("escapa el slug al pedir una entrada", async () => {
    const fetchMock = mockFetch(() => ({ status: 200, body: { ok: true, data: { entrada } } }));

    await makeStore().dispatch(blogApi.endpoints.getEntrada.initiate("a/b"));

    expect(fetchMock.mock.calls[0]![0].url).toContain("/blog/a%2Fb");
  });

  it("el panel lleva el token y puede filtrar por estado", async () => {
    const fetchMock = mockFetch(() => ({ status: 200, body: { ok: true, data: { entradas: [], paginacion } } }));

    await storeConSesion().dispatch(blogApi.endpoints.getEntradasAdmin.initiate({ estado: "borrador" }));

    const req = fetchMock.mock.calls[0]![0];
    expect(req.url).toContain("/blog/admin?limit=100&estado=borrador");
    expect(req.headers.get("authorization")).toBe("Bearer tok123");
  });

  it("guardar vuelve a pedir la lista sola", async () => {
    const fetchMock = mockFetch((req) =>
      req.method === "PATCH"
        ? { status: 200, body: { ok: true, data: { entrada } } }
        : { status: 200, body: { ok: true, data: { entradas: [entrada], paginacion } } },
    );
    const store = storeConSesion();

    const suscripcion = store.dispatch(blogApi.endpoints.getEntradasAdmin.initiate());
    await suscripcion;
    await store.dispatch(blogApi.endpoints.actualizarEntrada.initiate({ id: "1", cambios: { estado: "borrador" } }));
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3)); // lista, PATCH y lista otra vez

    suscripcion.unsubscribe();
  });

  it("expone el 403 de un usuario que no es administrador", async () => {
    mockFetch(() => ({ status: 403, body: { ok: false, message: "Solo el administrador puede hacer esto" } }));

    const { error } = await storeConSesion().dispatch(blogApi.endpoints.crearEntrada.initiate({ titulo: "T", resumen: "R", contenido: "C" }));

    expect(getErrorMessage(error)).toBe("Solo el administrador puede hacer esto");
  });
});
