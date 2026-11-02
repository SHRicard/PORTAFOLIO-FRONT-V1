import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { createMemoryRouter, MemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { router } from "@/app/router";
import { makeStore } from "@/app/store";
import { PublicLayout } from "@/components/layout/PublicLayout";
import type { Perfil } from "@/features/portafolio/types";
import { PALETAS } from "@/features/theme/paletas";
import { setVistaWeb } from "@/features/theme/themeSlice";
import { ShootingStar } from "@/vistas/rr-dev/components/atoms/ShootingStar";
import { armarEstrellas } from "@/vistas/rr-dev/components/atoms/StarField";
import { IslandNavbar } from "@/vistas/rr-dev/components/organisms/IslandNavbar";
import { NAV_SHEET_ID } from "@/vistas/rr-dev/components/organisms/NavSheet";
import { aniosDeExperiencia, armarEstadisticas, SERVICIOS } from "@/vistas/rr-dev/contenido";
import { ITEMS_MENU, seccionActiva } from "@/vistas/rr-dev/navegacion";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const perfil: Perfil = {
  id: "1",
  nombreVisible: "Nombre del perfil",
  rol: "Desarrollador",
  frase: "Frase",
  ubicacion: { ciudad: "Buenos Aires", pais: "Argentina" },
  modalidad: "remoto",
  disponibilidad: { disponible: true, texto: "" },
  bioCorta: "Corta",
  bioLarga: "Larga",
  correoContacto: "contacto@mail.com",
  redes: [],
  habilidades: [],
  idiomas: [],
  datosCuriosos: [],
  foto: null,
  cv: null,
  createdAt: "2026-10-30T12:00:00.000Z",
  updatedAt: "2026-10-30T12:00:00.000Z",
};

const respuesta = (data: unknown) =>
  new Response(JSON.stringify({ ok: true, data }), { headers: { "content-type": "application/json" } });

function servidor(cv: Perfil["cv"] = null, cambios: Partial<Perfil> = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async ({ url }: Request) => {
      if (url.includes("/perfil")) return respuesta({ perfil: { ...perfil, cv, ...cambios } });
      const clave = ["proyectos", "experiencia"].find((nombre) => url.includes(nombre)) ?? "estudios";
      return respuesta({ [clave]: [], paginacion: { paginas: 1 } });
    }),
  );
}

let raices: Root[] = [];

async function montar(ui: ReactNode, ruta = "/") {
  const store = makeStore();
  const caja = document.createElement("div");
  document.body.append(caja);
  const raiz = createRoot(caja);
  raices.push(raiz);
  await act(async () =>
    raiz.render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[ruta]}>{ui}</MemoryRouter>
      </Provider>,
    ),
  );
  return { caja, store };
}

const hasta = (condicion: () => void) => vi.waitFor(condicion, { timeout: 3000, interval: 10 });

const clic = (elemento: Element | null | undefined) =>
  act(async () => {
    elemento?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });

const enlaces = (caja: Element) => [...caja.querySelectorAll("nav a")].map((a) => a.textContent);
const hamburguesa = (caja: Element) => caja.querySelector(`button[aria-controls="${NAV_SHEET_ID}"]`);
const panel = () => document.getElementById(NAV_SHEET_ID);

beforeEach(() => {
  // RTK Query arma el Request con el AbortSignal de jsdom, que el Request de Node no acepta
  const RequestReal = globalThis.Request;
  vi.stubGlobal(
    "Request",
    class extends RequestReal {
      constructor(url: RequestInfo | URL, opciones?: RequestInit) {
        const { signal: _signal, ...resto } = opciones ?? {};
        super(url, resto);
      }
    },
  );
  servidor();
  // ScrollRestoration sube la página en cada cambio de ruta y jsdom no lo implementa
  window.scrollTo = vi.fn();
});

