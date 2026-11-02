import { Link } from "react-router";
import { fechaLarga, mensajeDetalle } from "@/features/portafolio/formato";
import { EnlaceExterno, Parrafos } from "@/features/portafolio/Portafolio";
import { useGetEntradaQuery } from "./blogApi";

export function EntradaDetalle({ slug }: { slug: string }) {
  // currentData y no data: al cambiar de slug no se muestra la entrada anterior mientras carga
  const { currentData: entrada, error } = useGetEntradaQuery(slug);

  if (error) return <p>{mensajeDetalle(error, "Esta publicación no existe o no está publicada.")}</p>;
  if (!entrada) return <p>Cargando…</p>;

  return (
    <article>
      <p>
        <Link to="/blog">Volver al blog</Link>
      </p>
      <h1>{entrada.titulo}</h1>
      {entrada.publicadoEn && <p>{fechaLarga(entrada.publicadoEn)}</p>}
      {entrada.portada?.url && <img src={entrada.portada.url} alt={entrada.portada.alt} />}
      <Parrafos texto={entrada.contenido} />

      {entrada.galeria.map((imagen) => imagen.url && <img key={imagen.url} src={imagen.url} alt={imagen.alt} loading="lazy" />)}

      {entrada.documentos.length > 0 && (
        <>
          <h2>Archivos</h2>
          <ul>
            {entrada.documentos.map(
              (doc) =>
                doc.url && (
                  <li key={doc.url}>
                    <EnlaceExterno href={doc.url}>{doc.titulo}</EnlaceExterno>
                  </li>
                ),
            )}
          </ul>
        </>
      )}

      {entrada.etiquetas.length > 0 && <p>{entrada.etiquetas.join(" · ")}</p>}
    </article>
  );
}
