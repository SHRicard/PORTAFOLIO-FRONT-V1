import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { createMemoryRouter, MemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { router } from "@/app/router";
import { makeStore } from "@/app/store";
import { PublicLayout } from "@/components/layout/PublicLayout";
import type { Entrada } from "@/features/blog/types";
import type { Estudio, Experiencia, Perfil, Proyecto } from "@/features/portafolio/types";
import { portafolioApi } from "@/features/portafolio/portafolioApi";
import { setModoVista } from "@/features/theme/modoVistaSlice";
import { setPaleta } from "@/features/theme/themeSlice";
import { VISTAS } from "@/vistas";
import { rrDev } from "@/vistas/rr-dev";
import { ThemeToggle } from "@/vistas/rr-dev/components/atoms/ThemeToggle";
import { Briefcase, GraduationCap, Monitor, School, Server, Sparkles, Users } from "lucide-react";
import { ShootingStar } from "@/vistas/rr-dev/components/atoms/ShootingStar";
import { apartado } from "@/vistas/rr-dev/components/molecules/FactConstellation";
import { armarEstrellas } from "@/vistas/rr-dev/components/atoms/StarField";
import { IslandNavbar } from "@/vistas/rr-dev/components/organisms/IslandNavbar";
import { NAV_SHEET_ID } from "@/vistas/rr-dev/components/organisms/NavSheet";
import { SectionReveal } from "@/vistas/rr-dev/components/organisms/SectionReveal";
import { DESPUES, ESTRELLA, FUNDIDO, PIEZA } from "@/vistas/rr-dev/hooks/useEncendido";
import { tramo } from "@/vistas/rr-dev/hooks/useIndicadorDeslizante";
import { tapa } from "@/vistas/rr-dev/hooks/useSobrePlaneta";
import { categoriasCon, type DatoCurioso, estudiosDe, iconoDato, repartirDatos, trabajosDe } from "@/vistas/rr-dev/sobreMi";
import { JUPITER, LUNA, MARTE, MERCURIO, MS_POR_CUADRO, SATURNO, SOL, TIERRA, VENUS } from "@/vistas/rr-dev/astros";
import {
  busquedaDelBlog,
  documentosDe,
  dominio,
  fotosDe,
  hashtag,
  numerosDePagina,
  paginaDe,
  partesDelTitulo,
  temasDe,
} from "@/vistas/rr-dev/blog";
import { conexionLenta, cuadroEn } from "@/vistas/rr-dev/cuadros";
import { cuantasFormas, formasDeEscribir, formasDeSeguir, partirMensaje, sinProtocolo, soloDigitos } from "@/vistas/rr-dev/contacto";
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
import {
  aniosDeExperiencia,
  armarEstadisticas,
  SERVICIOS,
  TEXTOS_CONTACTO,
  TEXTOS_HABILIDADES,
  TEXTOS_PROYECTOS,
} from "@/vistas/rr-dev/contenido";
import { armarAreas, medidasPara, PASO_MAXIMO, pasoParejo, repartirColumnas } from "@/vistas/rr-dev/habilidades";
import { LOGOS_RED, LOGOS_TECNOLOGIA, logoTecnologia } from "@/vistas/rr-dev/logos";
import { alturaLlama } from "@/vistas/rr-dev/llamas";
import { ACCESO_ESCONDIDO, ITEMS_MENU, seccionActiva, sumarToque } from "@/vistas/rr-dev/navegacion";
import {
  busquedaDeProyectos,
  iniciales,
  LUGARES_PROYECTOS,
  paginasDeProyectos,
  porPaginaDe,
  proyectosDeLaPagina,
  repartirProyectos,
  tecnologiasConLogo,
  tecnologiasOcultas,
  tonoProyecto,
} from "@/vistas/rr-dev/proyectos";
import { intervaloDeDibujo, posicionEn, usarChicos } from "@/vistas/rr-dev/rotacion";
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
  contacto: {
    correo: "contacto@mail.com",
    telefono: null,
    redes: [],
    mensaje: "",
    abiertoA: [],
    tiempoRespuesta: "",
    horario: "",
    agenda: null,
  },
  habilidades: [],
  idiomas: [],
  datosCuriosos: [],
  foto: null,
  cv: null,
  createdAt: "2026-10-30T12:00:00.000Z",
  updatedAt: "2026-10-30T12:00:00.000Z",
  vista: null,
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

/**
 * La web pública no dibuja ninguna vista hasta saber cuál eligió el administrador: se espera a que
 * llegue el perfil y a que se vaya el fondo liso de la espera
 */
async function esperarPerfil(store: ReturnType<typeof makeStore>, caja: HTMLElement) {
  const listo = () => {
    expect(portafolioApi.endpoints.getPerfil.select()(store.getState()).status).not.toBe("pending");
    expect(caja.querySelector(":scope > .min-h-screen.bg-fondo:empty")).toBeNull();
  };
  try {
    listo();
    return; // Ya está (o no pide el perfil): sin esperar, que con relojes simulados esperar los adelanta
  } catch {
    await vi.waitFor(listo, { timeout: 3000, interval: 5 });
    await act(async () => {});
  }
}

async function montar(ui: ReactNode, ruta = "/", { sinEsperar = false } = {}) {
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
  if (!sinEsperar) await esperarPerfil(store, caja);
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

  it("el botón de tema recorre los modos de mi.universo y vuelve al primero, sin tocar el tema del panel", async () => {
    const { caja, store } = await montar(<IslandNavbar />);
    const boton = () => caja.querySelector('button[aria-label^="Cambiar a"]');
    const panel = store.getState().theme;
    const { modos } = rrDev.tema;

    expect(store.getState().modoVista["rr-dev"]).toBeUndefined();

    for (const modo of [...modos.slice(1), modos[0]!]) {
      expect(boton()?.getAttribute("aria-label")).toBe(`Cambiar a ${modo.nombre}`);
      await clic(boton());
      expect(store.getState().modoVista["rr-dev"]).toBe(modo.id);
    }
    expect(store.getState().theme).toEqual(panel);
  });

  it("un portafolio con un solo modo no tiene botón de tema", async () => {
    servidor(null, { vista: "basica" });
    const { caja } = await montar(<ThemeToggle etiqueta="Cambiar a" />);

    await hasta(() => expect(caja.querySelector("button")).toBeNull());
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

describe("acceso escondido al login", () => {
  /** La isla en Inicio, con el login como otra ruta, para ver a dónde lleva el logo */
  async function montarConLogin() {
    const store = makeStore();
    const enrutador = createMemoryRouter(
      [
        { path: "/", element: <IslandNavbar /> },
        { path: "/login", element: <p>Ingresar</p> },
      ],
      { initialEntries: ["/"] },
    );
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
    return { caja, ruta: () => enrutador.state.location.pathname };
  }
  const logo = (caja: Element) => [...caja.querySelectorAll("header a")].find((a) => a.textContent === "Ricardo Ramirez");
  const tocarLogo = async (caja: Element, veces: number) => {
    for (let vez = 0; vez < veces; vez++) await clic(logo(caja));
  };

  it("7 toques seguidos al logo llevan al login", async () => {
    const { caja, ruta } = await montarConLogin();

    await tocarLogo(caja, ACCESO_ESCONDIDO.toques);

    await hasta(() => expect(ruta()).toBe("/login"));
    expect(caja.textContent).toBe("Ingresar");
  });

  it("con menos se queda en Inicio, y con cada toque cruza un cometa que después se va", async () => {
    const { caja, ruta } = await montarConLogin();

    await tocarLogo(caja, 6);

    expect(ruta()).toBe("/");
    expect(caja.querySelectorAll(".cometa-logo")).toHaveLength(6);
    // La cabeza y la cola, y nada que lea un lector de pantalla
    expect(caja.querySelector(".cometa-logo")?.getAttribute("aria-hidden")).toBe("true");
    expect(caja.querySelectorAll(".cometa-logo > .cabeza, .cometa-logo > .cola")).toHaveLength(12);
    await hasta(() => expect(caja.querySelectorAll(".cometa-logo")).toHaveLength(0));
  });

  it("una pausa de más de un segundo vuelve a empezar la cuenta", async () => {
    let ahora = 0;
    vi.spyOn(performance, "now").mockImplementation(() => ahora);
    const { caja, ruta } = await montarConLogin();
    const tocarCada = async (ms: number, veces: number) => {
      for (let vez = 0; vez < veces; vez++) {
        ahora += ms;
        await clic(logo(caja));
      }
    };

    await tocarCada(300, 6);
    await tocarCada(1500, 1);
    expect(ruta()).toBe("/");

    await tocarCada(900, 6);
    await hasta(() => expect(ruta()).toBe("/login"));
  });

  it("cuenta los toques seguidos y vuelve a 1 después de la pausa", () => {
    expect(sumarToque(0, -Infinity, 0)).toBe(1);
    expect(sumarToque(3, 1000, 2000)).toBe(4);
    expect(sumarToque(6, 1000, 2001)).toBe(1);
  });
});

describe("login: el amanecer", () => {
  it("muestra el saludo con mi nombre, el formulario y el sol, sin registro", async () => {
    const { caja } = await navegar("/login");
    await hasta(() => expect(caja.querySelector("h1")?.textContent).toBe("Hola de nuevo, Ricardo"));

    expect(caja.querySelector(".amanecer .sol-amanecer .sol")).not.toBeNull();
    expect(caja.querySelector<HTMLInputElement>("#correo")?.type).toBe("email");
    expect(caja.querySelector<HTMLInputElement>("#password")?.type).toBe("password");
    expect(caja.querySelector('button[type="submit"]')?.textContent).toBe("Ingresar");
    expect(caja.querySelector('a[href="/register"]')).toBeNull();
    expect(caja.textContent).not.toMatch(/registr/i);
  });

  it("arriba, el logo con su cometa al llegar y «Volver al inicio»", async () => {
    const { caja } = await navegar("/login");
    await hasta(() => expect(caja.querySelector("header")).not.toBeNull());

    const enlaces = [...caja.querySelectorAll("header a")];
    expect(enlaces.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Ricardo Ramirez", "/"],
      ["Volver al inicio", "/"],
    ]);
    await hasta(() => expect(caja.querySelectorAll("header .cometa-logo")).toHaveLength(1));
  });

  it("la página de registro ya no existe", async () => {
    const { caja } = await navegar("/register");

    await hasta(() => expect(caja.textContent).toContain(NO_EXISTE));
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
  // La vista la elige el perfil: se le suma a la respuesta de /perfil que esté simulada
  if (vista) {
    const anterior = globalThis.fetch;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (req: Request) => {
        const res = await anterior(req);
        if (!new URL(req.url).pathname.endsWith("/perfil")) return res;
        const { data } = await res.json();
        return respuesta({ perfil: { ...data.perfil, vista } });
      }),
    );
  }
  const store = makeStore();
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
  await esperarPerfil(store, caja);
  return { caja, enrutador };
}

const NO_EXISTE = "Esta página no existe";

/** La n más nueva: la 1 es la de hoy y cada una es un día más vieja */
const entradaDePrueba = (n: number): Entrada => ({
  id: String(n),
  titulo: `Publicación ${n}`,
  slug: `publicacion-${n}`,
  resumen: `Resumen ${n}`,
  contenido: `Primer párrafo de la ${n}.\n\nSegundo párrafo.`,
  portada: { url: `https://res.cloudinary.com/x/${n}.webp`, alt: `Foto ${n}` },
  galeria: [],
  documentos: n === 1 ? [{ url: "https://arxiv.org/pdf/1", titulo: "Paper" }] : [],
  etiquetas: ["Inteligencia artificial", "React"],
  estado: "publicado",
  publicadoEn: new Date(Date.UTC(2026, 9, 30 - n, 12)).toISOString(),
  createdAt: "2026-10-01T12:00:00.000Z",
  updatedAt: "2026-10-01T12:00:00.000Z",
});

/** Un backend con `cantidad` publicaciones que pagina como el real. Devuelve las URL de las listas que se pidieron */
function servidorDelBlog(cantidad: number) {
  const todas = Array.from({ length: cantidad }, (_, i) => entradaDePrueba(i + 1));
  const listas: URL[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async ({ url }: Request) => {
      const direccion = new URL(url);
      if (direccion.pathname.endsWith("/perfil")) return respuesta({ perfil });
      const slug = direccion.pathname.match(/\/blog\/([^/]+)$/)?.[1];
      if (slug) {
        const entrada = todas.find((e) => e.slug === decodeURIComponent(slug));
        if (entrada) return respuesta({ entrada });
        return new Response(JSON.stringify({ ok: false, message: "No existe" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        });
      }
      if (direccion.pathname.endsWith("/blog")) {
        listas.push(direccion);
        const page = Number(direccion.searchParams.get("page") ?? 1);
        const limit = Number(direccion.searchParams.get("limit") ?? 20);
        const entradas = todas.slice((page - 1) * limit, page * limit).map(({ contenido: _contenido, ...resto }) => resto);
        const paginacion = { page, limit, total: cantidad, paginas: Math.max(1, Math.ceil(cantidad / limit)) };
        return respuesta({ entradas, paginacion });
      }
      const clave = ["proyectos", "experiencia"].find((nombre) => url.includes(nombre)) ?? "estudios";
      return respuesta({ [clave]: [], paginacion: { paginas: 1 } });
    }),
  );
  return listas;
}

const PAGINADO = "nav[aria-label='Páginas del blog']";
const DE_LA_PAGINA = "ul[aria-label='Publicaciones de esta página']";
const blog = (caja: Element) => caja.querySelector("main section[aria-label='Publicaciones']");
/** El título de la publicación del centro */
const alCentro = (caja: Element) => blog(caja)?.querySelector("article h2")?.textContent;
/** Los botones de la constelación, como se ven en pantallas anchas: el lado izquierdo y después el derecho */
const constelacion = (caja: Element) => [
  ...(blog(caja)?.querySelectorAll<HTMLButtonElement>(`${DE_LA_PAGINA} button:not([aria-label])`) ?? []),
];
/** Los botones de la fila de burbujas que reemplaza a la constelación en celular */
const fila = (caja: Element) => [
  ...(blog(caja)?.querySelectorAll<HTMLButtonElement>(`${DE_LA_PAGINA} button[aria-label^='Ver: ']`) ?? []),
];
/** El título de un botón de la constelación: va al final, debajo de la fecha */
const tituloDe = (boton: Element) => boton.lastElementChild?.lastElementChild?.textContent;
const titulos = (caja: Element) => constelacion(caja).map(tituloDe);
const presionadas = (caja: Element) =>
  constelacion(caja)
    .filter((boton) => boton.getAttribute("aria-pressed") === "true")
    .map(tituloDe);
const pedidas = (listas: URL[]) => listas.map((url) => [url.searchParams.get("page"), url.searchParams.get("limit")]);

describe("blog de la vista RR-DEV", () => {
  it("abre con la más nueva al centro y las de la página alrededor, de a 6", async () => {
    const listas = servidorDelBlog(5);
    const { caja } = await navegar("/blog");

    await hasta(() => expect(alCentro(caja)).toBe("Publicación 1"));

    // Tres a la izquierda y dos a la derecha; la del centro también está en la constelación, marcada
    expect(titulos(caja)).toEqual(["Publicación 1", "Publicación 2", "Publicación 3", "Publicación 4", "Publicación 5"]);
    expect(presionadas(caja)).toEqual(["Publicación 1"]);
    expect(fila(caja)).toHaveLength(5);
    expect(blog(caja)?.textContent).toContain("Lo último del blog");
    expect(pedidas(listas)).toContainEqual(["1", "6"]);
    // Una sola página: el paginado se ve igual, con las flechas apagadas y sin enlaces
    expect(caja.querySelector(PAGINADO)?.textContent).toContain("Página 1 de 1");
    expect(caja.querySelector(`${PAGINADO} [aria-current="page"]`)?.textContent).toBe("1");
    expect(caja.querySelectorAll(`${PAGINADO} [aria-disabled="true"]`)).toHaveLength(2);
    expect(caja.querySelector(`${PAGINADO} a`)).toBeNull();
  });

  it("tocar una de alrededor la pasa al centro sin cambiar la URL ni volver a pedir la página", async () => {
    const listas = servidorDelBlog(5);
    const { caja, enrutador } = await navegar("/blog");
    await hasta(() => expect(alCentro(caja)).toBe("Publicación 1"));
    const pedidasAntes = listas.length;

    await clic(constelacion(caja).find((boton) => tituloDe(boton) === "Publicación 4"));

    expect(alCentro(caja)).toBe("Publicación 4");
    expect(presionadas(caja)).toEqual(["Publicación 4"]);
    expect(fila(caja).filter((boton) => boton.getAttribute("aria-pressed") === "true").map((b) => b.title)).toEqual([
      "Publicación 4",
    ]);
    // «Lo último» es solo de la más nueva
    expect(blog(caja)?.textContent).not.toContain("Lo último del blog");
    expect(enrutador.state.location.search).toBe("");
    expect(listas).toHaveLength(pedidasAntes);

    // La fila de burbujas del celular hace lo mismo
    await clic(fila(caja).find((boton) => boton.title === "Publicación 2"));
    expect(alCentro(caja)).toBe("Publicación 2");
  });

  it("el paginado marca la actual y lleva a las demás; en cada página, el centro vuelve a la primera", async () => {
    const listas = servidorDelBlog(14);
    const { caja, enrutador } = await navegar("/blog");

    await hasta(() => expect(caja.querySelector(PAGINADO)).not.toBeNull());
    expect(caja.querySelector(PAGINADO)?.textContent).toContain("Página 1 de 3");
    expect(caja.querySelector(`${PAGINADO} [aria-current="page"]`)?.textContent).toBe("1");
    expect(caja.querySelector(`${PAGINADO} a[rel="prev"]`)).toBeNull();
    await clic(constelacion(caja)[2]);
    expect(alCentro(caja)).toBe("Publicación 3");

    await clic(caja.querySelector(`${PAGINADO} a[aria-label="Página 2"]`));

    expect(enrutador.state.location.search).toBe("?pagina=2");
    await hasta(() => expect(alCentro(caja)).toBe("Publicación 7"));
    expect(titulos(caja)).toEqual(["Publicación 7", "Publicación 8", "Publicación 9", "Publicación 10", "Publicación 11", "Publicación 12"]);
    expect(caja.querySelector(PAGINADO)?.textContent).toContain("Página 2 de 3");
    expect(caja.querySelector(`${PAGINADO} [aria-current="page"]`)?.textContent).toBe("2");
    expect(blog(caja)?.textContent).not.toContain("Lo último del blog");
    expect(pedidas(listas)).toContainEqual(["2", "6"]);
  });

  it("una página que no existe lo avisa y lleva a la primera", async () => {
    servidorDelBlog(5);
    const { caja } = await navegar("/blog?pagina=7");

    await hasta(() => expect(blog(caja)?.textContent).toContain("Esa página no existe."));
    expect(blog(caja)?.querySelector("a")?.getAttribute("href")).toBe("/blog");
  });

  it("la del centro se abre en un panel encima, sin cambiar de ruta, y Escape la cierra", async () => {
    servidorDelBlog(3);
    const { caja, enrutador } = await navegar("/blog");
    await hasta(() => expect(alCentro(caja)).toBe("Publicación 1"));

    await clic(constelacion(caja).find((boton) => tituloDe(boton) === "Publicación 2"));
    const leer = blog(caja)?.querySelector("article a:not([aria-hidden])");
    expect(leer?.textContent).toContain("Leer publicación");
    await clic(leer);

    expect(enrutador.state.location.pathname).toBe("/blog");
    expect(enrutador.state.location.search).toBe("?leer=publicacion-2");
    await hasta(() => expect(caja.querySelector("[role='dialog']")?.textContent).toContain("Segundo párrafo."));
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Cerrar");
    expect(alCentro(caja)).toBe("Publicación 2");

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(enrutador.state.location.search).toBe("");
    expect(caja.querySelector("[role='dialog']")).toBeNull();
  });

  it("/blog/:slug muestra el mismo blog con la publicación abierta; en la vista Básica, su página de siempre", async () => {
    servidorDelBlog(3);
    const rrDev = await navegar("/blog/publicacion-3");

    await hasta(() => expect(rrDev.caja.querySelector("[role='dialog'] h2")?.textContent).toBe("Publicación 3"));
    await hasta(() => expect(alCentro(rrDev.caja)).toBe("Publicación 1"));

    const basica = await navegar("/blog/publicacion-3", "basica");
    await hasta(() => expect(basica.caja.textContent).toContain("Volver al blog"));
    expect(basica.caja.querySelector("[role='dialog']")).toBeNull();
  });

  it("los temas de la página van en el carrusel de «Lo que hago», sin repetir", async () => {
    servidorDelBlog(3);
    const { caja } = await navegar("/blog");
    await hasta(() => expect(alCentro(caja)).toBe("Publicación 1"));

    const carrusel = blog(caja)?.querySelector("ul[aria-labelledby]");
    const temas = [...(carrusel?.querySelectorAll("li:not([aria-hidden])") ?? [])].map((li) => li.textContent);

    expect(temas).toEqual(["Inteligencia artificial", "React"]);
  });

  it("sin publicaciones lo avisa, igual que la vista Básica con su lista", async () => {
    const rrDev = await navegar("/blog");
    await hasta(() => expect(blog(rrDev.caja)?.textContent).toContain("Todavía no hay publicaciones."));

    const basica = await navegar("/blog", "basica");
    await hasta(() => expect(basica.caja.textContent).toContain("Todavía no hay publicaciones."));
  });

  describe("cuentas", () => {
    it("la página sale de ?pagina=; cualquier otra cosa es la primera", () => {
      expect(paginaDe("3")).toBe(3);
      for (const valor of [null, "", "0", "-2", "1.5", "abc"]) expect(paginaDe(valor), String(valor)).toBe(1);
    });

    it("el paginado muestra la primera, la última y las vecinas, y un salto de una sola página va con su número", () => {
      expect(numerosDePagina(1, 1)).toEqual([1]);
      expect(numerosDePagina(1, 2)).toEqual([1, 2]);
      expect(numerosDePagina(1, 7)).toEqual([1, 2, "…", 7]);
      expect(numerosDePagina(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(numerosDePagina(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10]);
      expect(numerosDePagina(10, 10)).toEqual([1, "…", 9, 10]);
    });

    it("la URL guarda la página, si no es la primera, y la publicación abierta", () => {
      expect(busquedaDelBlog(1)).toBe("");
      expect(busquedaDelBlog(2)).toBe("?pagina=2");
      expect(busquedaDelBlog(1, "mi-post")).toBe("?leer=mi-post");
      expect(busquedaDelBlog(3, "mi-post")).toBe("?pagina=3&leer=mi-post");
    });

    it("solo cuentan las fotos y los documentos que ya se subieron, y la portada va primero", () => {
      const conPendientes = {
        portada: { url: "https://x/portada.webp", alt: "Portada" },
        galeria: [
          { url: null, alt: "Pendiente" },
          { url: "https://x/1.webp", alt: "Una" },
        ],
        documentos: [
          { url: null, titulo: "Pendiente" },
          { url: "https://x/a.pdf", titulo: "A" },
        ],
      };

      expect(fotosDe(conPendientes).map(({ alt }) => alt)).toEqual(["Portada", "Una"]);
      expect(fotosDe({ portada: null, galeria: [] })).toEqual([]);
      expect(documentosDe([conPendientes]).map(({ titulo }) => titulo)).toEqual(["A"]);
    });

    it("los temas van como hashtags y los documentos muestran su sitio", () => {
      expect(hashtag("Inteligencia artificial")).toBe("#InteligenciaArtificial");
      expect(hashtag(" React ")).toBe("#React");
      expect(dominio("https://www.arxiv.org/pdf/1706.03762")).toBe("arxiv.org");
      expect(dominio("no es una url")).toBe("");
    });

    it("los temas de la página van sin repetir, aunque cambien las mayúsculas, en el orden en que aparecen", () => {
      const temas = temasDe([
        { etiquetas: ["Cloud", "Edge"] },
        { etiquetas: ["edge", " React ", ""] },
        { etiquetas: [] },
      ]);

      expect(temas).toEqual(["Cloud", "Edge", "React"]);
    });

    it("el degradado del título va en lo que sigue a los dos puntos o, si no hay, en la última palabra", () => {
      expect(partesDelTitulo("Passkeys: el principio del fin de las contraseñas")).toEqual([
        "Passkeys:",
        "el principio del fin de las contraseñas",
      ]);
      expect(partesDelTitulo("Agentes de IA en el desarrollo")).toEqual(["Agentes de IA en el", "desarrollo"]);
      // Sin nada después de los dos puntos, el título va entero
      expect(partesDelTitulo("Notas:")).toEqual(["", "Notas:"]);
      expect(partesDelTitulo("React")).toEqual(["", "React"]);
    });
  });
});

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

const BIO = ["Primero.", "Segundo.", "Tercero."];

const trabajo: Experiencia = {
  id: "e1",
  empresa: "Docmovi",
  puesto: "Desarrollador Full Stack",
  desde: "2022-11",
  hasta: null,
  ubicacion: "Santiago, Chile",
  modalidad: "remoto",
  descripcion: "Desarrollé REST911.\n\nY sus apps.",
  logros: ["Módulo FLOTA"],
  tecnologias: ["React", "Node.js"],
  publicado: true,
  createdAt: "2026-10-30T12:00:00.000Z",
  updatedAt: "2026-10-30T12:00:00.000Z",
};

const estudio = (cambios: Partial<Estudio>): Estudio => ({
  id: "s1",
  tipo: "curso",
  institucion: "Henry",
  titulo: "Bootcamp Full Stack",
  desde: "2022-01",
  hasta: "2022-11",
  finalizado: true,
  descripcion: "",
  urlVerificacion: null,
  certificado: null,
  publicado: true,
  createdAt: "2026-10-30T12:00:00.000Z",
  updatedAt: "2026-10-30T12:00:00.000Z",
  ...cambios,
});

const ESTUDIOS = [
  estudio({}),
  estudio({
    id: "s2",
    tipo: "carrera",
    institucion: "UNLaM",
    titulo: "Ingeniería en Informática",
    desde: "2020-03",
    hasta: "2021-03",
    finalizado: false,
  }),
];

const DATOS: DatoCurioso[] = [
  { titulo: "Usuarios en REST911", valor: "4.500+", tipo: "profesional" },
  { titulo: "Roles de permisos", valor: "15", tipo: "profesional" },
  { titulo: "Mate por día", valor: "1 termo", tipo: "personal" },
];

/** `cantidad` datos de un tipo, del más nuevo (el 1) al más viejo */
const datosDe = (tipo: DatoCurioso["tipo"], cantidad: number): DatoCurioso[] =>
  Array.from({ length: cantidad }, (_, i) => ({ titulo: `${tipo} ${i + 1}`, valor: `Valor ${i + 1}`, tipo }));

/** Un backend con el perfil de Sobre mí: la bio, los idiomas, los datos curiosos, un trabajo y dos estudios */
function servidorSobreMi(datosCuriosos = DATOS) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async ({ url }: Request) => {
      if (url.includes("/perfil")) {
        return respuesta({
          perfil: {
            ...perfil,
            frase: "Desarrollo aplicaciones end to end.",
            bioLarga: BIO.join("\n\n"),
            disponibilidad: { disponible: true, texto: "Abierto a escuchar ofertas." },
            idiomas: [
              { idioma: "Español", nivel: "nativo" },
              { idioma: "Inglés", nivel: "basico" },
            ],
            datosCuriosos,
          },
        });
      }
      if (url.includes("/experiencia")) return respuesta({ experiencia: [trabajo], paginacion: { paginas: 1 } });
      if (url.includes("/estudios")) return respuesta({ estudios: ESTUDIOS, paginacion: { paginas: 1 } });
      return respuesta({ proyectos: [], paginacion: { paginas: 1 } });
    }),
  );
}

/** La lista que nombra un rótulo, como los costados de la constelación */
const listaDe = (caja: Element, rotulo: string) => {
  const titulo = [...caja.querySelectorAll("p[id]")].find((p) => p.textContent === rotulo);
  return [...(caja.querySelectorAll(`ul[aria-labelledby="${titulo?.id}"] > li:not([aria-hidden])`) ?? [])].map(
    (li) => li.textContent,
  );
};
const BARRA = "ul[aria-label='Trayectoria e idiomas']";

describe("Sobre mí de la vista RR-DEV", () => {
  beforeEach(() => servidorSobreMi());

  it("al centro, el lugar, la frase, la bio entera y la disponibilidad", async () => {
    const { caja } = await navegar("/sobre-mi");
    await hasta(() => expect(caja.textContent).toContain("Tercero."));

    const texto = caja.querySelector("main")?.textContent;
    for (const parte of ["Buenos Aires, Argentina", "Remoto", "Desarrollo aplicaciones end to end.", ...BIO]) {
      expect(texto).toContain(parte);
    }
    expect(texto).toContain("Abierto a escuchar ofertas.");
    // Si entra todo, no hay nada más para leer
    expect(texto).not.toContain("Seguir leyendo");
  });

  it("los datos curiosos van a los costados: los del trabajo a la izquierda y los personales a la derecha; en celular, en el carrusel", async () => {
    const { caja } = await navegar("/sobre-mi");
    await hasta(() => expect(listaDe(caja, "En el trabajo")).toHaveLength(2));

    expect(listaDe(caja, "En el trabajo")).toEqual(["Usuarios en REST9114.500+", "Roles de permisos15"]);
    expect(listaDe(caja, "Fuera del trabajo")).toEqual(["Mate por día1 termo"]);
    expect(listaDe(caja, "Datos curiosos")).toEqual([
      "Usuarios en REST911: 4.500+",
      "Roles de permisos: 15",
      "Mate por día: 1 termo",
    ]);
  });

  it("la barra lleva Trabajos, Estudios e Idiomas, con qué es cada una y no cuántos hay", async () => {
    const { caja } = await navegar("/sobre-mi");
    await hasta(() => expect(caja.querySelectorAll(`${BARRA} > li`)).toHaveLength(3));

    expect([...caja.querySelectorAll(`${BARRA} > li`)].map((li) => li.textContent)).toEqual([
      "TrabajosExperiencia laboral",
      "EstudiosFormación",
      "IdiomasLos que hablo",
    ]);
    expect([...caja.querySelectorAll(`${BARRA} button`)].map((b) => b.getAttribute("aria-label"))).toEqual([
      "Ver trabajos",
      "Ver estudios",
      "Ver idiomas",
    ]);
  });

  it("cada lista abre el panel con su línea de tiempo; las pestañas pasan a otra y Escape lo cierra", async () => {
    const { caja } = await navegar("/sobre-mi");
    await hasta(() => expect(caja.querySelectorAll(`${BARRA} button`)).toHaveLength(3));
    const dialogo = () => caja.querySelector("[role='dialog']");
    const hitos = () => [...(dialogo()?.querySelectorAll(".linea-tiempo > li h3") ?? [])].map((h) => h.textContent);
    const pestana = (nombre: string) =>
      [...(dialogo()?.querySelectorAll("[role='group'] button") ?? [])].find((b) => b.textContent?.startsWith(nombre));

    await clic(caja.querySelector(`${BARRA} button`));

    expect(dialogo()?.querySelector("h2")?.textContent).toBe("Trabajos");
    expect(hitos()).toEqual(["Desarrollador Full Stack"]);
    for (const parte of ["Docmovi", "nov. 2022 – actualidad", "Remoto", "Santiago, Chile", "Y sus apps.", "Módulo FLOTA", "Node.js"]) {
      expect(dialogo()?.textContent).toContain(parte);
    }
    // Las pestañas, con cuántos hay en cada lista: la elegida es la que se tocó
    expect([...(dialogo()?.querySelectorAll("[role='group'] button") ?? [])].map((b) => [b.textContent, b.getAttribute("aria-pressed")])).toEqual([
      ["Trabajos1", "true"],
      ["Estudios2", "false"],
      ["Idiomas2", "false"],
    ]);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Cerrar");

    // Los estudios, del más nuevo al más viejo, con su tipo y si se terminaron
    await clic(pestana("Estudios"));
    expect(dialogo()?.querySelector("h2")?.textContent).toBe("Estudios");
    expect(hitos()).toEqual(["Bootcamp Full Stack", "Ingeniería en Informática"]);
    expect(dialogo()?.textContent).toContain("Incompleto");
    expect(pestana("Estudios")?.getAttribute("aria-pressed")).toBe("true");

    await clic(pestana("Idiomas"));
    expect(hitos()).toEqual(["Español", "Inglés"]);
    expect(dialogo()?.textContent).toContain("Nativo");

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(dialogo()).toBeNull();

    // Idiomas también abre directo en su lista
    await clic(caja.querySelectorAll(`${BARRA} button`)[2]);
    expect(dialogo()?.querySelector("h2")?.textContent).toBe("Idiomas");
  });

  it("con más de cinco de un tipo, los más viejos van en una constelación lejana de su costado", async () => {
    servidorSobreMi([...datosDe("profesional", 10), ...datosDe("personal", 6)]);
    const { caja } = await navegar("/sobre-mi");
    await hasta(() => expect(listaDe(caja, "En el trabajo")).toHaveLength(5));

    const lejana = (nombre: string) =>
      [...(caja.querySelectorAll(`ul[aria-label="${nombre}: anteriores"] > li`) ?? [])].map((li) => li.textContent);
    // Los cinco más nuevos cerca y los tres que siguen lejos; el noveno y el décimo no entran
    expect(listaDe(caja, "En el trabajo")[0]).toBe("profesional 1Valor 1");
    expect(lejana("En el trabajo")).toEqual(["profesional 6Valor 6", "profesional 7Valor 7", "profesional 8Valor 8"]);
    expect(lejana("Fuera del trabajo")).toEqual(["personal 6Valor 6"]);
    // La lejana es más chica y no tiene título: es la que sigue, más atrás
    expect(caja.querySelectorAll(".constelacion-lejana p")).toHaveLength(0);
  });

  it("con cinco o menos de un tipo no hay constelación lejana", async () => {
    const { caja } = await navegar("/sobre-mi");
    await hasta(() => expect(listaDe(caja, "En el trabajo")).toHaveLength(2));

    expect(caja.querySelector(".constelacion-lejana")).toBeNull();
  });

  it("si la bio no entra, muestra los párrafos que caben y el resto se lee en el panel", async () => {
    // jsdom no mide: el centro es más alto que su fila mientras haya más de dos párrafos de la bio
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
      if (!this.hasAttribute("data-encaja")) return 0;
      const parrafos = [...this.querySelectorAll("p")].filter((p) => BIO.includes(p.textContent ?? ""));
      return parrafos.length > 2 ? 100 : 0;
    });
    const { caja } = await navegar("/sobre-mi");
    await hasta(() => expect(caja.textContent).toContain("Seguir leyendo"));

    expect(caja.textContent).toContain("Segundo.");
    expect(caja.textContent).not.toContain("Tercero.");

    await clic([...caja.querySelectorAll("main button")].find((b) => b.textContent === "Seguir leyendo"));

    const dialogo = caja.querySelector("[role='dialog']");
    expect(dialogo?.querySelector("h2")?.textContent).toBe("Desarrollo aplicaciones end to end.");
    for (const parrafo of BIO) expect(dialogo?.textContent).toContain(parrafo);
  });

  it("lo que cae encima de Venus se apoya en un vidrio oscuro; lo demás, no", async () => {
    // jsdom no ubica nada: el dato de los usuarios cae donde la cámara pone a Venus, abajo a la izquierda
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      return this.matches("[data-respaldo]") && this.textContent?.includes("Usuarios")
        ? new DOMRect(40, innerHeight - 60, 160, 40)
        : new DOMRect();
    });
    const { caja } = await navegar("/sobre-mi");
    await hasta(() => expect(listaDe(caja, "En el trabajo")).toHaveLength(2));

    const usuarios = [...caja.querySelectorAll("[data-respaldo]")].find((pieza) =>
      pieza.textContent?.includes("Usuarios"),
    );
    await hasta(() => expect(usuarios?.hasAttribute("data-sobre-planeta")).toBe(true));
    expect(caja.querySelector("main h1")?.hasAttribute("data-sobre-planeta")).toBe(false);
  });

  describe("cuentas", () => {
    it("los trabajos y los estudios van por separado, del que empezó más tarde al más viejo", () => {
      const viejo = { ...trabajo, id: "e0", empresa: "Otra", desde: "2019-02" as const };
      expect(trabajosDe([viejo, trabajo]).map(({ lugar }) => lugar)).toEqual(["Docmovi", "Otra"]);
      expect(trabajosDe([trabajo])[0]?.pildoras).toEqual(["Remoto", "Santiago, Chile"]);
      expect(trabajosDe([trabajo])[0]?.parrafos).toEqual(["Desarrollé REST911.", "Y sus apps."]);
      // Un trabajo sin ubicación no deja una píldora vacía
      expect(trabajosDe([{ ...trabajo, ubicacion: "" }])[0]?.pildoras).toEqual(["Remoto"]);

      const formacion = estudiosDe(ESTUDIOS);
      expect(formacion.map(({ lugar }) => lugar)).toEqual(["Henry", "UNLaM"]);
      expect(formacion.map(({ pildoras }) => pildoras)).toEqual([
        ["Curso", "Finalizado"],
        ["Carrera", "Incompleto"],
      ]);
      expect([...trabajosDe([trabajo]), ...formacion].map(({ icono }) => icono)).toEqual([Briefcase, GraduationCap, School]);
    });

    it("la barra y el panel muestran solo las listas que tienen algo", () => {
      const ids = (trayectoria: Parameters<typeof categoriasCon>[0]) => categoriasCon(trayectoria).map(({ id }) => id);
      expect(ids({ trabajos: trabajosDe([trabajo]), estudios: [], idiomas: [{ idioma: "Español", nivel: "nativo" }] })).toEqual([
        "trabajos",
        "idiomas",
      ]);
      expect(ids({ trabajos: [], estudios: [], idiomas: [] })).toEqual([]);
    });

    it("cada dato curioso lleva su ícono por el título; uno nuevo, el de su tipo", () => {
      expect(iconoDato({ titulo: " Usuarios en REST911 ", tipo: "profesional" })).toBe(Users);
      expect(iconoDato({ titulo: "Otro dato", tipo: "profesional" })).toBe(Briefcase);
      expect(iconoDato({ titulo: "Otro dato", tipo: "personal" })).toBe(Sparkles);
    });

    it("el arco abre hacia el centro: el dato del medio es el que más se aparta", () => {
      expect([0, 1, 2, 3, 4].map((indice) => apartado(indice, 5))).toEqual([0, 48, 64, 48, 0]);
      expect([0, 1, 2].map((indice) => apartado(indice, 3))).toEqual([0, 64, 0]);
      expect([0, 1].map((indice) => apartado(indice, 2))).toEqual([0, 0]);
      // Una lejana se curva menos
      expect([0, 1, 2].map((indice) => apartado(indice, 3, 40))).toEqual([0, 40, 0]);
    });

    it("cada tipo reparte sus datos: los cinco más nuevos cerca y los tres que siguen lejos", () => {
      const datos = [...datosDe("profesional", 10), ...datosDe("personal", 2)];

      const trabajo = repartirDatos(datos, "profesional");
      expect(trabajo.cerca.map(({ titulo }) => titulo)).toEqual([1, 2, 3, 4, 5].map((n) => `profesional ${n}`));
      expect(trabajo.lejos.map(({ titulo }) => titulo)).toEqual([6, 7, 8].map((n) => `profesional ${n}`));
      expect(repartirDatos(datos, "personal")).toEqual({ cerca: datosDe("personal", 2), lejos: [] });
    });

    it("una pieza lleva el vidrio si por lo menos una décima parte cae sobre el planeta", () => {
      const disco = { x: 0, y: 0, radio: 100 };

      expect(tapa({ left: -50, top: -20, width: 100, height: 40 }, disco)).toBe(true);
      expect(tapa({ left: 300, top: 300, width: 100, height: 40 }, disco)).toBe(false);
      // Apenas una esquina adentro no alcanza
      expect(tapa({ left: 95, top: -10, width: 200, height: 20 }, disco)).toBe(false);
    });

    it("un texto largo que pasa por el centro de un planeta chico también lleva el vidrio", () => {
      const venus = { x: 150, y: 0, radio: 13 };

      expect(tapa({ left: 0, top: -22, width: 300, height: 44 }, venus)).toBe(true);
      // Si solo lo roza, no
      expect(tapa({ left: 0, top: 10, width: 300, height: 44 }, venus)).toBe(false);
    });
  });
});

