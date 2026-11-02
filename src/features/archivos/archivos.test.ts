// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/app/store";
import { sessionStarted } from "@/features/auth/authActions";
import { getErrorMessage } from "@/lib/errors";
import { archivosApi, esApk, validarArchivo } from "./archivosApi";
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
});

describe("validarArchivo con APK", () => {
  const reglas = { formatos: ["apk"], maxBytes: 200 * 1024 * 1024 };

  it("reconoce un APK por su tipo o, si el sistema no lo informa, por la extensión", () => {
    expect(validarArchivo({ type: "application/vnd.android.package-archive", size: 1000 }, reglas)).toBeNull();
    expect(validarArchivo({ type: "", size: 1000, name: "Mi App.APK" }, reglas)).toBeNull();
    expect(esApk({ type: "", name: "app.apk" })).toBe(true);
    expect(esApk({ type: "application/pdf", name: "manual.pdf" })).toBe(false);
  });

  it("rechaza lo que no es un APK y lo que supera el máximo", () => {
    expect(validarArchivo({ type: "application/pdf", size: 1000, name: "a.pdf" }, reglas)).toBe("Formato no permitido: usá apk");
    expect(validarArchivo({ type: "", size: 201 * 1024 * 1024, name: "a.apk" }, reglas)).toBe("El archivo supera el máximo de 200 MB");
  });
});

describe("subirArchivo a S3", () => {
  const URL_BUCKET = "https://mi-bucket.s3.sa-east-1.amazonaws.com";
  const key = "apk/mi-app/mi-app-a1b2c3.apk";
  const firmaS3: FirmaSubida = {
    urlSubida: URL_BUCKET,
    campos: { key, policy: "p", "x-amz-signature": "s" },
    formatos: ["apk"],
    maxBytes: 200 * 1024 * 1024,
    destino: { publicId: key, url: `${URL_BUCKET}/${key}` },
  };
  const apk = () => new File(["contenido"], "Mi App.apk", { type: "application/vnd.android.package-archive" });

  function mockS3(respuestaS3: () => Response) {
    const pedidos: Pedido[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (entrada: Request | string, opciones?: RequestInit) => {
        if (typeof entrada === "string") {
          pedidos.push({ url: entrada, authorization: new Headers(opciones?.headers).get("authorization"), body: opciones?.body });
          return respuestaS3();
        }
        const body = await entrada.clone().json();
        pedidos.push({ url: entrada.url, authorization: entrada.headers.get("authorization"), body });
        if (entrada.url.endsWith("/archivos/firma")) return json(200, { ok: true, data: { firma: firmaS3 } });
        return json(201, { ok: true, data: { archivo: { ...registrado, tipo: "apk", publicId: key } } });
      }),
    );
    return pedidos;
  }

  it("sube al bucket y registra el destino que eligió el backend", async () => {
    const pedidos = mockS3(() => new Response(null, { status: 204 }));

    const { data } = await storeConSesion().dispatch(
      archivosApi.endpoints.subirArchivo.initiate({ archivo: apk(), tipo: "apk", carpeta: "apk/mi-app" }),
    );

    expect(pedidos[0]?.body).toEqual({ tipo: "apk", carpeta: "apk/mi-app", nombre: "Mi App.apk" });
    expect(pedidos[1]?.url).toBe(URL_BUCKET);
    expect(pedidos[2]?.body).toEqual({
      publicId: key,
      url: `${URL_BUCKET}/${key}`,
      tipo: "apk",
      formato: "apk",
      bytes: 9,
      nombreOriginal: "Mi App.apk",
    });
    expect(data?.publicId).toBe(key);
  });

  it("el token del panel nunca llega a S3", async () => {
    const pedidos = mockS3(() => new Response(null, { status: 204 }));

    await storeConSesion().dispatch(archivosApi.endpoints.subirArchivo.initiate({ archivo: apk(), tipo: "apk" }));

    expect(pedidos[1]?.authorization).toBeNull();
    expect(pedidos[2]?.authorization).toBe("Bearer tok123");
  });

  it("manda los campos firmados y el archivo al final, como exige S3", async () => {
    const pedidos = mockS3(() => new Response(null, { status: 204 }));

    await storeConSesion().dispatch(archivosApi.endpoints.subirArchivo.initiate({ archivo: apk(), tipo: "apk" }));

    const campos = [...(pedidos[1]?.body as FormData).keys()];
    expect(campos).toEqual(["key", "policy", "x-amz-signature", "file"]);
  });

  it("si S3 rechaza el archivo, muestra su mensaje y no lo registra", async () => {
    const xml = "<Error><Code>EntityTooLarge</Code><Message>Your proposed upload exceeds the maximum allowed size</Message></Error>";
    const pedidos = mockS3(() => new Response(xml, { status: 400 }));

    const { error } = await storeConSesion().dispatch(archivosApi.endpoints.subirArchivo.initiate({ archivo: apk(), tipo: "apk" }));

    expect(getErrorMessage(error)).toBe("Your proposed upload exceeds the maximum allowed size");
    expect(pedidos).toHaveLength(2);
  });

  it("sin conexión o sin CORS en el bucket, lo avisa", async () => {
    const pedidos = mockS3(() => {
      throw new TypeError("Failed to fetch");
    });

    const { error } = await storeConSesion().dispatch(archivosApi.endpoints.subirArchivo.initiate({ archivo: apk(), tipo: "apk" }));

    expect(getErrorMessage(error)).toBe("No se pudo conectar con S3. Revisá el CORS del bucket");
    expect(pedidos).toHaveLength(2);
  });
});

describe("subirArchivo", () => {
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
