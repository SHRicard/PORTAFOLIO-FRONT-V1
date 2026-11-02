// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/app/store";
import { sessionStarted } from "@/features/auth/authActions";
import { perfilApi } from "./perfilApi";
import { aFormulario, aPerfilInput, campoFormulario, PERFIL_VACIO, perfilSchema } from "./schemas";
import type { Perfil } from "./types";

const perfil: Perfil = {
  id: "1",
  nombreVisible: "Persona Ejemplo",
  rol: "Desarrollador",
  frase: "Una frase.",
  ubicacion: { ciudad: "Buenos Aires", pais: "Argentina" },
  modalidad: "remoto",
  disponibilidad: { disponible: true, texto: "Abierto a ofertas" },
  bioCorta: "Bio corta",
  bioLarga: "Párrafo uno.\n\nPárrafo dos.",
  correoContacto: "contacto@mail.com",
  redes: [{ tipo: "github", url: "https://github.com/ejemplo" }],
  habilidades: [{ nombre: "React", categoria: "front" }],
  idiomas: [{ idioma: "Español", nivel: "nativo" }],
  datosCuriosos: [{ titulo: "Mate por día", valor: "1 termo", tipo: "personal" }],
  foto: { url: null, alt: "Foto de perfil" },
  cv: { url: "https://res.cloudinary.com/x/cv.pdf" },
  createdAt: "2026-10-30T12:00:00.000Z",
  updatedAt: "2026-10-30T12:00:00.000Z",
};

const valido = {
  ...PERFIL_VACIO,
  nombreVisible: "N",
  rol: "R",
  frase: "F",
  ciudad: "C",
  pais: "P",
  bioCorta: "B",
  bioLarga: "L",
  correoContacto: "a@b.com",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("formulario de datos públicos", () => {
  it("el perfil ida y vuelta por el formulario no pierde datos", () => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...original } = perfil;
    expect(aPerfilInput(perfilSchema.parse(aFormulario(perfil)))).toEqual(original);
  });

  it("un CV pendiente sigue pendiente al guardar sin cambios", () => {
    const pendiente: Perfil = { ...perfil, cv: { url: null } };
    expect(aPerfilInput(perfilSchema.parse(aFormulario(pendiente))).cv).toEqual({ url: null });
  });

  it("quitar un CV ya subido lo saca del perfil", () => {
    const valores = { ...aFormulario(perfil), cvUrl: "" };
    expect(aPerfilInput(perfilSchema.parse(valores)).cv).toBeNull();
  });

  it("traduce los nombres de la API a los del formulario", () => {
    expect(campoFormulario("rol")).toBe("rol");
    expect(campoFormulario("ubicacion.ciudad")).toBe("ciudad");
    expect(campoFormulario("disponibilidad.texto")).toBe("disponibilidadTexto");
    expect(campoFormulario("foto.alt")).toBe("fotoAlt");
    expect(campoFormulario("redes.1.url")).toBe("redes.1.url");
    expect(campoFormulario("habilidades")).toBe("habilidades.root");
    expect(campoFormulario("disponibilidad.disponible")).toBeNull();
  });

  it("sin foto ni CV viajan como null", () => {
    expect(aPerfilInput(perfilSchema.parse(valido))).toMatchObject({ foto: null, cv: null });
  });

  it("rechaza lo mismo que el backend", () => {
    const mensaje = (datos: object) => perfilSchema.safeParse({ ...valido, ...datos }).error?.issues[0]?.message;
    expect(mensaje({ frase: "x".repeat(101) })).toBe("Máximo 100 caracteres");
    expect(mensaje({ correoContacto: "no-es-correo" })).toBe("Correo electrónico inválido");
    expect(mensaje({ redes: [{ tipo: "github", url: "http://x.com" }] })).toBe("La URL tiene que empezar con https://");
  });

  it("una foto necesita descripción", () => {
    const resultado = perfilSchema.safeParse({ ...valido, fotoUrl: "https://x.com/a.webp" });
    expect(resultado.error?.issues[0]?.path).toEqual(["fotoAlt"]);
  });
});

describe("servicio de perfil (RTK Query)", () => {
  it("guardar usa PUT con el perfil completo y token", async () => {
    const fetchMock = vi.fn(
      async (_req: Request) =>
        new Response(JSON.stringify({ ok: true, data: { perfil } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const store = makeStore();
    store.dispatch(sessionStarted("tok123"));

    const { data } = await store.dispatch(perfilApi.endpoints.guardarPerfil.initiate(aPerfilInput(aFormulario(perfil))));

    const req = fetchMock.mock.calls[0]![0];
    expect(req.method).toBe("PUT");
    expect(req.url).toContain("/perfil");
    expect(req.headers.get("authorization")).toBe("Bearer tok123");
    expect(data).toEqual(perfil);
  });

  it("el panel distingue el 404 de un perfil que todavía no se cargó", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ ok: false, message: "El perfil todavía no está cargado" }), {
            status: 404,
            headers: { "content-type": "application/json" },
          }),
      ),
    );
    const store = makeStore();
    store.dispatch(sessionStarted("tok123"));

    const { error } = await store.dispatch(perfilApi.endpoints.getPerfilAdmin.initiate());

    expect(error).toMatchObject({ status: 404 });
  });
});