const HABILIDADES: Perfil["habilidades"] = [
  { nombre: "React", categoria: "front" },
  { nombre: "TypeScript", categoria: "front" },
  { nombre: "React Native", categoria: "mobile" },
  { nombre: "Node.js", categoria: "back" },
  { nombre: "APIs REST", categoria: "back" },
  { nombre: "MongoDB", categoria: "base-de-datos" },
  { nombre: "Git", categoria: "herramientas" },
  { nombre: "Express.js", categoria: "back" },
  { nombre: "Jira", categoria: "herramientas" },
];

/** Los nombres de las áreas de un costado, columna por columna, de la que da al texto hacia afuera */
const costado = (caja: Element, lado: string) =>
  [...(caja.querySelector(`[data-lado="${lado}"]`)?.children ?? [])].map((columna) =>
    [...columna.querySelectorAll("section > p[id]")].map((p) => p.textContent),
  );
/** Las habilidades de la constelación que nombra un rótulo */
const constelacionDe = (caja: Element, rotulo: string) => {
  const titulo = [...caja.querySelectorAll("[data-lado] p[id]")].find((p) => p.textContent === rotulo);
  return [...caja.querySelectorAll(`ul[aria-labelledby="${titulo?.id}"] > li`)];
};
/** Áreas de prueba con `cantidades` habilidades cada una */
const areasCon = (...cantidades: number[]) =>
  cantidades.map((cantidad, i) => ({
    categoria: "otra" as const,
    nombre: `Área ${i + 1}`,
    tono: "neutro" as const,
    icono: Sparkles,
    habilidades: Array.from({ length: cantidad }, (_, j) => `Habilidad ${j + 1}`),
  }));

