import { describe, expect, it, vi } from "vitest";
import { applyServerFieldErrors } from "./forms";
import { todasLasPaginas } from "./paginacion";
import { safeRedirectPath } from "./redirect";
import { carpetaDe } from "./validaciones";
import { loginSchema, registerSchema } from "@/features/auth/schemas";

describe("carpetaDe", () => {
  it("sale del slug o, si no hay, del título con el mismo criterio que el backend", () => {
    expect(carpetaDe("proyectos", "mi-slug", "Otro título")).toBe("proyectos/mi-slug");
    expect(carpetaDe("blogs", "", "Lancé mi app:  ¡Facturación!")).toBe("blogs/lance-mi-app-facturacion");
    expect(carpetaDe("proyectos", "Con Espacios", "")).toBe("proyectos/con-espacios");
  });

  it("sin nada escrito usa la carpeta general", () => {
    expect(carpetaDe("blogs", "", "")).toBe("blogs");
    expect(carpetaDe("blogs", "", "¿?")).toBe("blogs");
  });
});

describe("applyServerFieldErrors", () => {
  const rechazo = (...campos: string[]) => ({
    data: { ok: false, message: "Datos inválidos", details: campos.map((campo) => ({ campo, mensaje: `Mal ${campo}` })) },
  });

  it("marca los campos de la lista", () => {
    const setError = vi.fn();
    expect(applyServerFieldErrors(rechazo("correo"), setError, ["correo", "password"])).toBe(true);
    expect(setError).toHaveBeenCalledWith("correo", { type: "server", message: "Mal correo" });
  });

  it("traduce los nombres con una función", () => {
    const setError = vi.fn();
    const traducir = (campo: string) => (campo === "portada.alt" ? "portadaAlt" : null);
    expect(applyServerFieldErrors(rechazo("portada.alt"), setError, traducir)).toBe(true);
    expect(setError).toHaveBeenCalledWith("portadaAlt", { type: "server", message: "Mal portada.alt" });
  });

  it("si un error no tiene campo devuelve false, para mostrarlo en general", () => {
    const setError = vi.fn();
    expect(applyServerFieldErrors(rechazo("correo", "otro"), setError, ["correo"])).toBe(false);
    expect(setError).toHaveBeenCalledTimes(1);
  });

  it("sin detalle por campo devuelve false", () => {
    expect(applyServerFieldErrors({ data: { ok: false, message: "Ya existe" } }, vi.fn(), ["correo"])).toBe(false);
  });
});

describe("todasLasPaginas", () => {
  const pagina = (items: number[], paginas: number) => ({ data: { ok: true, data: { items, paginacion: { paginas } } } });

  it("con una sola página hace un pedido", async () => {
    const baseQuery = vi.fn(async () => pagina([1], 1));
    expect(await todasLasPaginas<number>(baseQuery, "/x", "items", { filtro: "a" })).toEqual({ data: [1] });
    expect(baseQuery).toHaveBeenCalledExactlyOnceWith({ url: "/x", params: { limit: 100, filtro: "a" } });
  });

  it("con varias páginas junta todo, en orden", async () => {
    const baseQuery = vi.fn(async ({ params }: { params?: Record<string, unknown> }) => pagina([Number(params?.page ?? 1)], 3));
    expect(await todasLasPaginas<number>(baseQuery, "/x", "items")).toEqual({ data: [1, 2, 3] });
  });

  it("un listado vacío termina en el primer pedido", async () => {
    const baseQuery = vi.fn(async () => pagina([], 0));
    expect(await todasLasPaginas<number>(baseQuery, "/x", "items")).toEqual({ data: [] });
    expect(baseQuery).toHaveBeenCalledTimes(1);
  });

  it("si falla una página devuelve el error y no una lista a medias", async () => {
    const error = { status: 500, data: null };
    const baseQuery = vi.fn(async ({ params }: { params?: Record<string, unknown> }) =>
      params?.page ? { error } : pagina([1], 2),
    );
    expect(await todasLasPaginas<number>(baseQuery, "/x", "items")).toEqual({ error });
  });
});

describe("safeRedirectPath", () => {
  it("acepta rutas internas", () => {
    expect(safeRedirectPath("/admin/perfil")).toBe("/admin/perfil");
    expect(safeRedirectPath("/admin?x=1")).toBe("/admin?x=1");
  });

  it("rechaza URLs externas y valores raros", () => {
    expect(safeRedirectPath("https://malo.com")).toBe("/admin");
    expect(safeRedirectPath("//malo.com")).toBe("/admin");
    expect(safeRedirectPath("/\\malo.com")).toBe("/admin");
    expect(safeRedirectPath(undefined)).toBe("/admin");
    expect(safeRedirectPath(42)).toBe("/admin");
  });
});

describe("validaciones de formularios", () => {
  const registroValido = {
    nombre: "Ana",
    apellido: "Pérez",
    telefono: "+54 11 5555-1234",
    pais: "Argentina",
    correo: " ana@mail.com ",
    sexo: "femenino",
    password: "miclave123",
    confirmarPassword: "miclave123",
  };

  it("login: pide correo válido y contraseña", () => {
    expect(loginSchema.safeParse({ correo: "ana@mail.com", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ correo: "no-es-mail", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ correo: "ana@mail.com", password: "" }).success).toBe(false);
  });

  it("registro: acepta datos válidos y limpia espacios del correo", () => {
    const result = registerSchema.safeParse(registroValido);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.correo).toBe("ana@mail.com");
  });

  it("registro: rechaza contraseñas cortas o que no coinciden", () => {
    expect(registerSchema.safeParse({ ...registroValido, password: "corta", confirmarPassword: "corta" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...registroValido, confirmarPassword: "otra-distinta" }).success).toBe(false);
  });

  it("registro: rechaza sexo fuera de la lista y teléfono inválido", () => {
    expect(registerSchema.safeParse({ ...registroValido, sexo: "x" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...registroValido, telefono: "abc" }).success).toBe(false);
  });
});
