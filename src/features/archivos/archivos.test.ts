// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/app/store";
import { sessionStarted } from "@/features/auth/authActions";
import { getErrorMessage } from "@/lib/errors";
import { archivosApi, validarArchivo } from "./archivosApi";
import { carpetaDelArchivo, megas } from "./FilaArchivo";
import type { Archivo, FirmaSubida } from "./types";

const URL_CLOUDINARY = "https://api.cloudinary.com/v1_1/mi-cloud/image/upload";

const firma: FirmaSubida = {
  urlSubida: URL_CLOUDINARY,
  campos: { allowed_formats: "jpg,png,webp", folder: "portafolio/perfil", timestamp: 1, api_key: "k", signature: "s" },
  formatos: ["jpg", "png", "webp"],
  maxBytes: 5 * 1024 * 1024,
};

const cloudinary = {
  public_id: "portafolio/perfil/foto",
  secure_url: "https://res.cloudinary.com/mi-cloud/image/upload/v1/portafolio/perfil/foto.webp",
  format: "webp",
  bytes: 1000,
  width: 800,
  height: 600,
  original_filename: "foto",
};

const registrado: Archivo = {
  id: "1",
  publicId: cloudinary.public_id,
  url: cloudinary.secure_url,
  tipo: "imagen",
  formato: "webp",
  bytes: 1000,
  ancho: 800,
  alto: 600,
  nombreOriginal: "foto",
  createdAt: "2026-10-30T12:00:00.000Z",
  updatedAt: "2026-10-30T12:00:00.000Z",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

interface Pedido {
  url: string;
  authorization: string | null;
  body: unknown;
}

/** Simula el backend y Cloudinary, y guarda lo que recibió cada uno */
function mockServicios(respuestaCloudinary: () => Response = () => json(200, cloudinary)) {
  const pedidos: Pedido[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (entrada: Request | string, opciones?: RequestInit) => {
      if (typeof entrada === "string") {
        // Cloudinary: se llama con fetch(url, opciones), sin pasar por RTK Query
        pedidos.push({
          url: entrada,
          authorization: new Headers(opciones?.headers).get("authorization"),
          body: opciones?.body,
        });
        return respuestaCloudinary();
      }

      const body = await entrada.clone().json();
      pedidos.push({ url: entrada.url, authorization: entrada.headers.get("authorization"), body });
      if (entrada.url.endsWith("/archivos/firma")) return json(200, { ok: true, data: { firma } });
      return json(201, { ok: true, data: { archivo: registrado } });
    }),
  );
  return pedidos;
}

function storeConSesion() {
  const store = makeStore();
  store.dispatch(sessionStarted("tok123"));
  return store;
}

const imagen = () => new File(["contenido"], "foto.webp", { type: "image/webp" });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("validarArchivo", () => {
  it("acepta los formatos y tamaños permitidos", () => {
    expect(validarArchivo({ type: "image/webp", size: 1000 }, firma)).toBeNull();
    expect(validarArchivo({ type: "image/jpeg", size: 1000 }, firma)).toBeNull();
  });

  it("rechaza SVG, otros formatos y archivos demasiado grandes", () => {
    expect(validarArchivo({ type: "image/svg+xml", size: 1000 }, firma)).toBe("Formato no permitido: usá jpg, png, webp");
    expect(validarArchivo({ type: "application/pdf", size: 1000 }, firma)).toBe("Formato no permitido: usá jpg, png, webp");
    expect(validarArchivo({ type: "image/png", size: 6 * 1024 * 1024 }, firma)).toBe("El archivo supera el máximo de 5 MB");
  });

  it("un PDF que no entra en Cloudinary sugiere subirlo a GitHub; un archivo vacío no se sube", () => {
    const reglasPdf = { formatos: ["pdf"], maxBytes: 10 * 1024 * 1024 };
    expect(validarArchivo({ type: "application/pdf", size: 3 * 1024 * 1024 }, reglasPdf)).toBeNull();
    expect(validarArchivo({ type: "application/pdf", size: 11 * 1024 * 1024 }, reglasPdf)).toBe(
      "El PDF supera el máximo de 10 MB: subilo a GitHub y pegá el link",
    );
    expect(validarArchivo({ type: "image/webp", size: 0 }, firma)).toBe("El archivo está vacío");
  });
});