describe("Habilidades de la vista RR-DEV", () => {
  beforeEach(() => servidor(null, { habilidades: HABILIDADES }));

  it("al centro, el título, cuántas tecnologías y áreas hay, y la frase", async () => {
    const { caja } = await navegar("/habilidades");
    await hasta(() => expect(caja.textContent).toContain("9 tecnologías en 5 áreas"));

    expect(caja.querySelector("main h1")?.textContent).toBe("Habilidades");
    expect(caja.textContent).toContain("Sigo aprendiendo para mejorar lo que sé, y cada día sumo algo nuevo.");
  });

  it("cada área es una constelación con su nombre y cuántas tiene, en columnas parejas: las dos más grandes pegadas al texto, una de cada lado", async () => {
    const { caja } = await navegar("/habilidades");
    await hasta(() => expect(costado(caja, "izquierda")).toHaveLength(2));

    expect(costado(caja, "izquierda")).toEqual([["Back-end 3"], ["Mobile 1"]]);
    expect(costado(caja, "derecha")).toEqual([["Front-end 2"], ["Herramientas 2", "Bases de datos 1"]]);
    // En el orden en que llegan
    expect(constelacionDe(caja, "Back-end 3").map((li) => li.textContent)).toEqual(["Node.js", "APIs REST", "Express.js"]);
  });

  it("cada habilidad lleva el logo de su marca; una sin logo, el ícono de su área", async () => {
    const { caja } = await navegar("/habilidades");
    await hasta(() => expect(constelacionDe(caja, "Back-end 3")).toHaveLength(3));

    const [node, apis] = constelacionDe(caja, "Back-end 3");
    expect(node?.querySelector("svg path")?.getAttribute("d")).toBe(LOGOS_TECNOLOGIA.nodejs.trazo);
    expect(apis?.querySelector("svg.lucide-server")).not.toBeNull();
  });

  it("en el celular, cada área va en un renglón, de la que tiene más a la que tiene menos, con sus nombres debajo", async () => {
    const { caja } = await navegar("/habilidades");
    await hasta(() => expect(caja.querySelectorAll("main section:not([data-lado] section)")).toHaveLength(5));

    const renglones = [...caja.querySelectorAll("main section:not([data-lado] section)")];
    expect(renglones.map((renglon) => renglon.querySelector("p[id]")?.textContent)).toEqual([
      "Back-end 3",
      "Front-end 2",
      "Herramientas 2",
      "Mobile 1",
      "Bases de datos 1",
    ]);
    expect(renglones.map((renglon) => renglon.querySelector("p:not([id])")?.textContent)).toEqual([
      "Node.js · APIs REST · Express.js",
      "React · TypeScript",
      "Git · Jira",
      "React Native",
      "MongoDB",
    ]);
  });

  it("sin habilidades cargadas queda el texto del centro, sin cuenta ni constelaciones", async () => {
    servidor();
    const { caja } = await navegar("/habilidades");
    await hasta(() => expect(caja.textContent).toContain("Sigo aprendiendo"));

    expect(caja.textContent).not.toContain("tecnologías");
    expect(caja.querySelectorAll("main section")).toHaveLength(0);
  });

  it("lo que cae encima de la Tierra se apoya en un vidrio oscuro; lo demás, no", async () => {
    // jsdom no ubica nada: el nombre de Mobile cae donde la cámara pone a la Tierra, abajo a la izquierda
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      return this.matches("[data-respaldo]") && this.textContent === "Mobile 1"
        ? new DOMRect(40, innerHeight - 60, 160, 40)
        : new DOMRect();
    });
    const { caja } = await navegar("/habilidades");
    await hasta(() => expect(costado(caja, "izquierda")).toHaveLength(2));

    const mobile = [...caja.querySelectorAll("[data-respaldo]")].find((pieza) => pieza.textContent === "Mobile 1");
    await hasta(() => expect(mobile?.hasAttribute("data-sobre-planeta")).toBe(true));
    expect(caja.querySelector("main h1")?.hasAttribute("data-sobre-planeta")).toBe(false);
  });

  describe("cuentas", () => {
    it("agrupa por área, con el nombre del panel, su color y su ícono, de la que tiene más a la que tiene menos", () => {
      const areas = armarAreas(HABILIDADES);

      expect(areas.map(({ nombre, habilidades }) => [nombre, habilidades.length])).toEqual([
        ["Back-end", 3],
        ["Front-end", 2],
        ["Herramientas", 2],
        ["Mobile", 1],
        ["Bases de datos", 1],
      ]);
      expect(areas.map(({ tono }) => tono)).toEqual(["exito", "info", "neutro", "rosa", "aviso"]);
      expect(areas[0]?.icono).toBe(Server);
      expect(areas[1]?.icono).toBe(Monitor);
    });

    it("el logo sale del nombre de la habilidad; una sin logo conocido no lleva", () => {
      expect(logoTecnologia(" React Native ")).toBe(LOGOS_TECNOLOGIA.react);
      expect(logoTecnologia("PostgreSQL")).toBe(LOGOS_TECNOLOGIA.postgresql);
      expect(logoTecnologia("APIs REST")).toBeNull();
    });

    it("reparte las áreas en los costados: las dos más grandes pegadas al texto y la columna de afuera de la derecha lleva dos", () => {
      const nombres = (columnas: { nombre: string }[][]) => columnas.map((columna) => columna.map(({ nombre }) => nombre));
      const { izquierda, derecha } = repartirColumnas(areasCon(7, 6, 4, 3, 2));

      expect(nombres(izquierda)).toEqual([["Área 1"], ["Área 4"]]);
      expect(nombres(derecha)).toEqual([["Área 2"], ["Área 3", "Área 5"]]);
      // Con las siete categorías, todas tienen lugar
      const todas = repartirColumnas(areasCon(7, 6, 5, 4, 3, 2, 1));
      expect([...todas.izquierda, ...todas.derecha].flat()).toHaveLength(7);
      expect(repartirColumnas([])).toEqual({ izquierda: [], derecha: [] });
    });

    it("las burbujas de un costado van a la misma distancia: la más grande que entra en todas sus columnas", () => {
      // Alto de sobra: la distancia más grande
      expect(pasoParejo(1000, [areasCon(7)])).toBe(PASO_MAXIMO);
      // En una laptop no entran grandes: van chicas, con rótulos y huecos más chicos
      expect(pasoParejo(300, [areasCon(7), areasCon(3)])).toBe(40);
      // Manda la columna más apretada
      expect(pasoParejo(500, areasCon(3, 6).map((area) => [area]))).toBeCloseTo((500 - 26) / 6);
    });

    it("las medidas de una constelación salen de la distancia entre sus burbujas", () => {
      expect(medidasPara(84)).toEqual({ tamano: "grande", burbuja: 46, curva: 41, hueco: 12 });
      expect(medidasPara(40)).toEqual({ tamano: "chica", burbuja: 28, curva: 25, hueco: 8 });
    });

    it("la cuenta del centro dice tecnologías y áreas, en singular si hay una", () => {
      expect(TEXTOS_HABILIDADES.cuenta(22, 5)).toBe("22 tecnologías en 5 áreas");
      expect(TEXTOS_HABILIDADES.cuenta(1, 1)).toBe("1 tecnología en 1 área");
    });
  });
});

