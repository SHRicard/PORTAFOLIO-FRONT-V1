// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/app/store";
import { sessionStarted } from "@/features/auth/authActions";
import { estudiosApi } from "./estudiosApi";
import { aEstudioInput, aFormulario, ESTUDIO_VACIO, estudioSchema, queFalta } from "./schemas";
import type { Estudio } from "./types";

const estudio: Estudio = {
  id: "1",
  tipo: "carrera",
  institucion: "Universidad Ejemplo",
  titulo: "Ingeniería",
  desde: "2020-03",
  hasta: "2021-03",
  finalizado: false,
  descripcion: "",
  urlVerificacion: null,
  certificado: { url: "https://res.cloudinary.com/x/cert.pdf" },
  publicado: true,
  createdAt: "2026-10-30T12:00:00.000Z",
  updatedAt: "2026-10-30T12:00:00.000Z",
};

const valido = { ...ESTUDIO_VACIO, institucion: "I", titulo: "T", desde: "2022-01" };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("formulario de estudios", () => {
  it("un estudio ida y vuelta por el formulario no pierde datos", () => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...original } = estudio;
    expect(aEstudioInput(estudioSchema.parse(aFormulario(estudio)))).toEqual(original);
  });

  it("un certificado pendiente sigue pendiente al guardar sin cambios", () => {
    const pendiente: Estudio = { ...estudio, certificado: { url: null } };
    expect(aEstudioInput(estudioSchema.parse(aFormulario(pendiente))).certificado).toEqual({ url: null });
  });

  it("quitar un certificado ya subido lo saca del estudio", () => {
    const valores = { ...aFormulario(estudio), certificadoUrl: "" };
    expect(aEstudioInput(estudioSchema.parse(valores)).certificado).toBeNull();
  });

  it("lo vacío viaja como null", () => {
    const input = aEstudioInput(estudioSchema.parse(valido));
    expect(input).toMatchObject({ hasta: null, urlVerificacion: null, certificado: null });
  });

  it("un estudio finalizado necesita fecha de fin", () => {
    const resultado = estudioSchema.safeParse({ ...valido, finalizado: true });
    expect(resultado.error?.issues[0]?.path).toEqual(["hasta"]);
    expect(resultado.error?.issues[0]?.message).toBe("Un estudio finalizado necesita fecha de fin");
  });

  it("la fecha de fin no puede ser anterior a la de inicio", () => {
    expect(estudioSchema.safeParse({ ...valido, hasta: "2021-01" }).success).toBe(false);
  });

  it("acepta un certificado elegido que todavía no se subió (URL local)", () => {
    expect(estudioSchema.safeParse({ ...valido, certificadoUrl: "blob:http://localhost/1" }).success).toBe(true);
    expect(estudioSchema.safeParse({ ...valido, certificadoUrl: "http://x.com/c.pdf" }).success).toBe(false);
  });
});

describe("lo que le falta a un estudio", () => {
  it("la descripción y el certificado sin subir; sin certificado no falta nada", () => {
    expect(queFalta(estudio)).toBe("Falta la descripción");
    expect(queFalta({ descripcion: "D", certificado: { url: null } })).toBe("Falta subir el certificado");
    expect(queFalta({ descripcion: " ", certificado: { url: null } })).toBe(
      "Falta la descripción y subir el certificado",
    );
    expect(queFalta({ descripcion: "D", certificado: null })).toBeNull();
    expect(queFalta({ descripcion: "D", certificado: { url: "https://res.cloudinary.com/x/c.pdf" } })).toBeNull();
  });
});

describe("servicio de estudios (RTK Query)", () => {
  it("crear manda POST con token y devuelve el estudio", async () => {
    const fetchMock = vi.fn(
      async (_req: Request) =>
        new Response(JSON.stringify({ ok: true, data: { estudio } }), {
          status: 201,
          headers: { "content-type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const store = makeStore();
    store.dispatch(sessionStarted("tok123"));

    const { data } = await store.dispatch(
      estudiosApi.endpoints.crearEstudio.initiate(aEstudioInput(estudioSchema.parse(valido))),
    );

    const req = fetchMock.mock.calls[0]![0];
    expect(req.method).toBe("POST");
    expect(req.headers.get("authorization")).toBe("Bearer tok123");
    expect(data).toEqual(estudio);
  });
});
