import type { Astro } from "@/vistas/rr-dev/rotacion";

/** Las urls de un `import.meta.glob`, en el orden de sus nombres: el de los fotogramas */
const enOrden = (modulos: Record<string, string>) =>
  Object.entries(modulos)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => url);

/** Los astros del sistema solar de Inicio. Casi todos dan una vuelta sobre su eje en 72 fotogramas, de a 5°; Saturno trae 180 */
export const SOL: Astro = {
  fotogramas: enOrden(
    import.meta.glob<string>("@/vistas/rr-dev/assets/frames-sol/*.webp", { eager: true, query: "?url", import: "default" }),
  ),
  // Medido sobre los fotogramas: el disco está centrado, con un radio de 296 sobre 400
  radio: 296 / 400,
  vuelta: 120,
};

export const MERCURIO: Astro = {
  fotogramas: enOrden(
    import.meta.glob<string>("@/vistas/rr-dev/assets/frames-mercurio/*.webp", {
      eager: true,
      query: "?url",
      import: "default",
    }),
  ),
  // Medido sobre los fotogramas: el disco está centrado, con un radio de 344 sobre 400
  radio: 344 / 400,
  // Se ve grande: con una vuelta más rápida la superficie pasaría corriendo
  vuelta: 300,
};

export const VENUS: Astro = {
  fotogramas: enOrden(
    import.meta.glob<string>("@/vistas/rr-dev/assets/frames-venus/*.webp", { eager: true, query: "?url", import: "default" }),
  ),
  // Medido sobre los fotogramas: el disco está centrado, con un radio de 344 sobre 400
  radio: 344 / 400,
  // Sus nubes son suaves y cambian poco de un fotograma al otro: con una vuelta cada 5 minutos,
  // como los demás, parecía quieto
  vuelta: 60,
  // Medido: entre un fotograma y el siguiente las nubes casi no se corren, y girarlas lo empeoraba
  giroPorFotograma: 0,
};

export const TIERRA: Astro = {
  fotogramas: enOrden(
    import.meta.glob<string>("@/vistas/rr-dev/assets/frames-tierra/*.webp", {
      eager: true,
      query: "?url",
      import: "default",
    }),
  ),
  // Medido sobre los fotogramas: el disco está centrado, con un radio de 344.5 sobre 400
  radio: 344.5 / 400,
  vuelta: 300,
};

export const LUNA: Astro = {
  fotogramas: enOrden(
    import.meta.glob<string>("@/vistas/rr-dev/assets/frames-luna/*.webp", { eager: true, query: "?url", import: "default" }),
  ),
  // Medido sobre los fotogramas: el disco está centrado, con un radio de 344 sobre 400
  radio: 344 / 400,
  // Siempre le muestra la misma cara a la Tierra: no gira sobre su eje
  vuelta: 0,
};

export const MARTE: Astro = {
  fotogramas: enOrden(
    import.meta.glob<string>("@/vistas/rr-dev/assets/frames-marte/*.webp", { eager: true, query: "?url", import: "default" }),
  ),
  // Medido sobre los fotogramas: el disco está centrado, con un radio de 344.5 sobre 400
  radio: 344.5 / 400,
  vuelta: 300,
};

export const JUPITER: Astro = {
  fotogramas: enOrden(
    import.meta.glob<string>("@/vistas/rr-dev/assets/frames-jupiter/*.webp", {
      eager: true,
      query: "?url",
      import: "default",
    }),
  ),
  // Medido sobre los fotogramas: el disco está centrado, con un radio de 344.5 sobre 400
  radio: 344.5 / 400,
  vuelta: 300,
  // Medido: las bandas casi no se corren de un fotograma al otro, y girarlas lo empeoraba
  giroPorFotograma: 0,
};

/** Lo que dura cada fotograma de Saturno, en ms: con 180, la luna da la vuelta en 12.6 s */
export const MS_POR_CUADRO = 70;

const FOTOGRAMAS_SATURNO = enOrden(
  import.meta.glob<string>("@/vistas/rr-dev/assets/frames-saturno/*.webp", {
    eager: true,
    query: "?url",
    import: "default",
  }),
);

export const SATURNO: Astro = {
  fotogramas: FOTOGRAMAS_SATURNO,
  // Con sus anillos: el fotograma es más ancho que alto y el disco no está centrado. Medido: el
  // centro en (807, 427.7) y un radio de 250.3, sobre la mitad del ancho
  radio: 250.3 / 800,
  fotograma: { ancho: 1600, alto: 892 },
  // Lo que más se mueve es una luna que da la vuelta en los 180 fotogramas; el planeta y los anillos
  // cambian apenas. Fundidos, la luna se veía en dos lugares a la vez: se pasan de a uno
  vuelta: (FOTOGRAMAS_SATURNO.length * MS_POR_CUADRO) / 1000,
  deAUno: true,
};