function proyectoDePrueba(numero: number, cambios: Partial<Proyecto> = {}): Proyecto {
  return {
    id: String(numero),
    titulo: `Proyecto ${numero}`,
    slug: `proyecto-${numero}`,
    tipo: "personal",
    rol: "Creador y desarrollador",
    fecha: "2026-07",
    resumen: `Resumen del proyecto ${numero}.`,
    descripcion: `Primer párrafo del ${numero}.\n\nSegundo párrafo del ${numero}.`,
    tecnologias: ["React"],
    repositorios: [],
    galeria: [],
    documentos: [],
    destacado: false,
    estado: "publicado",
    orden: numero,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...cambios,
  };
}

const PANADERIA = proyectoDePrueba(1, {
  titulo: "Panadería Digital",
  slug: "panaderia-digital",
  resumen: "App para panaderías.",
  descripcion: "La empecé en julio.\n\nTiene dos caras.",
  tecnologias: ["React Native", "Expo", "Expo Router", "React Native Web", "TypeScript", "Redux Toolkit", "Zod", "Node.js", "Express", "bcrypt", "Multer"],
  repositorios: [
    { nombre: "App y web", url: "https://github.com/yo/panaderia-front" },
    { nombre: "API", url: "https://github.com/yo/panaderia-back" },
  ],
});
const FACTURACION = proyectoDePrueba(2, { titulo: "Facturación FCT", slug: "facturacion-fct", fecha: "2026-09" });