describe("subirArchivo", () => {
  it("la firma lleva solo tipo y carpeta, y sin carpeta no la manda", async () => {
    const pedidos = mockServicios();
    const store = storeConSesion();

    await store.dispatch(archivosApi.endpoints.subirArchivo.initiate({ archivo: imagen(), tipo: "imagen" }));

    expect(pedidos[0]?.body).toEqual({ tipo: "imagen" });
  });

  it("hace los 3 pasos y registra lo que devolvió Cloudinary", async () => {
    const pedidos = mockServicios();
    const store = storeConSesion();

    const { data } = await store.dispatch(
      archivosApi.endpoints.subirArchivo.initiate({ archivo: imagen(), tipo: "imagen", carpeta: "perfil" }),
    );

    expect(pedidos.map((p) => p.url.replace("http://localhost:4000/api", ""))).toEqual([
      "/archivos/firma",
      URL_CLOUDINARY,
      "/archivos",
    ]);
    expect(pedidos[0]?.body).toEqual({ tipo: "imagen", carpeta: "perfil" });
    expect(pedidos[2]?.body).toEqual({
      publicId: cloudinary.public_id,
      url: cloudinary.secure_url,
      tipo: "imagen",
      formato: "webp",
      bytes: 1000,
      ancho: 800,
      alto: 600,
      nombreOriginal: "foto",
    });
    expect(data).toEqual(registrado);
  });

  it("el token del panel va al backend pero NUNCA a Cloudinary", async () => {
    const pedidos = mockServicios();
    const store = storeConSesion();

    await store.dispatch(archivosApi.endpoints.subirArchivo.initiate({ archivo: imagen(), tipo: "imagen" }));

    expect(pedidos[0]?.authorization).toBe("Bearer tok123");
    expect(pedidos[1]?.authorization).toBeNull();
    expect(pedidos[2]?.authorization).toBe("Bearer tok123");
  });

  it("a Cloudinary le manda todos los campos firmados junto con el archivo", async () => {
    const pedidos = mockServicios();
    const store = storeConSesion();

    await store.dispatch(archivosApi.endpoints.subirArchivo.initiate({ archivo: imagen(), tipo: "imagen" }));

    const formulario = pedidos[1]?.body as FormData;
    expect(formulario.get("signature")).toBe("s");
    expect(formulario.get("api_key")).toBe("k");
    expect(formulario.get("folder")).toBe("portafolio/perfil");
    expect((formulario.get("file") as File).name).toBe("foto.webp");
  });

  it("no sube un archivo con formato no permitido", async () => {
    const pedidos = mockServicios();
    const store = storeConSesion();
    const svg = new File(["<svg/>"], "x.svg", { type: "image/svg+xml" });

    const { error } = await store.dispatch(archivosApi.endpoints.subirArchivo.initiate({ archivo: svg, tipo: "imagen" }));

    expect(getErrorMessage(error)).toBe("Formato no permitido: usá jpg, png, webp");
    expect(pedidos).toHaveLength(1); // solo se pidió la firma
  });

  it("si Cloudinary rechaza el archivo, muestra su mensaje y no lo registra", async () => {
    const pedidos = mockServicios(() => json(400, { error: { message: "Stale request" } }));
    const store = storeConSesion();

    const { error } = await store.dispatch(archivosApi.endpoints.subirArchivo.initiate({ archivo: imagen(), tipo: "imagen" }));

    expect(getErrorMessage(error)).toBe("Stale request");
    expect(pedidos).toHaveLength(2);
  });

  it("muestra el 503 del backend cuando Cloudinary no está configurado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => json(503, { ok: false, message: "Cloudinary no está configurado en el servidor" })),
    );
    const store = storeConSesion();

    const { error } = await store.dispatch(archivosApi.endpoints.subirArchivo.initiate({ archivo: imagen(), tipo: "imagen" }));

    expect(getErrorMessage(error)).toBe("Cloudinary no está configurado en el servidor");
  });
});

describe("la carpeta de un archivo", () => {
  it("sale del publicId, sin la carpeta del portafolio ni el nombre", () => {
    expect(carpetaDelArchivo("portafolio/proyectos/facturacion-fct/qx8v")).toBe("proyectos/facturacion-fct");
    expect(carpetaDelArchivo("portafolio/perfil/abc")).toBe("perfil");
    expect(carpetaDelArchivo("portafolio/abc")).toBeNull();
    expect(carpetaDelArchivo("abc")).toBeNull();
  });
});

describe("el tamaño de un archivo", () => {
  it("en MB, y lo chico en KB para que no diga «0 MB»", () => {
    expect(megas(3_774_874)).toBe("3,6 MB");
    expect(megas(182_000)).toBe("0,2 MB");
    expect(megas(8192)).toBe("8 KB");
    expect(megas(10)).toBe("1 KB");
  });
});
