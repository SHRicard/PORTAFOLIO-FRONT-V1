// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/app/store";
import { getErrorMessage } from "@/lib/errors";
import { agruparPor, estadoEstudio, mensajeErrorProyecto, mes, parrafos, rango } from "./formato";
import { portafolioApi } from "./portafolioApi";
import type { Estudio, Experiencia, Perfil, Proyecto } from "./types";

const fechas = { createdAt: "2026-10-30T12:00:00.000Z", updatedAt: "2026-10-30T12:00:00.000Z" };

const perfil: Perfil = {
  id: "1",
  nombreVisible: "Ana Pérez",
  rol: "Desarrolladora",
  frase: "Hago cosas",
  ubicacion: { ciudad: "Córdoba", pais: "Argentina" },
  modalidad: "remoto",
  disponibilidad: { disponible: true, texto: "" },
  bioCorta: "Corta",
  bioLarga: "Uno\n\nDos",
  contacto: {
    correo: "ana@mail.com",
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
  ...fechas,
  vista: null,
};

const proyecto: Proyecto = {
  id: "p1",
  titulo: "Facturación",
  slug: "facturacion-fct",
  tipo: "empresa",
  rol: "Full stack",
  fecha: "2024-07",
  resumen: "Resumen",
  descripcion: "Descripción",
  tecnologias: ["React"],
  repositorios: [],
  galeria: [],
  documentos: [],
  destacado: true,
  estado: "publicado",
  orden: 1,
  ...fechas,
};

const trabajo: Experiencia = {
  id: "e1",
  empresa: "Acme",
  puesto: "Dev",
  desde: "2022-11",
  hasta: null,
  ubicacion: "",
  modalidad: "hibrido",
  descripcion: "",
  logros: [],
  tecnologias: [],
  publicado: true,
  ...fechas,
};

const estudio: Estudio = {
  id: "s1",
  tipo: "carrera",
  institucion: "UNC",
  titulo: "Ingeniería",
  desde: "2018-03",
  hasta: null,
  finalizado: false,
  descripcion: "",
  urlVerificacion: null,
  certificado: null,
  publicado: true,
  ...fechas,
};

const paginacion = { page: 1, limit: 100, total: 1, paginas: 1 };

type Reply = { status: number; body: unknown };

/** Reemplaza fetch: recibe el Request que arma RTK Query y responde lo que indique el test */
function mockFetch(handler: (req: Request) => Reply) {
  const fn = vi.fn(async (req: Request) => {
    const { status, body } = handler(req);
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

/** La ruta pedida sin la base (/api), con su query */
function rutaDe(fn: ReturnType<typeof mockFetch>) {
  const { pathname, search } = new URL((fn.mock.calls[0]?.[0] as Request).url);
  return `${pathname.replace(/^\/api/, "")}${search}`;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("lectura pública del portafolio (RTK Query)", () => {
  it("getPerfil devuelve el perfil directo, sin { ok, data } y sin token", async () => {
    const fetchMock = mockFetch(() => ({ status: 200, body: { ok: true, data: { perfil } } }));
    const result = await makeStore().dispatch(portafolioApi.endpoints.getPerfil.initiate());

    expect(result.data).toEqual(perfil);
    expect(rutaDe(fetchMock)).toBe("/perfil");
    expect((fetchMock.mock.calls[0]?.[0] as Request).headers.get("authorization")).toBeNull();
  });

  it("getPerfil expone el 404 de cuando el perfil todavía no se cargó", async () => {
    mockFetch(() => ({ status: 404, body: { ok: false, message: "El perfil todavía no está cargado" } }));
    const result = await makeStore().dispatch(portafolioApi.endpoints.getPerfil.initiate());

    expect(getErrorMessage(result.error)).toBe("El perfil todavía no está cargado");
  });

  it("getProyectos pide el máximo y no filtra si no se le indica", async () => {
    const fetchMock = mockFetch(() => ({ status: 200, body: { ok: true, data: { proyectos: [proyecto], paginacion } } }));
    const result = await makeStore().dispatch(portafolioApi.endpoints.getProyectos.initiate());

    expect(result.data).toEqual([proyecto]);
    expect(rutaDe(fetchMock)).toBe("/proyectos?limit=100");
  });

  it("getProyectos filtra por destacados", async () => {
    const fetchMock = mockFetch(() => ({ status: 200, body: { ok: true, data: { proyectos: [proyecto], paginacion } } }));
    await makeStore().dispatch(portafolioApi.endpoints.getProyectos.initiate({ destacado: true }));

    expect(rutaDe(fetchMock)).toBe("/proyectos?limit=100&destacado=true");
  });

  it("getProyecto busca por slug escapado", async () => {
    const fetchMock = mockFetch(() => ({ status: 200, body: { ok: true, data: { proyecto } } }));
    const result = await makeStore().dispatch(portafolioApi.endpoints.getProyecto.initiate("a/b c"));

    expect(result.data).toEqual(proyecto);
    expect(rutaDe(fetchMock)).toBe("/proyectos/a%2Fb%20c");
  });

  it("getExperiencia y getEstudios piden el máximo y devuelven la lista", async () => {
    const fetchMock = mockFetch((req) =>
      req.url.includes("/experiencia")
        ? { status: 200, body: { ok: true, data: { experiencia: [trabajo], paginacion } } }
        : { status: 200, body: { ok: true, data: { estudios: [estudio], paginacion } } },
    );
    const store = makeStore();

    expect((await store.dispatch(portafolioApi.endpoints.getExperiencia.initiate())).data).toEqual([trabajo]);
    expect((await store.dispatch(portafolioApi.endpoints.getEstudios.initiate())).data).toEqual([estudio]);

    const urls = fetchMock.mock.calls.map(([req]) => (req as Request).url);
    expect(urls[0]).toContain("/experiencia?limit=100");
    expect(urls[1]).toContain("/estudios?limit=100");
  });

  it("avisa cuando no hay conexión con el servidor", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    const result = await makeStore().dispatch(portafolioApi.endpoints.getPerfil.initiate());

    expect(getErrorMessage(result.error)).toBe("No se pudo conectar con el servidor");
  });
});

describe("mensajeErrorProyecto", () => {
  it("traduce el 404 y deja pasar el resto de los errores", async () => {
    mockFetch(() => ({ status: 404, body: { ok: false, message: "Proyecto no encontrado" } }));
    const noExiste = await makeStore().dispatch(portafolioApi.endpoints.getProyecto.initiate("nada"));
    expect(mensajeErrorProyecto(noExiste.error)).toBe("Este proyecto no existe o no está publicado.");

    mockFetch(() => ({ status: 500, body: { ok: false, message: "Error interno del servidor" } }));
    const fallo = await makeStore().dispatch(portafolioApi.endpoints.getProyecto.initiate("nada"));
    expect(mensajeErrorProyecto(fallo.error)).toBe("Error interno del servidor");
  });
});

describe("formato", () => {
  it("mes y rango leen fechas AAAA-MM", () => {
    expect(mes("2022-11")).toBe("nov. 2022");
    expect(rango("2022-11", null)).toBe("nov. 2022 – actualidad");
    expect(rango("2020-03", "2021-03")).toBe("mar. 2020 – mar. 2021");
    expect(rango("2018-03", null, "en curso")).toBe("mar. 2018 – en curso");
  });

  it("estadoEstudio distingue en curso, finalizado e incompleto", () => {
    expect(estadoEstudio(estudio)).toBe("En curso");
    expect(estadoEstudio({ ...estudio, hasta: "2023-12", finalizado: true })).toBe("Finalizado");
    expect(estadoEstudio({ ...estudio, hasta: "2023-12", finalizado: false })).toBe("Incompleto");
  });

  it("parrafos separa por línea en blanco y descarta los vacíos", () => {
    expect(parrafos("Uno\n\n  Dos  \n \n\nTres")).toEqual(["Uno", "Dos", "Tres"]);
    expect(parrafos("")).toEqual([]);
  });

  it("agruparPor respeta el orden en que vienen", () => {
    const items = [
      { n: "React", c: "front" },
      { n: "Node", c: "back" },
      { n: "CSS", c: "front" },
    ];
    expect(agruparPor(items, (i) => i.c)).toEqual([
      ["front", [items[0], items[2]]],
      ["back", [items[1]]],
    ]);
  });
});