function servidorProyectos(proyectos: Proyecto[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async ({ url }: Request) => {
      if (url.includes("/perfil")) return respuesta({ perfil });
      if (url.includes("/proyectos")) return respuesta({ proyectos, paginacion: { page: 1, limit: 100, total: proyectos.length, paginas: 1 } });
      const clave = url.includes("experiencia") ? "experiencia" : "estudios";
      return respuesta({ [clave]: [], paginacion: { paginas: 1 } });
    }),
  );
}

/** El título de cada ficha en pantalla, en orden */
const proyectosEnPantalla = (caja: Element) =>
  [...caja.querySelectorAll("main article")].map(
    (ficha) => document.getElementById(ficha.getAttribute("aria-labelledby") ?? "")?.textContent,
  );
/** Las fichas abiertas, por su título */
const abiertas = (caja: Element) =>
  [...caja.querySelectorAll("main article[data-abierta]")].map(
    (ficha) => document.getElementById(ficha.getAttribute("aria-labelledby") ?? "")?.textContent,
  );
/** Las listas de fichas: una por costado */
const costados = (caja: Element) => [...new Set([...caja.querySelectorAll("main li > article")].map((ficha) => ficha.closest("ul")))];
const fichaDe = (caja: Element, titulo: string) =>
  [...caja.querySelectorAll("main article")].find(
    (ficha) => document.getElementById(ficha.getAttribute("aria-labelledby") ?? "")?.textContent === titulo,
  );
const dialogo = () => document.querySelector("[role='dialog']");

