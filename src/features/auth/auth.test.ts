// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/app/store";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import { authApi } from "./authApi";
import { sessionEnded } from "./authActions";
import type { User } from "./types";

const user: User = {
  id: "1",
  nombre: "Ana",
  apellido: "Pérez",
  telefono: "+54 11 5555-1234",
  pais: "Argentina",
  correo: "ana@mail.com",
  sexo: "femenino",
  createdAt: "2026-10-27T15:00:00.000Z",
  updatedAt: "2026-10-27T15:00:00.000Z",
};

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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("servicio de login (RTK Query)", () => {
  it("login guarda el token y las peticiones siguientes lo envían solas", async () => {
    const fetchMock = mockFetch((req) => {
      if (req.url.endsWith("/users/login")) return { status: 200, body: { ok: true, data: { token: "tok123", user } } };
      if (req.url.endsWith("/users/me")) {
        return req.headers.get("authorization") === "Bearer tok123"
          ? { status: 200, body: { ok: true, data: { user } } }
          : { status: 401, body: { ok: false, message: "Falta el token de autenticación" } };
      }
      return { status: 404, body: { ok: false, message: "no" } };
    });

    const store = makeStore();
    const result = await store.dispatch(authApi.endpoints.login.initiate({ correo: "ana@mail.com", password: "x" }));

    expect(result.data?.user.nombre).toBe("Ana");
    expect(store.getState().auth.token).toBe("tok123");

    const me = await store.dispatch(authApi.endpoints.getMe.initiate());
    expect(me.data).toEqual(user); // transformResponse devuelve el usuario directo, sin { ok, data }
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("login con credenciales malas deja la sesión vacía y expone el mensaje del backend", async () => {
    mockFetch(() => ({ status: 401, body: { ok: false, message: "Correo o contraseña incorrectos" } }));

    const store = makeStore();
    const result = await store.dispatch(authApi.endpoints.login.initiate({ correo: "ana@mail.com", password: "mal" }));

    expect(store.getState().auth.token).toBeNull();
    expect(result.error).toBeDefined();
    expect(getErrorMessage(result.error)).toBe("Correo o contraseña incorrectos");
  });

  it("si el backend responde 401 con una sesión activa, la sesión se cierra sola", async () => {
    mockFetch((req) =>
      req.url.endsWith("/users/login")
        ? { status: 200, body: { ok: true, data: { token: "viejo", user } } }
        : { status: 401, body: { ok: false, message: "Token inválido o expirado" } },
    );

    const store = makeStore();
    await store.dispatch(authApi.endpoints.login.initiate({ correo: "ana@mail.com", password: "x" }));
    expect(store.getState().auth.token).toBe("viejo");

    await store.dispatch(authApi.endpoints.getMe.initiate());
    expect(store.getState().auth.token).toBeNull();
  });

  it("sessionEnded (logout) limpia el token", async () => {
    mockFetch(() => ({ status: 200, body: { ok: true, data: { token: "t", user } } }));
    const store = makeStore();
    await store.dispatch(authApi.endpoints.login.initiate({ correo: "ana@mail.com", password: "x" }));
    store.dispatch(sessionEnded());
    expect(store.getState().auth.token).toBeNull();
  });
});

describe("manejo de errores", () => {
  it("mapea errores de validación (400) a campos", async () => {
    mockFetch(() => ({
      status: 400,
      body: {
        ok: false,
        message: "Datos inválidos",
        details: [
          { campo: "correo", mensaje: "Correo electrónico inválido" },
          { campo: "password", mensaje: "La contraseña debe tener al menos 8 caracteres" },
        ],
      },
    }));
    const store = makeStore();
    const result = await store.dispatch(authApi.endpoints.login.initiate({ correo: "x", password: "y" }));

    expect(getErrorMessage(result.error)).toBe("Datos inválidos");
    expect(getFieldErrors(result.error)).toEqual({
      correo: "Correo electrónico inválido",
      password: "La contraseña debe tener al menos 8 caracteres",
    });
  });

  it("avisa cuando no hay conexión con el servidor", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    const store = makeStore();
    const result = await store.dispatch(authApi.endpoints.login.initiate({ correo: "a@b.com", password: "y" }));
    expect(getErrorMessage(result.error)).toBe("No se pudo conectar con el servidor");
  });
});