afterEach(async () => {
  await act(async () => raices.forEach((raiz) => raiz.unmount()));
  raices = [];
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("sección activa", () => {
  it("marca el enlace de la página actual", () => {
    expect(seccionActiva("/")).toBe("inicio");
    expect(seccionActiva("/sobre-mi")).toBe("sobre-mi");
    expect(seccionActiva("/contacto")).toBe("contacto");
  });

  it("un proyecto marca Proyectos y una publicación, Blog", () => {
    expect(seccionActiva("/proyectos/facturacion")).toBe("proyectos");
    expect(seccionActiva("/blog")).toBe("blog");
    expect(seccionActiva("/blog/una-entrada")).toBe("blog");
  });

  it("fuera del menú no marca nada", () => {
    expect(seccionActiva("/no-existe")).toBe("");
    expect(seccionActiva("/proyectos-viejos")).toBe("");
  });
});

describe("IslandNavbar", () => {
  it("muestra mi nombre y marca la página actual", async () => {
    const { caja } = await montar(<IslandNavbar />, "/habilidades");

    expect(caja.querySelector("header")?.textContent).toContain("Ricardo Ramirez");
    expect(enlaces(caja)).toEqual(["Inicio", "Sobre mí", "Habilidades", "Proyectos", "Blog", "Contacto"]);
    expect(caja.querySelector('nav a[aria-current="true"]')?.textContent).toBe("Habilidades");
  });

  it("el idioma muestra solo ES, sin opción de inglés", async () => {
    const { caja } = await montar(<IslandNavbar />);

    expect(caja.querySelector('[title="Español"]')?.textContent).toBe("ES");
    expect(caja.querySelector("header")?.textContent).not.toContain("EN");
    expect(caja.querySelector("[aria-pressed]")).toBeNull();
  });

  it("el botón de tema recorre las paletas y vuelve a la primera", async () => {
    const { caja, store } = await montar(<IslandNavbar />);
    const boton = () => caja.querySelector('button[aria-label^="Cambiar a"]');

    expect(store.getState().theme.paleta).toBe("negro-violeta");

    for (const paleta of [...PALETAS.slice(1), PALETAS[0]!]) {
      expect(boton()?.getAttribute("aria-label")).toBe(`Cambiar a ${paleta.nombre}`);
      await clic(boton());
      expect(store.getState().theme.paleta).toBe(paleta.id);
      expect(store.getState().theme.vars.esquema).toBe(paleta.colores.esquema);
    }
  });

  it("sin CV en el perfil el botón se ve, pero deshabilitado y sin enlace", async () => {
    const { caja } = await montar(<IslandNavbar />);
    await act(async () => {});

    const boton = caja.querySelector<HTMLButtonElement>("button.boton-cv");
    expect(boton?.textContent).toBe("Descargar CV");
    expect(boton?.disabled).toBe(true);
    expect(caja.querySelector("a.boton-cv")).toBeNull();
  });

  it("con CV el botón pasa a ser un enlace externo seguro", async () => {
    servidor({ url: "https://res.cloudinary.com/x/cv.pdf" });
    const { caja } = await montar(<IslandNavbar />);

    await hasta(() => expect(caja.querySelector("a.boton-cv")).not.toBeNull());
    const boton = caja.querySelector("a.boton-cv");
    expect(caja.querySelector("button.boton-cv")).toBeNull();
    expect(boton?.getAttribute("href")).toBe("https://res.cloudinary.com/x/cv.pdf");
    expect(boton?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(boton?.textContent).toBe("Descargar CV");
  });
});

describe("menú de celular", () => {
  it("también muestra el botón del CV", async () => {
    const { caja } = await montar(<IslandNavbar />);

    await clic(hamburguesa(caja));

    expect(panel()?.querySelector(".boton-cv")?.textContent).toBe("Descargar CV");
  });

  it("la hamburguesa lo abre con los enlaces, el idioma y dice su estado", async () => {
    const { caja } = await montar(<IslandNavbar />);
    expect(panel()).toBeNull();
    expect(hamburguesa(caja)?.getAttribute("aria-label")).toBe("Abrir menú");

    await clic(hamburguesa(caja));

    expect(panel()?.querySelectorAll("nav a")).toHaveLength(6);
    expect(panel()?.querySelector('[title="Español"]')?.textContent).toBe("ES");
    expect(hamburguesa(caja)?.getAttribute("aria-expanded")).toBe("true");
    expect(hamburguesa(caja)?.getAttribute("aria-label")).toBe("Cerrar menú");
  });

  it("Escape lo cierra y devuelve el foco a la hamburguesa", async () => {
    const { caja } = await montar(<IslandNavbar />);
    await clic(hamburguesa(caja));

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(hamburguesa(caja));
  });

  it("se cierra al tocar afuera o al tocar un enlace", async () => {
    const { caja } = await montar(<IslandNavbar />);

    await clic(hamburguesa(caja));
    await clic(panel()?.previousElementSibling);
    expect(panel()).toBeNull();

    await clic(hamburguesa(caja));
    await clic(panel()?.querySelector("nav a"));
    expect(panel()).toBeNull();
  });
});

/** Monta las rutas reales de la app, para probar a dónde lleva cada URL */
async function navegar(ruta: string, vista?: string) {
  const store = makeStore();
  if (vista) store.dispatch(setVistaWeb(vista));
  const enrutador = createMemoryRouter(router.routes, { initialEntries: [ruta] });
  const caja = document.createElement("div");
  document.body.append(caja);
  const raiz = createRoot(caja);
  raices.push(raiz);
  await act(async () =>
    raiz.render(
      <Provider store={store}>
        <RouterProvider router={enrutador} />
      </Provider>,
    ),
  );
  return { caja, enrutador };
}

const NO_EXISTE = "Esta página no existe";

describe("páginas de la vista RR-DEV", () => {
  it.each([
    ["/sobre-mi", "Sobre mí"],
    ["/habilidades", "Habilidades"],
    ["/proyectos", "Proyectos"],
    ["/contacto", "Contacto"],
  ])("%s pinta el nombre del apartado y marca su enlace", async (ruta, nombre) => {
    const { caja } = await navegar(ruta);

    expect(caja.querySelector("main h1")?.textContent).toBe(nombre);
    expect(caja.querySelector('nav a[aria-current="true"]')?.textContent).toBe(nombre);
  });

  it("todos los enlaces del menú llevan a una página que existe", async () => {
    for (const { href } of ITEMS_MENU) {
      const { caja } = await navegar(href);
      expect(caja.textContent, href).not.toContain(NO_EXISTE);
    }
  });

  it("tocar un enlace cambia de página, sin saltar a una sección", async () => {
    const { caja, enrutador } = await navegar("/");
    const enlace = [...caja.querySelectorAll("nav a")].find((a) => a.textContent === "Habilidades");

    await clic(enlace);

    expect(enrutador.state.location.pathname).toBe("/habilidades");
    expect(enrutador.state.location.hash).toBe("");
    expect(caja.querySelector("main h1")?.textContent).toBe("Habilidades");
  });

  it("una ruta que el diseño no tiene da 404, también las que existen en todo objeto", async () => {
    for (const ruta of ["/no-existe", "/constructor", "/__proto__", "/toString"]) {
      const { caja } = await navegar(ruta);
      expect(caja.textContent, ruta).toContain(NO_EXISTE);
    }
  });

  it("esas páginas son de este diseño: en la vista Básica no existen", async () => {
    const { caja } = await navegar("/sobre-mi", "basica");

    expect(caja.textContent).toContain(NO_EXISTE);
  });
});

describe("cielo del inicio", () => {
  const cielo = (caja: Element) => ({
    estrellas: caja.querySelectorAll(".estrellas > span").length,
    aurora: caja.querySelectorAll(".aurora > span").length,
    fugaz: caja.querySelectorAll(".estrella-fugaz").length,
    planeta: caja.querySelectorAll(".horizonte-planeta").length,
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  const conVuelos = () => {
    const animar = vi.fn();
    HTMLElement.prototype.animate = animar;
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    return animar;
  };

  it("la misma semilla dibuja el mismo cielo, y otra semilla uno distinto", () => {
    expect(armarEstrellas(40, 3)).toEqual(armarEstrellas(40, 3));
    expect(armarEstrellas(40, 3)).not.toEqual(armarEstrellas(40, 5));
  });

  it("las estrellas quedan dentro del cielo, y algunas tiran destello", () => {
    const estrellas = armarEstrellas(130, 7);

    expect(estrellas).toHaveLength(130);
    expect(estrellas.every(({ x, y }) => x >= 0 && x <= 100 && y >= 0 && y <= 100)).toBe(true);
    expect(estrellas.some(({ destello }) => destello)).toBe(true);
    expect(estrellas.every(({ destello }) => destello)).toBe(false);
  });

  it("va en Inicio y no en las demás páginas", async () => {
    const inicio = await navegar("/");
    expect(cielo(inicio.caja)).toEqual({ estrellas: 130, aurora: 3, fugaz: 1, planeta: 1 });

    const otra = await navegar("/sobre-mi");
    expect(cielo(otra.caja)).toEqual({ estrellas: 0, aurora: 0, fugaz: 0, planeta: 0 });
  });

  it("el planeta es una foto decorativa con la luz del sol, oculta para los lectores de pantalla", async () => {
    const { caja } = await navegar("/");
    const fotos = [...caja.querySelectorAll(".horizonte-planeta img")];

    expect(fotos).toHaveLength(2);
    expect(fotos.every((foto) => foto.getAttribute("alt") === "")).toBe(true);
    expect(fotos[0]?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(caja.querySelector(".horizonte-sol")?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("la estrella fugaz pasa recién a los 6 segundos y después cada 20", async () => {
    const animar = conVuelos();
    await montar(<ShootingStar />);

    vi.advanceTimersByTime(5999);
    expect(animar).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(animar).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(19999);
    expect(animar).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(animar).toHaveBeenCalledTimes(2);
  });

  it("cada pasada dura entre 1,5 y 2,6 segundos", async () => {
    const animar = conVuelos();
    await montar(<ShootingStar primeraVez={1} />);

    vi.advanceTimersByTime(1000);

    const duracion = (animar.mock.calls[0]?.[1] as KeyframeAnimationOptions).duration as number;
    expect(duracion).toBeGreaterThanOrEqual(1500);
    expect(duracion).toBeLessThanOrEqual(2600);
  });

  it("si el sistema pide menos movimiento, la estrella fugaz no sale", async () => {
    const animar = conVuelos();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    await montar(<ShootingStar primeraVez={1} />);

    vi.advanceTimersByTime(120000);

    expect(animar).not.toHaveBeenCalled();
  });
});

describe("inicio de la vista RR-DEV", () => {
  const nombres = (lista: Element | undefined) =>
    [...(lista?.querySelectorAll('[role="img"]') ?? [])].map((logo) => logo.getAttribute("aria-label"));
  const red = (caja: Element, nombre: string) => caja.querySelector(`main a[aria-label="${nombre}"]`);

  it("pinta mi nombre y marca su enlace", async () => {
    const { caja } = await navegar("/");

    expect(caja.querySelector("main h1")?.textContent).toBe("Ricardo Ramirez");
    expect(caja.querySelector('nav a[aria-current="true"]')?.textContent).toBe("Inicio");
  });

  it("cuenta los años desde el primer trabajo cargado, en años enteros", () => {
    const hoy = new Date(2026, 10, 2);

    expect(aniosDeExperiencia([{ desde: "2023-01" }, { desde: "2022-11" }], hoy)).toBe(4);
    expect(aniosDeExperiencia([{ desde: "2022-12" }], hoy)).toBe(3);
    expect(aniosDeExperiencia([], hoy)).toBeNull();
  });

  it("arma las estadísticas con los datos reales, y una raya mientras no llegan", () => {
    const habilidades = [{ nombre: "React", categoria: "front" as const }];
    const valores = (lista: ReturnType<typeof armarEstadisticas>) => lista.map(({ valor }) => valor);

    expect(valores(armarEstadisticas({ habilidades }, [{ desde: "2022-11" }], new Date(2026, 10, 2)))).toEqual([
      "4+",
      "X",
      "23",
      "1",
    ]);
    expect(valores(armarEstadisticas())).toEqual(["—", "X", "23", "—"]);
  });

  it("cada estadística tiene su color, en el orden de RR-DEV", () => {
    expect(armarEstadisticas().map(({ tono }) => tono)).toEqual(["info", "exito", "aviso", "rosa"]);
  });

  it("la barra muestra los cuatro datos, sin los de clientes y proyectos de RR-DEV", async () => {
    const { caja } = await navegar("/");
    const main = () => caja.querySelector("main")?.textContent ?? "";

    await hasta(() => expect(main()).toContain("Años de experiencia"));

    for (const etiqueta of ["Commits hechos", "Repositorios", "Tecnologías"]) expect(main()).toContain(etiqueta);
    expect(main()).not.toContain("Clientes");
    expect(main()).not.toContain("Proyectos completados");
  });

  it("el carrusel repite la lista oculta para los lectores de pantalla, que leen cada palabra una vez", async () => {
    const { caja } = await navegar("/");
    const lista = caja.querySelector(".marquesina ul");
    const titulo = document.getElementById(lista?.getAttribute("aria-labelledby") ?? "");
    const palabras = [...(lista?.children ?? [])];

    expect(titulo?.textContent).toBe("Lo que hago");
    expect(palabras).toHaveLength(SERVICIOS.length * 2);
    expect(palabras.slice(0, SERVICIOS.length).map((li) => li.textContent)).toEqual(SERVICIOS);
    expect(palabras.slice(SERVICIOS.length).map((li) => li.textContent)).toEqual(SERVICIOS);
    expect(palabras.filter((li) => li.getAttribute("aria-hidden") === "true")).toHaveLength(SERVICIOS.length);
    expect(palabras.slice(0, SERVICIOS.length).some((li) => li.hasAttribute("aria-hidden"))).toBe(false);
  });

  it("trae los textos del hero, en orden", async () => {
    const { caja } = await navegar("/");
    const texto = caja.querySelector("main")?.textContent ?? "";
    const orden = ["Hola, soy", "Ricardo Ramirez", "Desarrollador Full Stack", "Creo aplicaciones web rápidas"];

    expect(orden.map((parte) => texto.indexOf(parte)).every((pos, i, todas) => pos > (todas[i - 1] ?? -1))).toBe(true);
  });

  it("avisa que estoy disponible solo si el perfil lo dice", async () => {
    const { caja } = await navegar("/");
    await hasta(() => expect(caja.textContent).toContain("Disponible para nuevos proyectos"));
    expect(caja.querySelector("main .punto-estado")?.getAttribute("aria-hidden")).toBe("true");

    servidor(null, {
      disponibilidad: { disponible: false, texto: "" },
      foto: { url: "https://res.cloudinary.com/x/yo.jpg", alt: "Mi retrato" },
    });
    const otra = await navegar("/");

    // La foto confirma que el perfil ya llegó
    await hasta(() => expect(otra.caja.querySelector("main img")).not.toBeNull());
    expect(otra.caja.textContent).not.toContain("Disponible para nuevos proyectos");
  });

  it("reparte las tecnologías entre las dos constelaciones y las repite en la fila de celular", async () => {
    const { caja } = await navegar("/");
    const [izquierda, fila, derecha] = caja.querySelectorAll('main ul[aria-label="Tecnologías"]');

    expect(nombres(izquierda)).toEqual(["JavaScript", "TypeScript", "React"]);
    expect(nombres(derecha)).toEqual(["Next.js", "Node.js", "MongoDB"]);
    expect(nombres(fila)).toEqual([...nombres(izquierda), ...nombres(derecha)]);
  });

  it("las constelaciones son espejo: cada burbuja está a la misma distancia del centro", async () => {
    const { caja } = await navegar("/");
    const [izquierda, , derecha] = caja.querySelectorAll('main ul[aria-label="Tecnologías"]');
    const posiciones = (lista: Element | undefined) =>
      [...(lista?.querySelectorAll("li") ?? [])].map((punto) => parseInt(punto.style.left));

    expect(posiciones(izquierda)).toEqual(posiciones(derecha).map((x) => 150 - x));
  });

  it("las redes salen del perfil y se abren en otra pestaña", async () => {
    const url = "https://github.com/alguien";
    servidor(null, { redes: [{ tipo: "github", url }, { tipo: "sitio", url: "https://misitio.com/" }] });
    const { caja } = await navegar("/");

    await hasta(() => expect(red(caja, "GitHub")).not.toBeNull());

    expect(red(caja, "GitHub")?.getAttribute("href")).toBe(url);
    expect(red(caja, "GitHub")?.getAttribute("target")).toBe("_blank");
    expect(red(caja, "GitHub")?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(red(caja, "Sitio web")).not.toBeNull();
    expect(caja.textContent).toContain("Seguime en");
  });

  it("en horizontal y en vertical las redes se presentan con su texto a la vista", async () => {
    servidor(null, { redes: [{ tipo: "github", url: "https://github.com/alguien" }] });
    const { caja } = await navegar("/");

    await hasta(() => expect(red(caja, "GitHub")).not.toBeNull());

    const listas = [...caja.querySelectorAll("main a[aria-label='GitHub']")].map((a) => a.closest("ul"));
    const titulos = listas.map((lista) => document.getElementById(lista?.getAttribute("aria-labelledby") ?? ""));

    expect(titulos.map((titulo) => titulo?.textContent)).toEqual(["Seguime en", "Seguime en"]);
    expect(titulos.some((titulo) => titulo?.classList.contains("sr-only"))).toBe(false);
  });

  it("sin redes cargadas no queda la columna vacía", async () => {
    servidor(null, { foto: { url: "https://res.cloudinary.com/x/yo.jpg", alt: "Mi retrato" } });
    const { caja } = await navegar("/");

    // La foto confirma que el perfil ya llegó
    await hasta(() => expect(caja.querySelector("main img")).not.toBeNull());

    expect(caja.textContent).not.toContain("Seguime en");
  });

  it("sin foto muestra el espacio reservado, y la foto cuando está cargada", async () => {
    const { caja } = await navegar("/");
    expect(caja.querySelector('main [role="img"][aria-label="Ricardo Ramirez"]')?.textContent).toBe("Tu foto");

    servidor(null, { foto: { url: "https://res.cloudinary.com/x/yo.jpg", alt: "Mi retrato" } });
    const otra = await navegar("/");

    await hasta(() => expect(otra.caja.querySelector("main img")?.getAttribute("alt")).toBe("Mi retrato"));
    expect(otra.caja.textContent).not.toContain("Tu foto");
  });
});

describe("encabezado de la web pública", () => {
  it("cambia con la vista elegida y nunca quedan dos", async () => {
    const { caja, store } = await montar(<PublicLayout />);
    expect(caja.querySelector(".isla")).not.toBeNull();

    await act(async () => {
      store.dispatch(setVistaWeb("basica"));
    });

    expect(caja.querySelector(".isla")).toBeNull();
    expect(caja.querySelectorAll("header")).toHaveLength(1);
    expect(caja.querySelector("header")?.textContent).toContain("Ricardo Ramirez");
    expect(caja.querySelector("header")?.textContent).toContain("Ingresar");
  });

  it("si la vista elegida ya no existe usa la primera", async () => {
    const { caja, store } = await montar(<PublicLayout />);

    await act(async () => {
      store.dispatch(setVistaWeb("no-existe"));
    });

    expect(caja.querySelectorAll("header")).toHaveLength(1);
  });
});