/** La pantalla: se cumple solo esa consulta de `LUGARES_PROYECTOS`. Sin esto, los tests son un celular bajo */
function pantallaDeProyectos(consulta: string | null) {
  vi.stubGlobal("matchMedia", (texto: string) => ({
    matches: texto === consulta,
    media: texto,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}
const PANTALLA_GRANDE = LUGARES_PROYECTOS[0]!.consulta;
const CELULAR = LUGARES_PROYECTOS[2]!.consulta;

describe("Proyectos de la vista RR-DEV", () => {
  beforeEach(() => servidorProyectos([PANADERIA, FACTURACION]));

  it("al centro, el título, cuántos proyectos hay y la frase", async () => {
    const { caja } = await navegar("/proyectos");
    await hasta(() => expect(caja.textContent).toContain("2 proyectos publicados"));

    expect(caja.querySelector("main h1")?.textContent).toBe("Proyectos");
    expect(caja.textContent).toContain("Escucho ideas y las convierto en soluciones: lo que sé está abierto a la tuya.");
  });

  it("cada ficha lleva su emblema, el título, el tipo y el mes, en el orden del panel y con su color", async () => {
    const { caja } = await navegar("/proyectos");
    await hasta(() => expect(proyectosEnPantalla(caja)).toEqual(["Panadería Digital", "Facturación FCT"]));

    const [panaderia, facturacion] = [...caja.querySelectorAll("main article")];
    expect(panaderia?.querySelector("h2 button")?.textContent).toContain("Panadería DigitalPersonal · jul. 2026");
    expect(panaderia?.textContent).toContain("App para panaderías.");
    // Sin portada, las iniciales; con sigla, la sigla
    expect(panaderia?.querySelector(".anillo-proyecto")?.textContent).toBe("PD");
    expect(facturacion?.querySelector(".anillo-proyecto")?.textContent).toBe("FCT");
    // Cada uno con su color, en el orden de la lista
    expect(panaderia?.className).toContain("[--tono:var(--info)]");
    expect(facturacion?.className).toContain("[--tono:var(--exito)]");
  });

  it("en una pantalla grande va uno de cada lado, y el primero de cada costado entra abierto", async () => {
    pantallaDeProyectos(PANTALLA_GRANDE);
    const { caja } = await navegar("/proyectos");
    await hasta(() => expect(proyectosEnPantalla(caja)).toHaveLength(2));

    expect(costados(caja).map((lista) => lista?.querySelectorAll("article").length)).toEqual([1, 1]);
    expect(abiertas(caja)).toEqual(["Panadería Digital", "Facturación FCT"]);
  });

  it("en el celular van en una sola lista, con la primera abierta y las demás cerradas", async () => {
    pantallaDeProyectos(CELULAR);
    const { caja } = await navegar("/proyectos");
    await hasta(() => expect(proyectosEnPantalla(caja)).toHaveLength(2));

    expect(costados(caja)).toHaveLength(1);
    expect(abiertas(caja)).toEqual(["Panadería Digital"]);
    const facturacion = fichaDe(caja, "Facturación FCT")!;
    const boton = facturacion.querySelector("h2 button")!;
    expect(boton.getAttribute("aria-expanded")).toBe("false");
    // Lo de adentro de una cerrada no se puede tocar ni enfocar
    expect(document.getElementById(boton.getAttribute("aria-controls")!)?.hasAttribute("inert")).toBe(true);
  });

  it("tocar otra ficha la abre y cierra la que estaba abierta en su costado; el otro costado no cambia", async () => {
    pantallaDeProyectos(PANTALLA_GRANDE);
    servidorProyectos([1, 2, 3, 4, 5].map((numero) => proyectoDePrueba(numero)));
    const { caja } = await navegar("/proyectos");
    await hasta(() => expect(proyectosEnPantalla(caja)).toHaveLength(5));
    expect(costados(caja).map((lista) => lista?.querySelectorAll("article").length)).toEqual([3, 2]);
    expect(abiertas(caja)).toEqual(["Proyecto 1", "Proyecto 4"]);

    const boton = fichaDe(caja, "Proyecto 2")!.querySelector("h2 button")!;
    await clic(boton);
    expect(abiertas(caja)).toEqual(["Proyecto 2", "Proyecto 4"]);
    expect(boton.getAttribute("aria-expanded")).toBe("true");
    expect(document.getElementById(boton.getAttribute("aria-controls")!)?.hasAttribute("inert")).toBe(false);

    // Tocar la abierta la deja abierta: en cada costado siempre hay una
    await clic(boton);
    expect(abiertas(caja)).toEqual(["Proyecto 2", "Proyecto 4"]);
  });

  it("las tecnologías con logo van en burbujas, sin repetir el dibujo, y las demás se cuentan en «+N»", async () => {
    const { caja } = await navegar("/proyectos");
    await hasta(() => expect(caja.querySelectorAll("main article")).toHaveLength(2));

    const panaderia = caja.querySelector("main article")!;
    // Expo Router y React Native Web repiten el logo de Expo y de React; bcrypt y Multer no tienen
    expect(panaderia.querySelector(".tarjeta-habilidad")?.firstChild?.textContent).toBe(
      "React Native · Expo · TypeScript · Redux Toolkit · Zod · Node.js",
    );
    expect(panaderia.querySelectorAll(".burbujas-proyecto li")).toHaveLength(6);
    expect(panaderia.querySelector(".burbujas-proyecto li path")?.getAttribute("d")).toBe(LOGOS_TECNOLOGIA.react.trazo);
    expect(panaderia.querySelector(".burbujas-proyecto > span")?.textContent).toBe("+5");
    expect(panaderia.querySelector(".tarjeta-habilidad .sr-only")?.textContent).toBe(
      ", 5 tecnologías más: Expo Router, React Native Web, Express, bcrypt, Multer",
    );
  });

  it("el código de cada repositorio se abre en otra pestaña", async () => {
    const { caja } = await navegar("/proyectos");
    await hasta(() => expect(caja.querySelectorAll("main article")).toHaveLength(2));

    const codigo = [...caja.querySelectorAll<HTMLAnchorElement>("main article a[target='_blank']")];
    expect(codigo.map((a) => a.getAttribute("aria-label"))).toEqual(["Código: App y web", "Código: API"]);
    expect(codigo.every((a) => a.rel === "noopener noreferrer")).toBe(true);
  });

  it("«Ver proyecto» lo abre en el panel con la descripción, todas las tecnologías y los repositorios; Cerrar lo saca de la URL", async () => {
    const { caja, enrutador } = await navegar("/proyectos");
    await hasta(() => expect(caja.querySelectorAll("main article")).toHaveLength(2));

    await clic(caja.querySelector("main article a[href='/proyectos?ver=panaderia-digital']"));
    await hasta(() => expect(dialogo()).not.toBeNull());

    const panel = dialogo()!;
    expect(enrutador.state.location.search).toBe("?ver=panaderia-digital");
    expect(panel.querySelector("h2")?.textContent).toBe("Panadería Digital");
    expect(panel.textContent).toContain("Proyecto personal · Creador y desarrollador · jul. 2026");
    expect(panel.textContent).toContain("La empecé en julio.");
    expect(panel.textContent).toContain("Tiene dos caras.");
    expect(panel.textContent).toContain("Tecnologías · 11");
    expect([...panel.querySelectorAll("ul li")].map((li) => li.textContent)).toEqual(PANADERIA.tecnologias);
    const repositorios = [...panel.querySelectorAll<HTMLAnchorElement>("a[href^='https://github.com']")];
    expect(repositorios.map((a) => a.textContent)).toEqual(["App y web", "API"]);
    // Ya no hay demo, tiendas, APK aparte ni pedido de demo por Meet: todo link va en los repositorios
    expect(panel.querySelector("a[href^='mailto:']")).toBeNull();
    expect(panel.textContent).not.toContain("Para verlo");

    await clic(panel.querySelector("button[aria-label='Cerrar']"));
    await hasta(() => expect(dialogo()).toBeNull());
    expect(enrutador.state.location.search).toBe("");
  });

  it("la portada es la primera imagen de la galería: va en el emblema de la lista y arriba de todo en el panel", async () => {
    const conFotos = proyectoDePrueba(1, {
      titulo: "Panadería Digital",
      slug: "panaderia-digital",
      galeria: [
        { url: "https://x.com/portada.webp", alt: "Catálogo web" },
        { url: "https://x.com/pedidos.webp", alt: "Pedidos" },
      ],
      documentos: [{ url: "https://x.com/manual.pdf", titulo: "Manual de usuario" }],
    });
    servidorProyectos([conFotos, FACTURACION]);
    const { caja } = await navegar("/proyectos?ver=panaderia-digital");
    await hasta(() => expect(dialogo()).not.toBeNull());

    const fila = [...caja.querySelectorAll("main article")].find((a) => a.textContent?.includes("Panadería Digital"));
    expect(fila?.querySelector(".anillo-proyecto img")?.getAttribute("src")).toBe("https://x.com/portada.webp");
    const fotos = [...dialogo()!.querySelectorAll<HTMLImageElement>("button img")].map((img) => img.getAttribute("src"));
    expect(fotos).toEqual(["https://x.com/portada.webp", "https://x.com/pedidos.webp"]);

    // «Portada arriba»: la portada va antes que todo, hasta del título; el emblema del panel lleva las iniciales
    const portada = dialogo()!.querySelector<HTMLElement>("button[aria-label='Ver foto: Catálogo web']")!;
    const titulo = dialogo()!.querySelector("h2")!;
    expect(portada.compareDocumentPosition(titulo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(dialogo()!.querySelector(".anillo-proyecto img")).toBeNull();
    expect(dialogo()!.querySelector(".anillo-proyecto")?.textContent).toBe("PD");
    expect(dialogo()!.textContent).toContain("Más fotos · 1");

    // El manual va justo abajo de la portada, antes del título
    const manual = dialogo()!.querySelector("a[href='https://x.com/manual.pdf']")!;
    expect(portada.compareDocumentPosition(manual) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(manual.compareDocumentPosition(titulo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("/proyectos/:slug («Ver en la web» del panel) abre Proyectos con ese proyecto en su panel; Cerrar vuelve a Proyectos", async () => {
    const { caja, enrutador } = await navegar("/proyectos/panaderia-digital");
    await hasta(() => expect(dialogo()).not.toBeNull());

    expect(dialogo()!.querySelector("h2")?.textContent).toBe("Panadería Digital");
    // Detrás, la página de Proyectos de este diseño (sus fichas con «Ver proyecto»), no la genérica
    await hasta(() => expect(caja.querySelectorAll("main article a[href^='/proyectos?ver=']")).toHaveLength(2));

    await clic(dialogo()!.querySelector("button[aria-label='Cerrar']"));
    await hasta(() => expect(dialogo()).toBeNull());
    expect(enrutador.state.location.pathname).toBe("/proyectos");
  });

  it("un enlace a un proyecto que no existe avisa en el panel", async () => {
    await navegar("/proyectos?ver=no-existe");
    await hasta(() => expect(dialogo()?.textContent).toContain("Este proyecto no existe o no está publicado."));
  });

  it("en una pantalla grande entran 10; los demás van a la página siguiente y cada uno conserva su color", async () => {
    pantallaDeProyectos(PANTALLA_GRANDE);
    servidorProyectos(Array.from({ length: 12 }, (_, i) => proyectoDePrueba(i + 1)));
    const { caja } = await navegar("/proyectos?pagina=2");
    await hasta(() => expect(proyectosEnPantalla(caja)).toEqual(["Proyecto 11", "Proyecto 12"]));

    const paginado = caja.querySelector("nav[aria-label='Páginas de proyectos']");
    expect(paginado?.textContent).toContain("Página 2 de 2");
    expect(paginado?.querySelector("a[href='/proyectos']")).not.toBeNull();
    expect(caja.querySelectorAll("main article")[0]?.className).toContain("[--tono:var(--aviso)]");
    expect(caja.textContent).toContain("12 proyectos publicados");
  });

  it("en un celular bajo entran 3", async () => {
    servidorProyectos([1, 2, 3, 4, 5].map((numero) => proyectoDePrueba(numero)));
    const { caja } = await navegar("/proyectos?pagina=2");
    await hasta(() => expect(proyectosEnPantalla(caja)).toEqual(["Proyecto 4", "Proyecto 5"]));

    expect(caja.querySelector("nav[aria-label='Páginas de proyectos']")?.textContent).toContain("Página 2 de 2");
  });

  it("si entran todos no hay paginado", async () => {
    const { caja } = await navegar("/proyectos");
    await hasta(() => expect(caja.querySelectorAll("main article")).toHaveLength(2));

    expect(caja.querySelector("nav[aria-label='Páginas de proyectos']")).toBeNull();
  });

  it("sin proyectos publicados queda el texto del centro y el aviso", async () => {
    servidorProyectos([]);
    const { caja } = await navegar("/proyectos");
    await hasta(() => expect(caja.textContent).toContain("Todavía no hay proyectos publicados."));

    expect(caja.textContent).toContain("Escucho ideas");
    expect(caja.querySelector(".cuenta-proyectos")).toBeNull();
    expect(caja.querySelectorAll("main article")).toHaveLength(0);
  });

  describe("cuentas", () => {
    it("las iniciales del emblema: la sigla del título, o las de sus dos primeras palabras largas", () => {
      expect(iniciales("Facturación FCT")).toBe("FCT");
      expect(iniciales("Panadería Digital")).toBe("PD");
      expect(iniciales("Panel de Flota")).toBe("PF");
      expect(iniciales("Blog")).toBe("B");
    });

    it("las tecnologías con logo, en orden, sin repetir el dibujo y hasta la cantidad pedida", () => {
      const lista = tecnologiasConLogo(["bcrypt", "React Native", "React Native Web", "MongoDB Atlas", "Expo Router", "Vercel"], 3);
      expect(lista.map(({ nombre }) => nombre)).toEqual(["React Native", "MongoDB Atlas", "Expo Router"]);
      expect(tecnologiasOcultas(["bcrypt", "React Native", "Vercel"], lista)).toEqual(["bcrypt", "Vercel"]);
    });

    it("el logo de las tecnologías de los proyectos también sale del nombre", () => {
      expect(logoTecnologia("Expo Router")).toBe(LOGOS_TECNOLOGIA.expo);
      expect(logoTecnologia("MongoDB Atlas")).toBe(LOGOS_TECNOLOGIA.mongodb);
      expect(logoTecnologia("React Hook Form")).toBe(LOGOS_TECNOLOGIA.reacthookform);
      expect(logoTecnologia("Cloudinary")).toBe(LOGOS_TECNOLOGIA.cloudinary);
    });

    it("cuántos entran: 10 en una pantalla grande, 8 en una laptop o una tableta, 4 en el celular y 3 en uno bajo", () => {
      expect(LUGARES_PROYECTOS.map(porPaginaDe)).toEqual([10, 8, 4, 3]);
      expect(LUGARES_PROYECTOS.at(-1)?.consulta).toBeNull();
    });

    it("el reparto: mitad y mitad, la izquierda primero y hasta su lugar; con un solo costado, todos juntos", () => {
      const numeros = (cantidad: number) => Array.from({ length: cantidad }, (_, i) => i + 1);
      const grande = { izquierda: 4, derecha: 6 };
      expect(repartirProyectos(numeros(2), grande)).toEqual({ izquierda: [1], derecha: [2] });
      expect(repartirProyectos(numeros(5), grande)).toEqual({ izquierda: [1, 2, 3], derecha: [4, 5] });
      expect(repartirProyectos(numeros(10), grande)).toEqual({ izquierda: [1, 2, 3, 4], derecha: [5, 6, 7, 8, 9, 10] });
      expect(repartirProyectos(numeros(4), { izquierda: 4, derecha: 0 })).toEqual({ izquierda: [1, 2, 3, 4], derecha: [] });
    });

    it("las páginas, la búsqueda de la URL y el color de cada uno según su lugar", () => {
      const cinco = [1, 2, 3, 4, 5].map((numero) => proyectoDePrueba(numero));
      expect(paginasDeProyectos(5, 2)).toBe(3);
      expect(paginasDeProyectos(12, 10)).toBe(2);
      expect(paginasDeProyectos(0, 10)).toBe(1);
      expect(proyectosDeLaPagina(cinco, 3, 2).map(({ proyecto, indice }) => [proyecto.titulo, indice])).toEqual([["Proyecto 5", 4]]);
      expect(busquedaDeProyectos(1)).toBe("");
      expect(busquedaDeProyectos(2, "panaderia-digital")).toBe("?pagina=2&ver=panaderia-digital");
      expect([0, 1, 2, 3, 4].map(tonoProyecto)).toEqual(["info", "exito", "aviso", "rosa", "info"]);
    });

    it("la cuenta del centro, en singular si hay uno", () => {
      expect(TEXTOS_PROYECTOS.cuenta(2)).toBe("2 proyectos publicados");
      expect(TEXTOS_PROYECTOS.cuenta(1)).toBe("1 proyecto publicado");
    });
  });
});

const CONTACTO_COMPLETO: Perfil["contacto"] = {
  correo: "yo@mail.com",
  telefono: { numero: "+54 9 11 5555-1234", whatsapp: true },
  redes: [
    { tipo: "linkedin", url: "https://www.linkedin.com/in/yo/" },
    { tipo: "github", url: "https://github.com/yo" },
    { tipo: "sitio", url: "https://misitio.com" },
  ],
  mensaje: "Estoy escuchando ideas: proyectos y desafíos.",
  abiertoA: ["Proyectos freelance", "Hackatones"],
  tiempoRespuesta: "Respondo en menos de 24 h",
  horario: "Lun a vie, 9 a 18 h",
  agenda: "https://cal.com/yo/30min",
};
const SOLO_CORREO: Perfil["contacto"] = { ...perfil.contacto, correo: "yo@mail.com" };

/** Los nombres de las fichas de la lista que nombra `rotulo` («Escribime» o «Seguime») */
function listaContacto(caja: Element, rotulo: string) {
  const etiqueta = [...caja.querySelectorAll("main p[id]")].find((p) => p.textContent === rotulo);
  return etiqueta ? caja.querySelector(`main ul[aria-labelledby="${etiqueta.id}"]`) : null;
}
const nombreDeFicha = (ficha: Element) => document.getElementById(ficha.getAttribute("aria-labelledby") ?? "")?.textContent;
const fichasDe = (lista: Element | null) => [...(lista?.querySelectorAll("article") ?? [])].map(nombreDeFicha);
const fichasAbiertas = (caja: Element) => [...caja.querySelectorAll("main article[data-abierta]")].map(nombreDeFicha);

describe("Contacto de la vista RR-DEV", () => {
  beforeEach(() => servidor(null, { contacto: CONTACTO_COMPLETO, disponibilidad: { disponible: true, texto: "Abierto a nuevas ofertas" } }));

  it("al centro, el título, cuántas formas de contactarme hay y el mensaje, con lo de después de los dos puntos en degradado", async () => {
    const { caja } = await navegar("/contacto");
    await hasta(() => expect(caja.textContent).toContain("7 formas de contactarme"));

    expect(caja.querySelector("main h1")?.textContent).toBe("Contacto");
    const frase = caja.querySelector(".frase-contacto");
    expect(frase?.textContent).toBe("Estoy escuchando ideas: proyectos y desafíos.");
    expect(frase?.querySelector("span")?.textContent).toBe("proyectos y desafíos.");
  });

  it("«Escribime» lleva el correo, WhatsApp, la llamada y la videollamada; «Seguime», las redes. Entra abierta la primera de cada una", async () => {
    const { caja } = await navegar("/contacto");
    await hasta(() => expect(fichasDe(listaContacto(caja, "Escribime"))).toEqual(["Correo", "WhatsApp", "Llamada", "Videollamada"]));

    expect(fichasDe(listaContacto(caja, "Seguime"))).toEqual(["LinkedIn", "GitHub", "Sitio web"]);
    expect(fichasAbiertas(caja)).toEqual(["Correo", "LinkedIn"]);
    // Debajo del nombre, el correo, el número o la dirección sin https:// ni www.
    const subtitulos = [...caja.querySelectorAll("main article h2 button")].map((boton) => boton.querySelector(".truncate")?.textContent);
    expect(subtitulos).toEqual(["yo@mail.com", "+54 9 11 5555-1234", "+54 9 11 5555-1234", "Agendá un horario", "linkedin.com/in/yo", "github.com/yo", "misitio.com"]);
  });

  it("cada ficha abre lo suyo: el correo, WhatsApp y la agenda con solo los dígitos o el link; lo de afuera, en otra pestaña", async () => {
    const { caja } = await navegar("/contacto");
    await hasta(() => expect(fichasDe(listaContacto(caja, "Escribime"))).toHaveLength(4));

    const acciones = [...listaContacto(caja, "Escribime")!.querySelectorAll<HTMLAnchorElement>("article a")].map((a) => [
      a.textContent,
      a.getAttribute("href"),
      a.target,
    ]);
    expect(acciones).toEqual([
      ["Escribir: Correo", "mailto:yo@mail.com", ""],
      ["Abrir WhatsApp: WhatsApp", "https://wa.me/5491155551234", "_blank"],
      ["Llamar: Llamada", "tel:+5491155551234", ""],
      ["Agendar: Videollamada", "https://cal.com/yo/30min", "_blank"],
    ]);
    const perfiles = [...listaContacto(caja, "Seguime")!.querySelectorAll<HTMLAnchorElement>("article a")];
    expect(perfiles.map((a) => a.getAttribute("href"))).toEqual(CONTACTO_COMPLETO.redes.map(({ url }) => url));
    expect([...caja.querySelectorAll<HTMLAnchorElement>("main a[target='_blank']")].every((a) => a.rel === "noopener noreferrer")).toBe(true);
    // Lo que dice cada una abierta: cuánto tardo en responder y mi horario
    const correo = caja.querySelector("main article")!;
    expect(correo.textContent).toContain("Respondo en menos de 24 h");
  });

  it("tocar otra ficha la abre y cierra la anterior de su lista; la otra lista no cambia", async () => {
    const { caja } = await navegar("/contacto");
    await hasta(() => expect(fichasAbiertas(caja)).toEqual(["Correo", "LinkedIn"]));

    const whatsapp = [...caja.querySelectorAll("main article")].find((ficha) => nombreDeFicha(ficha) === "WhatsApp")!;
    const boton = whatsapp.querySelector("h2 button")!;
    expect(document.getElementById(boton.getAttribute("aria-controls")!)?.hasAttribute("inert")).toBe(true);
    await clic(boton);

    expect(fichasAbiertas(caja)).toEqual(["WhatsApp", "LinkedIn"]);
    expect(whatsapp.textContent).toContain("Lun a vie, 9 a 18 h");
    expect(document.getElementById(boton.getAttribute("aria-controls")!)?.hasAttribute("inert")).toBe(false);
  });

  it("«Copiar» copia el correo y avisa en el mismo botón", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    try {
      const { caja } = await navegar("/contacto");
      await hasta(() => expect(fichasAbiertas(caja)).toContain("Correo"));

      const copiar = [...caja.querySelectorAll("main button")].find((boton) => boton.textContent === "Copiar")!;
      await clic(copiar);

      expect(writeText).toHaveBeenCalledWith("yo@mail.com");
      await hasta(() => expect(copiar.textContent).toBe("Copiado"));
    } finally {
      delete (navigator as { clipboard?: unknown }).clipboard;
    }
  });

  it("en el celular, las redes también van en una fila de logos que se abren en otra pestaña", async () => {
    const { caja } = await navegar("/contacto");
    await hasta(() => expect(fichasDe(listaContacto(caja, "Seguime"))).toHaveLength(3));

    const logos = [...caja.querySelectorAll<HTMLAnchorElement>("main li > a[aria-label]")];
    expect(logos.map((a) => a.getAttribute("aria-label"))).toEqual(["LinkedIn", "GitHub", "Sitio web"]);
    expect(logos.every((a) => a.target === "_blank")).toBe(true);
  });

  it("al centro, «Abierto a» y la disponibilidad", async () => {
    const { caja } = await navegar("/contacto");
    await hasta(() => expect(caja.textContent).toContain("Abierto a nuevas ofertas"));

    const temas = [...caja.querySelectorAll(".abierto-contacto li")].map((li) => li.textContent);
    expect(temas).toEqual(["Proyectos freelance", "Hackatones"]);
  });

  it("con solo el correo: una ficha, sin mensaje, sin «Abierto a» y sin «Seguime»", async () => {
    servidor(null, { contacto: SOLO_CORREO, disponibilidad: { disponible: false, texto: "" } });
    const { caja } = await navegar("/contacto");
    await hasta(() => expect(caja.textContent).toContain("1 forma de contactarme"));

    expect(fichasDe(listaContacto(caja, "Escribime"))).toEqual(["Correo"]);
    expect(listaContacto(caja, "Seguime")).toBeNull();
    expect(caja.querySelector(".frase-contacto")).toBeNull();
    expect(caja.querySelector(".abierto-contacto")).toBeNull();
  });

  describe("cuentas", () => {
    it("sin WhatsApp, el teléfono es solo una llamada; sin agenda no hay videollamada", () => {
      const sinWhatsapp = { ...CONTACTO_COMPLETO, telefono: { numero: "+54 11 4444-5555", whatsapp: false }, agenda: null };
      expect(formasDeEscribir(sinWhatsapp).map(({ id }) => id)).toEqual(["correo", "llamada"]);
      expect(formasDeEscribir(SOLO_CORREO).map(({ id }) => id)).toEqual(["correo"]);
      expect(cuantasFormas(CONTACTO_COMPLETO)).toBe(7);
      expect(cuantasFormas(SOLO_CORREO)).toBe(1);
    });

    it("las redes: su nombre, la dirección corta y un color desde el segundo; un sitio y otro enlace llevan ícono", () => {
      const redes = formasDeSeguir(CONTACTO_COMPLETO);
      expect(redes.map(({ nombre, valor, tono }) => [nombre, valor, tono])).toEqual([
        ["LinkedIn", "linkedin.com/in/yo", "exito"],
        ["GitHub", "github.com/yo", "aviso"],
        ["Sitio web", "misitio.com", "rosa"],
      ]);
      expect(redes[0]?.logo).toBe(LOGOS_RED.linkedin);
      expect(redes[2]?.logo).toBeUndefined();
      expect(redes[2]?.icono).toBeDefined();
    });

    it("los dígitos para wa.me y tel:, la dirección sin https:// y el mensaje partido en los dos puntos", () => {
      expect(soloDigitos("+54 9 11 5555-1234")).toBe("5491155551234");
      expect(sinProtocolo("https://www.linkedin.com/in/yo/")).toBe("linkedin.com/in/yo");
      expect(partirMensaje("Estoy escuchando ideas: proyectos.")).toEqual(["Estoy escuchando ideas:", "proyectos."]);
      expect(partirMensaje("Sin dos puntos")).toEqual(["Sin dos puntos", ""]);
      expect(TEXTOS_CONTACTO.cuenta(1)).toBe("1 forma de contactarme");
    });
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

    // Desde Marte. Un proyecto abierto por su dirección se ve desde el mismo lugar que Proyectos
    for (const ruta of ["/proyectos", "/proyectos/facturacion"]) {
      const proyectos = await navegar(ruta);
      expect(cielo(proyectos.caja), ruta).toEqual({ estrellas: 405, aurora: 3, fugaz: 1, sol: 1, planetas: 4 });
    }

    const contacto = await navegar("/contacto");
    expect(cielo(contacto.caja)).toEqual({ estrellas: 405, aurora: 3, fugaz: 1, sol: 1, planetas: 5 });

    // Desde Saturno. Una publicación se ve desde el mismo lugar que el blog
    for (const ruta of ["/blog", "/blog/una-entrada"]) {
      const blog = await navegar(ruta);
      expect(cielo(blog.caja), ruta).toEqual({ estrellas: 405, aurora: 3, fugaz: 1, sol: 1, planetas: 6 });
    }

    for (const ruta of ["/no-existe"]) {
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

  it("Saturno pasa sus 72 fotogramas de a uno, cada 70 ms: la vuelta dura 5 s", () => {
    expect(SATURNO.fotogramas).toHaveLength(72);
    expect(SATURNO.deAUno).toBe(true);
    expect(MS_POR_CUADRO).toBe(70);
    expect(SATURNO.vuelta).toBeCloseTo(5.04);
  });

  it("el fotograma de Saturno sale del tiempo que pasó, no de contar cuadros, y al terminar vuelve al primero", () => {
    expect(cuadroEn(0, 72, 70)).toBe(0);
    expect(cuadroEn(69.9, 72, 70)).toBe(0);
    expect(cuadroEn(70, 72, 70)).toBe(1);
    // Si el navegador se trabó medio segundo, salta a donde corresponde: no se atrasa
    expect(cuadroEn(70 + 500, 72, 70)).toBe(8);
    expect(cuadroEn(71 * 70, 72, 70)).toBe(71);
    expect(cuadroEn(72 * 70, 72, 70)).toBe(0);
    // El primer cuadro puede llegar con una hora apenas anterior a la del arranque
    expect(cuadroEn(-3, 72, 70)).toBe(0);
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
    // Siempre le muestra la misma cara a la Tierra: no gira sobre su eje, y le alcanza un fotograma
    expect(LUNA.vuelta).toBe(0);
    expect(LUNA.fotogramas).toHaveLength(1);
  });

  it("los astros que giran traen sus mismos fotogramas en chico, para cuando se ven de lejos", () => {
    for (const astro of [SOL, MERCURIO, VENUS, TIERRA, MARTE, JUPITER]) {
      expect(astro.chicos).toHaveLength(astro.fotogramas.length);
      expect(astro.chicos?.map((url) => url.split("/").pop()?.split("-")[0].split(".")[0])).toEqual(
        astro.fotogramas.map((url) => url.split("/").pop()?.split("-")[0].split(".")[0]),
      );
    }
  });

  it("pasa a los fotogramas chicos de lejos y vuelve a los grandes de cerca, con un margen en el medio", () => {
    expect(usarChicos(200, false)).toBe(true);
    expect(usarChicos(300, true)).toBe(false);
    // Entre los dos límites sigue con los que tiene: no va y viene
    expect(usarChicos(248, false)).toBe(false);
    expect(usarChicos(248, true)).toBe(true);
  });

  it("de cerca dibuja 30 veces por segundo; de lejos menos, sin que la superficie se corra más de medio píxel", () => {
    // Mercurio de cerca, como en Inicio en una pantalla de alta densidad: en 3000 píxeles reales
    expect(intervaloDeDibujo(MERCURIO, 3000)).toBeCloseTo(1000 / 30);
    for (const astro of [SOL, MERCURIO, VENUS, TIERRA, MARTE, JUPITER]) {
      for (const lado of [20, 60, 200, 800]) {
        const intervalo = intervaloDeDibujo(astro, lado);
        const corrimiento = ((2 * Math.PI) / astro.vuelta) * (lado / 2) * astro.radio * (intervalo / 1000);
        // Nunca más seguido que hoy, y si espera más, la superficie no se corre más de medio píxel
        expect(intervalo).toBeGreaterThanOrEqual(1000 / 30);
        if (intervalo > 1000 / 30) expect(corrimiento).toBeLessThanOrEqual(0.5 + 1e-9);
        // El fundido de un fotograma al siguiente avanza en al menos 16 pasos
        expect(intervalo).toBeLessThanOrEqual(((astro.vuelta / astro.fotogramas.length) * 1000) / 16 + 1e-9);
      }
    }
    // Un Mercurio lejano, de 20 píxeles, se dibuja unas 4 veces por segundo
    expect(intervaloDeDibujo(MERCURIO, 20)).toBeGreaterThan(200);
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
    // Una publicación se ve desde el mismo lugar que el blog, y un proyecto, desde Proyectos
    expect(["/blog", "/blog/", "/blog/una-entrada"].map(pasoDe)).toEqual([5, 5, 5]);
    expect(["/proyectos/facturacion", "/proyectos/facturacion/"].map(pasoDe)).toEqual([3, 3]);
    expect(["/blogs", "/proyectosx/a", "/__proto__", "/toString"].map(pasoDe)).toEqual([
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
    // Lo que tiene algo dibujado en sus 72 fotogramas (de 1600 × 892, con el disco en 807, 427.7 y un radio de 250.3)
    const asoma = (paso: number, pantalla: typeof ESCRITORIO) => {
      const { x, y, diametro } = ubicacion(5, paso, pantalla);
      const escala = diametro / 500.6;
      const giro = Math.atan2(pantalla.solY - y, pantalla.solX - x);
      let dentro = 0;
      for (let u = 124; u <= 1476; u += 20) {
        for (let v = 96; v <= 793; v += 20) {
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
    servidor(null, { contacto: { ...perfil.contacto, redes: [{ tipo: "github", url }, { tipo: "sitio", url: "https://misitio.com/" }] } });
    const { caja } = await navegar("/");

    await hasta(() => expect(red(caja, "GitHub")).not.toBeNull());

    expect(red(caja, "GitHub")?.getAttribute("href")).toBe(url);
    expect(red(caja, "GitHub")?.getAttribute("target")).toBe("_blank");
    expect(red(caja, "GitHub")?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(red(caja, "Sitio web")).not.toBeNull();
    expect(caja.textContent).toContain("Seguime en");
  });

  it("en horizontal y en vertical las redes se presentan con su texto a la vista", async () => {
    servidor(null, { contacto: { ...perfil.contacto, redes: [{ tipo: "github", url: "https://github.com/alguien" }] } });
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

describe("la web pública dibuja la vista que eligió el administrador", () => {
  const html = () => document.documentElement.style;
  const elegir = (store: ReturnType<typeof makeStore>, vista: string) =>
    act(async () => {
      store.dispatch(
        portafolioApi.util.updateQueryData("getPerfil", undefined, (p) => {
          p.vista = vista;
        }),
      );
    });

  afterEach(() => document.documentElement.removeAttribute("style"));

  it("hasta que llega el perfil no dibuja ninguna, para no mostrar una y saltar a otra", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>(() => {})),
    );
    const { caja } = await montar(<PublicLayout />, "/", { sinEsperar: true });

    expect(caja.querySelector("header")).toBeNull();
    expect(caja.firstElementChild?.className).toContain("bg-fondo");
  });

  it("sin vista elegida (null), la de por defecto: mi.universo", async () => {
    const { caja } = await montar(<PublicLayout />);
    await hasta(() => expect(caja.querySelector(".isla")).not.toBeNull());
  });

  it("dibuja la elegida en el perfil y nunca quedan dos encabezados", async () => {
    servidor(null, { vista: "basica" });
    const { caja } = await montar(<PublicLayout />);

    await hasta(() => expect(caja.querySelector("header")?.textContent).toContain("Ingresar"));
    expect(caja.querySelector(".isla")).toBeNull();
    expect(caja.querySelectorAll("header")).toHaveLength(1);
    expect(caja.querySelector("header")?.textContent).toContain("Ricardo Ramirez");
  });

  it("si la elegida ya no existe usa la primera", async () => {
    servidor(null, { vista: "no-existe" });
    const { caja } = await montar(<PublicLayout />);

    await hasta(() => expect(caja.querySelector(".isla")).not.toBeNull());
    expect(caja.querySelectorAll("header")).toHaveLength(1);
  });

  it("aplica el tema de ESE portafolio, con el modo del visitante, y el panel no lo cambia", async () => {
    const { store } = await montar(<PublicLayout />);
    const [negro, uva] = rrDev.tema.modos;
    await hasta(() => expect(html().getPropertyValue("--fondo")).toBe(negro!.colores.fondo));

    await act(async () => {
      store.dispatch(setModoVista({ vista: "rr-dev", modo: uva!.id }));
    });
    expect(html().getPropertyValue("--fondo")).toBe(uva!.colores.fondo);

    // Cambiar la paleta del panel no toca la web pública
    await act(async () => {
      store.dispatch(setPaleta("negro-violeta"));
    });
    expect(html().getPropertyValue("--fondo")).toBe(uva!.colores.fondo);
  });

  it("al pasar a otro portafolio aplica sus colores, sin arrastrar el modo del anterior", async () => {
    const { caja, store } = await montar(<PublicLayout />);
    await hasta(() => expect(caja.querySelector(".isla")).not.toBeNull());
    await act(async () => {
      store.dispatch(setModoVista({ vista: "rr-dev", modo: "uva-neon" }));
    });

    await elegir(store, "basica");
    await hasta(() => expect(caja.querySelector("header")?.textContent).toContain("Ingresar"));

    const basica = VISTAS.find(({ id }) => id === "basica")!.tema.modos[0]!.colores;
    await hasta(() => expect(html().getPropertyValue("--fondo")).toBe(basica.fondo));
    expect(html().getPropertyValue("--primario")).toBe(basica.primario);
    expect(store.getState().modoVista).toEqual({ "rr-dev": "uva-neon" });
  });
});
