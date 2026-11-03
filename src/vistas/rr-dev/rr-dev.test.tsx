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
import { SectionReveal } from "@/vistas/rr-dev/components/organisms/SectionReveal";
import { DESPUES, ESTRELLA, FUNDIDO, PIEZA } from "@/vistas/rr-dev/hooks/useEncendido";
import { tramo } from "@/vistas/rr-dev/hooks/useIndicadorDeslizante";
import { JUPITER, LUNA, MARTE, MERCURIO, MS_POR_CUADRO, SATURNO, SOL, TIERRA, VENUS } from "@/vistas/rr-dev/astros";
import { conexionLenta, cuadroEn } from "@/vistas/rr-dev/cuadros";
import {
  curva,
  duracion,
  escalaSol,
  pasoDe,
  PLANETAS,
  seDibuja,
  suavizar,
  ubicacion,
} from "@/vistas/rr-dev/camara";
import { aniosDeExperiencia, armarEstadisticas, SERVICIOS } from "@/vistas/rr-dev/contenido";
import { alturaLlama } from "@/vistas/rr-dev/llamas";
import { ITEMS_MENU, seccionActiva } from "@/vistas/rr-dev/navegacion";
import { posicionEn } from "@/vistas/rr-dev/rotacion";
import { afuera, enOrbita, mezclar, SATELITES_CERCA, SATELITES_LEJOS } from "@/vistas/rr-dev/satelites";

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
      if (url.includes("/blog")) return respuesta({ entradas: [], paginacion: { paginas: 1 } });
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
  // Tampoco dibuja en canvas: el sol se queda con su foto quieta y sin llamas
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
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
    expect(enlaces(caja)).toEqual(["Inicio", "Sobre mí", "Habilidades", "Proyectos", "Contacto", "Blog"]);
    expect(caja.querySelector('nav a[aria-current="true"]')?.textContent).toBe("Habilidades");
  });

  describe("cometa del menú", () => {
    // jsdom no ubica nada: cada enlace mide 60px y empiezan de a 100
    const POSICIONES: Record<string, number> = { Inicio: 0, "Sobre mí": 100, Habilidades: 200, Proyectos: 300, Contacto: 400, Blog: 500 };
    const tocar = (caja: Element, texto: string) => clic([...caja.querySelectorAll("nav a")].find((a) => a.textContent === texto));

    beforeEach(() => {
      vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
        return POSICIONES[this.textContent ?? ""] ?? 0;
      });
      vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(60);
      HTMLElement.prototype.getAnimations = () => [];
    });

    afterEach(() => {
      delete (HTMLElement.prototype as { animate?: unknown }).animate;
      delete (HTMLElement.prototype as { getAnimations?: unknown }).getAnimations;
    });

    it("al cambiar de enlace vuela y deja una estela de uno al otro, en el sentido en que va", async () => {
      const animar = vi.fn();
      HTMLElement.prototype.animate = animar;
      const { caja } = await montar(<IslandNavbar />, "/");
      const cabeza = caja.querySelector<HTMLElement>(".indicador-cometa");
      const estela = caja.querySelector<HTMLElement>(".cometa-estela");
      await hasta(() => expect(cabeza?.dataset.listo).toBe("true"));
      // Al cargar la página ya está en su lugar: no llega volando
      expect(animar).not.toHaveBeenCalled();

      await tocar(caja, "Proyectos");
      expect(cabeza?.style.getPropertyValue("--x")).toBe("300px");
      expect(estela?.style.getPropertyValue("--desde")).toBe("30px");
      expect(estela?.style.getPropertyValue("--largo")).toBe("300px");
      expect(estela?.dataset.sentido).toBe("derecha");
      // El frente de la estela sigue a la cabeza: el mismo tiempo que la transición de estilos.css
      expect(animar).toHaveBeenCalledWith(
        [{ "--frente": "0%" }, { "--frente": "100%" }],
        expect.objectContaining({ duration: 600, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }),
      );

      await tocar(caja, "Sobre mí");
      expect(estela?.style.getPropertyValue("--desde")).toBe("130px");
      expect(estela?.style.getPropertyValue("--largo")).toBe("200px");
      expect(estela?.dataset.sentido).toBe("izquierda");
    });

    it("con menos movimiento salta al enlace nuevo, sin estela", async () => {
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      const animar = vi.fn();
      HTMLElement.prototype.animate = animar;
      const { caja } = await montar(<IslandNavbar />, "/");
      await hasta(() => expect(caja.querySelector<HTMLElement>(".indicador-cometa")?.dataset.listo).toBe("true"));

      await tocar(caja, "Contacto");

      expect(caja.querySelector<HTMLElement>(".indicador-cometa")?.style.getPropertyValue("--x")).toBe("400px");
      expect(animar).not.toHaveBeenCalled();
    });

    it("la estela va del más chico al más grande, sea cual sea el sentido", () => {
      expect(tramo(30, 330)).toEqual({ izquierda: 30, largo: 300, sentido: "derecha" });
      expect(tramo(330, 130)).toEqual({ izquierda: 130, largo: 200, sentido: "izquierda" });
    });
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
    ["/blog", "Blog"],
  ])("%s pinta el nombre del apartado y marca su enlace", async (ruta, nombre) => {
    const { caja } = await navegar(ruta);

    expect(caja.querySelector("main h1")?.textContent).toBe(nombre);
    expect(caja.querySelector('nav a[aria-current="true"]')?.textContent).toBe(nombre);
  });

  it("el blog no pinta las publicaciones, que tapaban el espacio; la vista Básica sí", async () => {
    const rrDev = await navegar("/blog");
    await act(async () => {});
    expect(rrDev.caja.querySelector("main")?.textContent).toBe("Blog");

    const basica = await navegar("/blog", "basica");
    await hasta(() => expect(basica.caja.textContent).toContain("Todavía no hay publicaciones."));
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

describe("encendido del contenido", () => {
  let llamadas: { pieza: Element; opciones: KeyframeAnimationOptions }[] = [];
  const opcionesDe = (pieza: Element | null) => llamadas.find((llamada) => llamada.pieza === pieza)?.opciones;
  const estrellas = (caja: Element) => caja.querySelectorAll(".estrella-encendido").length;
  const hora = (pieza: Element | null | undefined) => Number((pieza as HTMLElement | null)?.dataset.encender);

  beforeEach(() => {
    llamadas = [];
    HTMLElement.prototype.animate = function (this: Element, _cuadros, opciones) {
      llamadas.push({ pieza: this, opciones: opciones as KeyframeAnimationOptions });
      return { cancel: () => {} } as Animation;
    };
    // jsdom no ubica nada: sin esto todo parece oculto
    vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([new DOMRect()] as unknown as DOMRectList);
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  const montarPiezas = () =>
    montar(
      <SectionReveal>
        <p data-encender={0}>Primero</p>
        <p data-encender={1400}>Después</p>
        <div data-encender={2130} data-sin-estrella>
          Vidrio
        </div>
      </SectionReveal>,
    );

  it("cada pieza se enciende a su hora, un poco después de la estrella que destella en su centro", async () => {
    const { caja } = await montarPiezas();
    const [primero, despues, vidrio] = caja.querySelectorAll("[data-encender]");

    expect(opcionesDe(primero!)).toMatchObject({ duration: PIEZA, delay: DESPUES });
    expect(opcionesDe(despues!)).toMatchObject({ duration: PIEZA, delay: 1400 + DESPUES });
    // Lo que tiene data-sin-estrella solo aparece
    expect(opcionesDe(vidrio!)).toMatchObject({ duration: FUNDIDO, delay: 2130 });

    vi.advanceTimersByTime(0);
    expect(estrellas(caja)).toBe(1);
    vi.advanceTimersByTime(1400);
    expect(estrellas(caja)).toBe(2);
    vi.advanceTimersByTime(5000);
    expect(estrellas(caja)).toBe(2);
  });

  it("lo que llega después se enciende a su hora o, si ya pasó, al llegar", async () => {
    const { caja } = await montarPiezas();
    vi.advanceTimersByTime(2000);
    const pieza = (ms: number) => {
      const nueva = document.createElement("p");
      nueva.dataset.encender = String(ms);
      return nueva;
    };
    const tarde = pieza(1000);
    const aTiempo = pieza(3000);

    await act(async () => caja.querySelector(".rr-dev")?.append(tarde, aTiempo));

    expect(opcionesDe(tarde)?.delay).toBe(DESPUES);
    expect(opcionesDe(aTiempo)?.delay).toBe(1000 + DESPUES);
  });

  it("si el sistema pide menos movimiento, el contenido está desde el principio", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const { caja } = await montarPiezas();
    vi.advanceTimersByTime(10000);

    expect(llamadas).toEqual([]);
    expect(estrellas(caja)).toBe(0);
  });

  it("en Inicio va primero la foto y al final el carrusel, y el vidrio de los datos aparece sin estrella", async () => {
    const { caja } = await navegar("/");
    const horas = [...caja.querySelectorAll("main [data-encender]")].map(hora);

    expect(hora(caja.querySelector(".anillo-foto")?.closest("[data-encender]"))).toBe(Math.min(...horas));
    expect(hora(caja.querySelector(".marquesina")?.closest("[data-encender]"))).toBe(Math.max(...horas));
    expect(caja.querySelector("[data-sin-estrella]")?.querySelector("ul li")).not.toBeNull();
  });

  it("la línea de cada constelación llega a cada logo cuando su estrella brilla más", async () => {
    const { caja } = await navegar("/");
    const lineas = caja.querySelectorAll<SVGElement>("main polyline[data-trazar]");
    expect(lineas).toHaveLength(2);

    for (const linea of lineas) {
      const logos = [...linea.closest("div")!.querySelectorAll("li")].map(hora);
      const desde = Number(linea.dataset.trazar);
      const durante = Number(linea.dataset.durante);
      logos.slice(1).forEach((logo, i) => {
        // Los logos están a la misma distancia sobre la línea: la recorre de a tramos iguales
        const llega = desde + (durante * (i + 1)) / (logos.length - 1);
        expect(Math.abs(llega - (logo + 0.3 * ESTRELLA))).toBeLessThan(100);
      });
    }
  });
});

describe("cielo del inicio", () => {
  const cielo = (caja: Element) => ({
    estrellas: caja.querySelectorAll(".estrellas > span").length,
    aurora: caja.querySelectorAll(".aurora > span").length,
    fugaz: caja.querySelectorAll(".estrella-fugaz").length,
    sol: caja.querySelectorAll(".sol").length,
    planetas: caja.querySelectorAll(".astro").length,
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
    const estrellas = armarEstrellas(405, 7);

    expect(estrellas).toHaveLength(405);
    expect(estrellas.every(({ x, y }) => x >= 0 && x <= 100 && y >= 0 && y <= 100)).toBe(true);
    expect(estrellas.some(({ destello }) => destello)).toBe(true);
    expect(estrellas.every(({ destello }) => destello)).toBe(false);
  });

  it("va en Inicio, Sobre mí, Habilidades, Proyectos, Contacto y el blog, con un planeta más en cada paso, y no en las demás páginas", async () => {
    const inicio = await navegar("/");
    expect(cielo(inicio.caja)).toEqual({ estrellas: 405, aurora: 3, fugaz: 1, sol: 1, planetas: 1 });

    const sobreMi = await navegar("/sobre-mi");
    expect(cielo(sobreMi.caja)).toEqual({ estrellas: 405, aurora: 3, fugaz: 1, sol: 1, planetas: 2 });

    const habilidades = await navegar("/habilidades");
    expect(cielo(habilidades.caja)).toEqual({ estrellas: 405, aurora: 3, fugaz: 1, sol: 1, planetas: 3 });

    const proyectos = await navegar("/proyectos");
    expect(cielo(proyectos.caja)).toEqual({ estrellas: 405, aurora: 3, fugaz: 1, sol: 1, planetas: 4 });

    const contacto = await navegar("/contacto");
    expect(cielo(contacto.caja)).toEqual({ estrellas: 405, aurora: 3, fugaz: 1, sol: 1, planetas: 5 });

    // Desde Saturno. Una publicación se ve desde el mismo lugar que el blog
    for (const ruta of ["/blog", "/blog/una-entrada"]) {
      const blog = await navegar(ruta);
      expect(cielo(blog.caja), ruta).toEqual({ estrellas: 405, aurora: 3, fugaz: 1, sol: 1, planetas: 6 });
    }

    for (const ruta of ["/proyectos/facturacion", "/no-existe"]) {
      const otra = await navegar(ruta);
      expect(cielo(otra.caja), ruta).toEqual({ estrellas: 0, aurora: 0, fugaz: 0, sol: 0, planetas: 0 });
    }
  });

  it("de Contacto al blog la cámara viaja hasta Saturno: el espacio no se desmonta y Júpiter queda atrás", async () => {
    const { caja } = await navegar("/contacto");
    const escena = caja.querySelector(".escena");
    const jupiter = caja.querySelector(".astro.jupiter");
    expect(caja.querySelector(".astro.saturno")).toBeNull();

    await clic([...caja.querySelectorAll("nav a")].find((a) => a.textContent === "Blog"));
    await hasta(() =>
      expect(caja.querySelector<HTMLElement>(".astros")?.style.getPropertyValue("--escala")).toBe(String(0.75 ** 5)),
    );

    expect(caja.querySelector(".escena")).toBe(escena);
    expect(caja.querySelector(".astro.jupiter")).toBe(jupiter);
    expect(caja.querySelector(".astro.saturno .planeta")).not.toBeNull();
  });

  it.each([
    ["/", 0, "mercurio"],
    ["/sobre-mi", 1, "venus"],
    ["/habilidades", 2, "tierra"],
    ["/proyectos", 3, "marte"],
    ["/contacto", 4, "jupiter"],
    ["/blog", 5, "saturno"],
  ])("en %s el sol se achica un paso más y de cerca va el planeta del apartado", async (ruta, paso, cerca) => {
    const { caja } = await navegar(ruta);
    const diametros = [...caja.querySelectorAll<HTMLElement>(".astro")].map((astro) => ({
      clase: astro.classList[1],
      diametro: parseFloat(astro.style.getPropertyValue("--diametro")),
    }));
    const masGrande = diametros.reduce((uno, otro) => (otro.diametro > uno.diametro ? otro : uno));

    expect(caja.querySelector<HTMLElement>(".astros")?.style.getPropertyValue("--escala")).toBe(String(0.75 ** paso));
    expect(masGrande.clase).toBe(cerca);
    expect(diametros.map(({ clase }) => clase)).toEqual(PLANETAS.slice(0, paso + 1).map(({ clase }) => clase));
  });

  it("al tocar otro apartado la cámara viaja: el espacio no se desmonta y el sol se achica de a poco", async () => {
    const { caja } = await navegar("/");
    const escena = caja.querySelector(".escena");
    const astros = caja.querySelector<HTMLElement>(".astros");
    const mercurio = caja.querySelector(".astro.mercurio");
    const escalas = new Set<string>();
    const anotar = setInterval(() => escalas.add(astros?.style.getPropertyValue("--escala") ?? ""), 50);

    await clic([...caja.querySelectorAll("nav a")].find((a) => a.textContent === "Sobre mí"));
    await hasta(() => expect(astros?.style.getPropertyValue("--escala")).toBe("0.75"));
    clearInterval(anotar);

    expect(caja.querySelector(".escena")).toBe(escena);
    expect(caja.querySelector(".astro.mercurio")).toBe(mercurio);
    expect(caja.querySelector(".astro.venus .planeta")).not.toBeNull();
    // Pasó por el medio: no saltó de un apartado al otro
    expect([...escalas].some((escala) => Number(escala) < 1 && Number(escala) > 0.75)).toBe(true);
  });

  it("Venus y Mercurio son decorativos; Venus, girando sobre su eje sin girar los píxeles, que lo empeoraba", async () => {
    const { caja } = await navegar("/sobre-mi");

    expect(caja.querySelector(".astro.venus")?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(VENUS.fotogramas).toHaveLength(72);
    expect(VENUS.giroPorFotograma).toBe(0);
  });

  it("Venus gira más rápido que los demás: con sus nubes suaves, a su ritmo parecía quieto", () => {
    expect(VENUS.vuelta).toBeGreaterThan(0);
    for (const otro of [MERCURIO, TIERRA, MARTE, JUPITER]) expect(VENUS.vuelta).toBeLessThan(otro.vuelta);
  });

  it("Saturno pasa sus 180 fotogramas de a uno, cada 70 ms: la luna da la vuelta en 12.6 s", () => {
    expect(SATURNO.fotogramas).toHaveLength(180);
    expect(SATURNO.deAUno).toBe(true);
    expect(MS_POR_CUADRO).toBe(70);
    expect(SATURNO.vuelta).toBeCloseTo(12.6);
  });

  it("el fotograma de Saturno sale del tiempo que pasó, no de contar cuadros, y al terminar vuelve al primero", () => {
    expect(cuadroEn(0, 180, 70)).toBe(0);
    expect(cuadroEn(69.9, 180, 70)).toBe(0);
    expect(cuadroEn(70, 180, 70)).toBe(1);
    // Si el navegador se trabó medio segundo, salta a donde corresponde: no se atrasa
    expect(cuadroEn(70 + 500, 180, 70)).toBe(8);
    expect(cuadroEn(179 * 70, 180, 70)).toBe(179);
    expect(cuadroEn(180 * 70, 180, 70)).toBe(0);
    // El primer cuadro puede llegar con una hora apenas anterior a la del arranque
    expect(cuadroEn(-3, 180, 70)).toBe(0);
  });

  it("con datos ahorrados o una conexión lenta, Saturno no baja sus fotogramas", () => {
    const con = (connection?: object) => {
      vi.stubGlobal("navigator", { ...navigator, connection });
      return conexionLenta();
    };

    expect(con()).toBe(false);
    expect(con({ effectiveType: "4g" })).toBe(false);
    expect(con({ effectiveType: "4g", saveData: true })).toBe(true);
    for (const lenta of ["slow-2g", "2g", "3g"]) expect(con({ effectiveType: lenta })).toBe(true);
  });

  it("la Tierra lleva sus satélites y, del lado de su noche, a la Luna", async () => {
    const { caja } = await navegar("/habilidades");
    const tierra = caja.querySelector(".astro.tierra");
    const satelites = tierra?.querySelectorAll(":scope > .satelites > img.satelite") ?? [];

    expect(TIERRA.fotogramas).toHaveLength(72);
    expect(satelites).toHaveLength(2);
    expect([...satelites].every((satelite) => satelite.getAttribute("alt") === "")).toBe(true);
    expect(tierra?.querySelector(":scope > .luna-noche > .planeta img")?.getAttribute("alt")).toBe("");
    expect(LUNA.fotogramas).toHaveLength(72);
    // Siempre le muestra la misma cara a la Tierra: no gira sobre su eje
    expect(LUNA.vuelta).toBe(0);
  });

  it("Marte y Júpiter giran sobre su eje en 72 fotogramas; Júpiter, sin girar los píxeles", () => {
    expect(MARTE.fotogramas).toHaveLength(72);
    expect(JUPITER.fotogramas).toHaveLength(72);
    // Medido: girar los píxeles de Júpiter entre fotogramas empeoraba la mezcla
    expect(JUPITER.giroPorFotograma).toBe(0);
  });

  it("el sol es decorativo, oculto para los lectores de pantalla", async () => {
    const { caja } = await navegar("/");
    const foto = caja.querySelector(".sol img");

    expect(foto?.getAttribute("alt")).toBe("");
    expect(foto?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("el sol da una vuelta completa en 2 minutos, y al terminar vuelve al primer fotograma", () => {
    expect(SOL.fotogramas).toHaveLength(72);
    expect(posicionEn(0, SOL)).toEqual({ indice: 0, avance: 0 });
    expect(posicionEn(5 / 6, SOL).indice).toBe(0);
    expect(posicionEn(5 / 6, SOL).avance).toBeCloseTo(0.5);
    expect(posicionEn(5 / 3, SOL).indice).toBe(1);
    expect(posicionEn(119.5, SOL).indice).toBe(71);
    expect(posicionEn(120, SOL)).toEqual({ indice: 0, avance: 0 });
  });

  it("las llamas del sol son lenguas: en cada capa hay picos y valles, siempre entre 0 y 1", () => {
    for (const capa of [0, 1, 2]) {
      for (const segundos of [0, 3.7, 40]) {
        const alturas = Array.from({ length: 360 }, (_, grado) => alturaLlama((grado * Math.PI) / 180, segundos, capa));

        expect(Math.min(...alturas)).toBeGreaterThanOrEqual(0);
        expect(Math.min(...alturas)).toBeLessThan(0.1);
        expect(Math.max(...alturas)).toBeGreaterThan(0.9);
        expect(Math.max(...alturas)).toBeLessThanOrEqual(1);
      }
    }
  });

  it("las llamas del sol cambian con el tiempo", () => {
    expect(alturaLlama(1, 0)).not.toBeCloseTo(alturaLlama(1, 0.5));
  });

  it("Mercurio se ve de cerca, decorativo y girando sobre su eje en 72 fotogramas", async () => {
    const { caja } = await navegar("/");
    const mercurio = caja.querySelector(".astro.mercurio");

    expect(MERCURIO.fotogramas).toHaveLength(72);
    expect(mercurio?.querySelector(".planeta img")?.getAttribute("alt")).toBe("");
    expect(mercurio?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("sin canvas queda la foto del sol a la vista", async () => {
    const { caja } = await navegar("/");

    expect(caja.querySelector<HTMLElement>(".sol img")?.style.visibility).toBe("");
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

describe("cámara del espacio", () => {
  // El sol, debajo del botón del CV o de la hamburguesa, como en la página
  const ESCRITORIO = { ancho: 1440, alto: 840, solX: 1293, solY: 51 + 31 + 0.371 * 216 };
  const CELULAR = { ancho: 390, alto: 844, solX: 347, solY: 57 + 31 + 0.371 * 150 };
  const seVe = ({ x, y, diametro }: { x: number; y: number; diametro: number }, { ancho, alto }: typeof ESCRITORIO) =>
    Math.hypot(x - Math.min(Math.max(x, 0), ancho), y - Math.min(Math.max(y, 0), alto)) < diametro / 2;

  it("cada apartado tiene su paso, y las demás páginas no tienen espacio", () => {
    expect(["/", "/sobre-mi", "/habilidades", "/proyectos", "/contacto/"].map(pasoDe)).toEqual([0, 1, 2, 3, 4]);
    // Una publicación se ve desde el mismo lugar que el blog
    expect(["/blog", "/blog/", "/blog/una-entrada"].map(pasoDe)).toEqual([5, 5, 5]);
    expect(["/proyectos/facturacion", "/blogs", "/__proto__", "/toString"].map(pasoDe)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });

  it("de cerca, el planeta asoma abajo a la izquierda, con el centro fuera de la pantalla", () => {
    for (const numero of [0, 1, 2, 3, 4]) {
      const { x, y, diametro } = ubicacion(numero, numero, ESCRITORIO);
      expect(diametro).toBeCloseTo(1440 * 0.46);
      expect(x).toBeCloseTo(1440 * 0.12);
      expect(y).toBeCloseTo(840 + diametro * 0.05);
    }
    expect(ubicacion(0, 0, CELULAR).diametro).toBeCloseTo(420);
  });

  it("los que quedaron atrás van en la línea hacia el sol, cada vez más cerca de él y más chicos", () => {
    const tramos = [0.72, 0.86, 0.91, 0.93, 0.945];
    const tamanos = [0.52, 0.36, 0.26, 0.19, 0.15];
    const cerca = ubicacion(0, 0, ESCRITORIO);
    tramos.forEach((tramo, i) => {
      const paso = i + 1;
      const { x, y, diametro } = ubicacion(0, paso, ESCRITORIO);
      expect(x).toBeCloseTo(cerca.x + (ESCRITORIO.solX - cerca.x) * tramo);
      expect(y).toBeCloseTo(cerca.y + (ESCRITORIO.solY - cerca.y) * tramo);
      expect(diametro).toBeCloseTo(216 * 0.75 ** paso * tamanos[i]!);
    });
    // La Tierra, con su Luna, va más cerca un paso atrás
    expect(ubicacion(2, 3, ESCRITORIO).diametro).toBeCloseTo(216 * 0.75 ** 3 * 0.8);
  });

  it("el planeta que viene llega desde detrás nuestro: se dibuja recién cuando está por entrar, fuera de la pantalla", () => {
    for (const pantalla of [ESCRITORIO, CELULAR]) {
      for (const numero of [1, 2, 3, 4]) {
        expect(seDibuja(numero, numero - 1)).toBe(false);
        expect(seDibuja(numero, numero - 0.99)).toBe(true);
        expect(seVe(ubicacion(numero, numero - 0.99, pantalla), pantalla)).toBe(false);
        expect(seVe(ubicacion(numero, numero - 0.3, pantalla), pantalla)).toBe(true);
      }
    }
  });

  it("Saturno llega desde detrás de la cámara: un paso antes no asoma nada, ni sus anillos ni su luna", () => {
    // Lo que tiene algo dibujado en sus 180 fotogramas (de 1600 × 892, con el disco en 807, 427.7 y un radio de 250.3)
    const asoma = (paso: number, pantalla: typeof ESCRITORIO) => {
      const { x, y, diametro } = ubicacion(5, paso, pantalla);
      const escala = diametro / 500.6;
      const giro = Math.atan2(pantalla.solY - y, pantalla.solX - x);
      let dentro = 0;
      for (let u = 56; u <= 1555; u += 20) {
        for (let v = 27; v <= 828; v += 20) {
          const px = x + escala * ((u - 807) * Math.cos(giro) - (v - 427.7) * Math.sin(giro));
          const py = y + escala * ((u - 807) * Math.sin(giro) + (v - 427.7) * Math.cos(giro));
          if (px >= 0 && px <= pantalla.ancho && py >= 0 && py <= pantalla.alto) dentro++;
        }
      }
      return dentro;
    };
    for (const pantalla of [ESCRITORIO, CELULAR]) {
      expect(seDibuja(5, 4)).toBe(false);
      expect(asoma(4.01, pantalla)).toBe(0);
      expect(asoma(4.4, pantalla)).toBeGreaterThan(0);
    }
  });

  it("cinco pasos atrás, desde Saturno, Mercurio no queda metido en las llamas del sol", () => {
    for (const pantalla of [ESCRITORIO, CELULAR]) {
      const { x, y, diametro } = ubicacion(0, 5, pantalla);
      const sol = Math.min(Math.max(150, pantalla.ancho * 0.15), 300) * escalaSol(5);
      // Las llamas miden 1.8 veces el sol
      expect(Math.hypot(x - pantalla.solX, y - pantalla.solY) - diametro / 2).toBeGreaterThan(sol * 0.9);
    }
  });

  it("al alejarse, cada planeta se achica y se acerca al sol sin saltos", () => {
    for (const numero of [0, 2]) {
      const camino = Array.from({ length: 601 }, (_, i) => ubicacion(numero, numero - 1 + i / 100, ESCRITORIO));
      const hastaElSol = camino.map(({ x, y }) => Math.hypot(x - ESCRITORIO.solX, y - ESCRITORIO.solY));

      camino.slice(1).forEach((punto, i) => {
        expect(punto.diametro).toBeLessThan(camino[i]!.diametro);
        expect(hastaElSol[i + 1]).toBeLessThan(hastaElSol[i]!);
        // En un centésimo de paso nunca se corre más de 40px
        expect(Math.hypot(punto.x - camino[i]!.x, punto.y - camino[i]!.y)).toBeLessThan(40);
      });
    }
  });

  it("la curva pasa por los puntos de la tabla sin pasarse de ellos", () => {
    const ys = [3, 1, 0.5, 0.4];
    [0, 1, 2, 3].forEach((x) => expect(curva([0, 1, 2, 3], ys, x)).toBeCloseTo(ys[x]!));
    const valores = Array.from({ length: 301 }, (_, i) => curva([0, 1, 2, 3], ys, i / 100));
    expect(valores.every((valor, i) => i === 0 || valor <= valores[i - 1]!)).toBe(true);
    expect(curva([0, 1, 2, 3], ys, 9)).toBe(0.4);
  });

  it("un paso tarda 1.6 segundos y cada paso de más, medio segundo; arranca y frena despacio", () => {
    expect(duracion(0, 1)).toBeCloseTo(1.6);
    expect(duracion(4, 0)).toBeCloseTo(3.1);
    expect([0, 0.5, 1].map(suavizar)).toEqual([0, 0.5, 1]);
    expect(suavizar(0.1)).toBeLessThan(0.1);
    expect(suavizar(0.9)).toBeGreaterThan(0.9);
  });
});

describe("satélites", () => {
  const RADIO = 300;
  const [grande] = SATELITES_CERCA;
  const TODOS = [...SATELITES_CERCA, ...SATELITES_LEJOS];
  const muestras = (vuelta: number) => Array.from({ length: 72 }, (_, i) => (i / 72) * vuelta);
  const grados = (angulo: number) => (((angulo % 360) + 360) % 360);

  it("no giran sobre sí mismos: las antenas miran siempre al centro de la Tierra", () => {
    for (const satelite of TODOS) {
      const desfasajes = muestras(satelite.vuelta).map((segundos) => {
        const { x, y, giro } = enOrbita(satelite, segundos, RADIO, 0);
        return grados((Math.atan2(-y, -x) * 180) / Math.PI - giro);
      });
      for (const desfasaje of desfasajes) expect(desfasaje).toBeCloseTo(desfasajes[0]!, 6);
    }
  });

  it("dan una vuelta en su tiempo, pasando por delante y por detrás de la Tierra", () => {
    const satelite = grande!;
    const inicio = enOrbita(satelite, 0, RADIO, 0);
    const vuelta = enOrbita(satelite, satelite.vuelta, RADIO, 0);
    const recorrido = muestras(satelite.vuelta).map((segundos) => enOrbita(satelite, segundos, RADIO, 0));

    expect(vuelta.x).toBeCloseTo(inicio.x, 6);
    expect(vuelta.y).toBeCloseTo(inicio.y, 6);
    expect(recorrido.some(({ adelante }) => adelante)).toBe(true);
    expect(recorrido.some(({ adelante }) => !adelante)).toBe(true);
    expect(recorrido.every(({ escala }) => escala >= 0.85 && escala <= 1)).toBe(true);
  });

  it("los de más afuera tardan más en dar la vuelta, y de lejos son los mismos: tardan lo mismo", () => {
    for (const satelites of [SATELITES_CERCA, SATELITES_LEJOS]) {
      const porOrbita = [...satelites].sort((a, b) => a.orbita - b.orbita);
      expect(porOrbita.map(({ vuelta }) => vuelta)).toEqual([...porOrbita.map(({ vuelta }) => vuelta)].sort((a, b) => a - b));
    }
    expect(SATELITES_LEJOS.map(({ tipo, vuelta }) => [tipo, vuelta])).toEqual(
      SATELITES_CERCA.map(({ tipo, vuelta }) => [tipo, vuelta]),
    );
  });

  it("al alejarse la cámara pasan de cerca a lejos sin saltos: el mismo plano y el mismo lugar de partida", () => {
    const igual = (unos: typeof SATELITES_CERCA, otros: typeof SATELITES_CERCA) =>
      unos.forEach((uno, i) =>
        (["ancho", "orbita", "aplastada", "plano", "fase", "vuelta"] as const).forEach((campo) =>
          expect(uno[campo]).toBeCloseTo(otros[i]![campo]),
        ),
      );
    igual(mezclar(0), SATELITES_CERCA);
    igual(mezclar(1), SATELITES_LEJOS);
    expect(SATELITES_LEJOS.map(({ plano, fase }) => [plano, fase])).toEqual(SATELITES_CERCA.map(({ plano, fase }) => [plano, fase]));
    const [medio] = mezclar(0.5);
    expect(medio?.ancho).toBeCloseTo((SATELITES_CERCA[0]!.ancho + SATELITES_LEJOS[0]!.ancho) / 2);
  });

  it("de cerca van en órbita baja, cerca del borde de la Tierra", () => {
    expect(SATELITES_CERCA.every(({ orbita }) => orbita > 1 && orbita < 1.2)).toBe(true);
  });

  it("arrancan tapados enteros por la Tierra y salen de detrás de ella en menos de medio minuto", () => {
    for (const satelite of TODOS) {
      // Hasta dónde lo tapa la Tierra entero: su imagen mide `ancho` diámetros
      const tapado = (segundos: number, borde = RADIO) => {
        const { x, y, adelante } = enOrbita(satelite, segundos, RADIO, 0);
        return !adelante && Math.hypot(x, y) < borde;
      };
      const sale = Array.from({ length: 300 }, (_, decima) => decima / 10).find((segundos) => !tapado(segundos));

      expect(tapado(0, RADIO * (1 - satelite.ancho))).toBe(true);
      expect(sale).toBeGreaterThan(2);
      expect(sale).toBeLessThan(25);
    }
  });

  it("con menos movimiento quedan quietos afuera de la Tierra, donde se los ve", () => {
    for (const satelite of TODOS) {
      const { x, y } = enOrbita(satelite, afuera(satelite), RADIO, 0);
      expect(Math.hypot(x, y)).toBeGreaterThan(RADIO);
    }
  });

  it("de lejos pasan por delante de la Tierra y se esconden detrás", () => {
    for (const satelite of SATELITES_LEJOS) {
      const recorrido = muestras(satelite.vuelta).map((segundos) => enOrbita(satelite, segundos, RADIO, 0));
      const sobreLaTierra = ({ x, y }: { x: number; y: number }) => Math.hypot(x, y) < RADIO;

      expect(recorrido.some((punto) => punto.adelante && sobreLaTierra(punto))).toBe(true);
      expect(recorrido.some((punto) => !punto.adelante && sobreLaTierra(punto))).toBe(true);
      // Y nunca se van más lejos que la Luna, a 2.2 radios
      expect(recorrido.every(({ x, y }) => Math.hypot(x, y) < RADIO * 2.2)).toBe(true);
    }
  });

  it("se apagan en la sombra de la Tierra, que cae del lado opuesto al sol", () => {
    // El sol, a la derecha de la Tierra
    const recorrido = muestras(grande!.vuelta).map((segundos) => enOrbita(grande!, segundos, RADIO, 0));
    const enSombra = recorrido.filter(({ enSombra }) => enSombra);

    expect(enSombra.length).toBeGreaterThan(0);
    expect(enSombra.length).toBeLessThan(recorrido.length / 2);
    expect(enSombra.every(({ x }) => x < 0)).toBe(true);
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

    // La única imagen con texto: el sol, que también es una imagen, es decorativo
    await hasta(() => expect(otra.caja.querySelector('main img:not([alt=""])')?.getAttribute("alt")).toBe("Mi retrato"));
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
