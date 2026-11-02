// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/app/store";
import { sessionStarted } from "@/features/auth/authActions";
import { experienciaApi } from "./experienciaApi";
import { aExperienciaInput, aFormulario, EXPERIENCIA_VACIA, experienciaSchema } from "./schemas";
import type { Experiencia } from "./types";

const experiencia: Experiencia = {
  id: "1",
  empresa: "Empresa Ejemplo SA",
  puesto: "Desarrollador",
  desde: "2022-11",
  hasta: null,
  ubicacion: "Buenos Aires, Argentina",
  modalidad: "remoto",
  descripcion: "Párrafo uno.\n\nPárrafo dos.",
  logros: ["Logro uno", "Logro dos"],
  tecnologias: ["React"],
  publicado: false,
  createdAt: "2026-10-30T12:00:00.000Z",
  updatedAt: "2026-10-30T12:00:00.000Z",
};

const valido = { ...EXPERIENCIA_VACIA, empresa: "E", puesto: "P", desde: "2022-01" };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("formulario de experiencia", () => {
  it("un trabajo ida y vuelta por el formulario no pierde datos", () => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...original } = experiencia;
    expect(aExperienciaInput(experienciaSchema.parse(aFormulario(experiencia)))).toEqual(original);
  });

  it("hasta vacío significa trabajo actual", () => {
    expect(aExperienciaInput(experienciaSchema.parse(valido)).hasta).toBeNull();
  });

  it("la fecha de fin no puede ser anterior a la de inicio", () => {
    const resultado = experienciaSchema.safeParse({ ...valido, hasta: "2021-12" });
    expect(resultado.error?.issues[0]?.path).toEqual(["hasta"]);
    expect(resultado.error?.issues[0]?.message).toBe("La fecha de fin no puede ser anterior a la de inicio");
  });

  it("controla la cantidad y el largo de las listas", () => {
    const mensaje = (datos: object) => experienciaSchema.safeParse({ ...valido, ...datos }).error?.issues[0]?.message;
    expect(mensaje({ logros: Array(21).fill("x").join("\n") })).toBe("Máximo 20 elementos");
    expect(mensaje({ logros: "x".repeat(401) })).toBe("Cada línea admite hasta 400 caracteres");
  });
});

describe("servicio de experiencia (RTK Query)", () => {
  it("el panel lee con token y ve también lo oculto", async () => {
    const fetchMock = vi.fn(
      async (_req: Request) =>
        new Response(JSON.stringify({ ok: true, data: { experiencia: [experiencia], paginacion: { page: 1, limit: 100, total: 1, paginas: 1 } } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const store = makeStore();
    store.dispatch(sessionStarted("tok123"));

    const { data } = await store.dispatch(experienciaApi.endpoints.getExperienciaAdmin.initiate());

    const req = fetchMock.mock.calls[0]![0];
    expect(req.url).toContain("/experiencia/admin?limit=100");
    expect(req.headers.get("authorization")).toBe("Bearer tok123");
    expect(data?.[0]?.publicado).toBe(false);
  });
});
