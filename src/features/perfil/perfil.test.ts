// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/app/store";
import { sessionStarted } from "@/features/auth/authActions";
import { portafolioApi } from "@/features/portafolio/portafolioApi";
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
  contacto: {
    correo: "contacto@mail.com",
    telefono: { numero: "+54 9 11 5555-1234", whatsapp: true },
    redes: [{ tipo: "github", url: "https://github.com/ejemplo" }],
    mensaje: "Estoy escuchando ideas.",
    abiertoA: ["Proyectos freelance", "Hackatones y desafíos"],
    tiempoRespuesta: "Respondo en menos de 24 h",
    horario: "Lun a vie, 9 a 18 h (GMT-3)",
    agenda: "https://cal.com/ejemplo/30min",
  },
  habilidades: [{ nombre: "React", categoria: "front" }],
  idiomas: [{ idioma: "Español", nivel: "nativo" }],
  datosCuriosos: [{ titulo: "Mate por día", valor: "1 termo", tipo: "personal" }],
  foto: { url: null, alt: "Foto de perfil" },
  cv: { url: "https://res.cloudinary.com/x/cv.pdf" },
  vista: "rr-dev",
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
  correo: "a@b.com",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("formulario de datos públicos", () => {
  it("el perfil ida y vuelta por el formulario no pierde datos", () => {
    // La vista no pasa por el formulario: se elige aparte
    const { id: _id, createdAt: _c, updatedAt: _u, vista: _v, ...original } = perfil;
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
    expect(campoFormulario("contacto.redes.1.url")).toBe("redes.1.url");
    expect(campoFormulario("contacto.redes")).toBe("redes.root");
    expect(campoFormulario("contacto.correo")).toBe("correo");
    expect(campoFormulario("contacto.telefono.numero")).toBe("telefono");
    expect(campoFormulario("contacto.abiertoA.2")).toBe("abiertoA");
    expect(campoFormulario("contacto.telefono.whatsapp")).toBeNull();
    expect(campoFormulario("habilidades")).toBe("habilidades.root");
    expect(campoFormulario("disponibilidad.disponible")).toBeNull();
  });

  it("la foto y el CV aceptan un archivo elegido que todavía no se subió (URL local)", () => {
    const local = { ...valido, fotoUrl: "blob:http://localhost/1", fotoAlt: "Yo", cvUrl: "blob:http://localhost/2" };
    expect(perfilSchema.safeParse(local).success).toBe(true);
    expect(perfilSchema.safeParse({ ...valido, cvUrl: "http://x.com/cv.pdf" }).success).toBe(false);
  });

  it("sin foto ni CV viajan como null", () => {
    expect(aPerfilInput(perfilSchema.parse(valido))).toMatchObject({ foto: null, cv: null });
  });

  it("rechaza lo mismo que el backend", () => {
    const mensaje = (datos: object) => perfilSchema.safeParse({ ...valido, ...datos }).error?.issues[0]?.message;
    expect(mensaje({ frase: "x".repeat(101) })).toBe("Máximo 100 caracteres");
    expect(mensaje({ correo: "no-es-correo" })).toBe("Correo electrónico inválido");
    expect(mensaje({ telefono: "11 5555-1234" })).toBe(
      "Teléfono inválido: usá el formato internacional, por ejemplo +54 9 11 5555-1234",
    );
    expect(mensaje({ abiertoA: "a\nb\nc\nd\ne\nf\ng\nh\ni\nj\nk" })).toBe("Máximo 10 elementos");
    expect(mensaje({ agenda: "http://cal.com/x" })).toBe("La URL tiene que empezar con https://");
    expect(mensaje({ redes: [{ tipo: "github", url: "http://x.com" }] })).toBe("La URL tiene que empezar con https://");
  });

  it("sin teléfono viaja null y no se puede marcar WhatsApp", () => {
    expect(aPerfilInput(perfilSchema.parse(valido)).contacto.telefono).toBeNull();
    const resultado = perfilSchema.safeParse({ ...valido, whatsapp: true });
    expect(resultado.error?.issues[0]).toMatchObject({ path: ["telefono"], message: "Cargá el número para marcar WhatsApp" });
  });

  it("«Abierto a» se escribe uno por línea y viaja como lista, sin líneas vacías", () => {
    const valores = perfilSchema.parse({ ...valido, abiertoA: " Freelance \n\nHackatones " });
    expect(aPerfilInput(valores).contacto.abiertoA).toEqual(["Freelance", "Hackatones"]);
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
    // Sin vista en el PUT, el backend conserva la elegida
    expect(Object.keys(await req.json())).not.toContain("vista");
  });

  it("elegir la vista manda solo { vista } por PATCH, y el perfil público la muestra sin volver a pedirlo", async () => {
    const pedidos: { metodo: string; cuerpo: unknown }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (req: Request) => {
        pedidos.push({ metodo: req.method, cuerpo: req.method === "GET" ? null : await req.json() });
        const vista = req.method === "PATCH" ? "basica" : null;
        return new Response(JSON.stringify({ ok: true, data: { perfil: { ...perfil, vista } } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }),
    );
    const store = makeStore();
    store.dispatch(sessionStarted("tok123"));
    await store.dispatch(portafolioApi.endpoints.getPerfil.initiate());

    const { data } = await store.dispatch(perfilApi.endpoints.elegirVista.initiate("basica"));

    expect(data?.vista).toBe("basica");
    expect(pedidos.find(({ metodo }) => metodo === "PATCH")?.cuerpo).toEqual({ vista: "basica" });
    expect(portafolioApi.endpoints.getPerfil.select()(store.getState()).data?.vista).toBe("basica");
  });

  it("volver a la vista por defecto manda null", async () => {
    const fetchMock = vi.fn(
      async (_req: Request) =>
        new Response(JSON.stringify({ ok: true, data: { perfil: { ...perfil, vista: null } } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const store = makeStore();
    store.dispatch(sessionStarted("tok123"));

    await store.dispatch(perfilApi.endpoints.elegirVista.initiate(null));

    expect(await fetchMock.mock.calls[0]![0].json()).toEqual({ vista: null });
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
