import tierra from "@/vistas/rr-dev/assets/tierra.webp";

/**
 * Foto del horizonte de la Tierra, recortada y oscurecida, con la luz del sol que late.
 * Llena hasta el fondo de su contenedor posicionado. Es decorativa.
 */
export function HorizonGlow() {
  return (
    <div aria-hidden className="horizonte pointer-events-none">
      <div className="horizonte-planeta">
        <img src={tierra} alt="" className="horizonte-tierra" />
        <img src={tierra} alt="" className="horizonte-tierra horizonte-tierra-sol" />
      </div>
      <div className="horizonte-sol" />
    </div>
  );
}
