import { Link } from "react-router";
import { fechaLarga } from "@/features/portafolio/formato";
import { getErrorMessage } from "@/lib/errors";
import { useGetEntradasQuery } from "./blogApi";

/** Las entradas publicadas como texto, sin estilos, igual que el portafolio */
export function BlogLista() {
  const { data: entradas, isLoading, error } = useGetEntradasQuery();

  if (isLoading) return <p>Cargando…</p>;
  if (error) return <p>Error: {getErrorMessage(error)}</p>;

  return (
    <section>
      <h1>Blog</h1>
      {entradas?.length === 0 && <p>Todavía no hay publicaciones.</p>}
      {entradas?.map((entrada) => (
        <article key={entrada.id}>
          <h2>
            <Link to={`/blog/${entrada.slug}`}>{entrada.titulo}</Link>
          </h2>
          {entrada.publicadoEn && <p>{fechaLarga(entrada.publicadoEn)}</p>}
          {entrada.portada?.url && <img src={entrada.portada.url} alt={entrada.portada.alt} loading="lazy" />}
          <p>{entrada.resumen}</p>
          {entrada.etiquetas.length > 0 && <p>{entrada.etiquetas.join(" · ")}</p>}
        </article>
      ))}
    </section>
  );
}
