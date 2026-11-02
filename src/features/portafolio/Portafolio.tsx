import type { ReactNode } from "react";
import {
  agruparPor,
  CATEGORIA,
  estadoEstudio,
  mes,
  MODALIDAD,
  NIVEL,
  parrafos,
  RED,
  rango,
  TIENDA,
  TIPO_DATO,
  TIPO_ESTUDIO,
  TIPO_PROYECTO,
} from "./formato";
import { usePortafolio } from "./usePortafolio";
import type { Estudio, Experiencia, Perfil, Proyecto } from "./types";

/** El portafolio completo como texto, sin estilos. Contrato: docs/api/IMPLEMENTACION_ME.md */
export function Portafolio() {
  const { datos, error, cargando } = usePortafolio();

  if (cargando) return <p>Cargando…</p>;
  if (error) return <p>Error: {error}</p>;
  if (!datos) return null;

  const { perfil, proyectos, experiencia, estudios } = datos;

  return (
    <>
      <SeccionPerfil perfil={perfil} />
      <SeccionProyectos proyectos={proyectos} correo={perfil.correoContacto} />
      <SeccionExperiencia experiencia={experiencia} />
      <SeccionEstudios estudios={estudios} />
    </>
  );
}

export function EnlaceExterno({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export function Parrafos({ texto }: { texto: string }) {
  return (
    <>
      {parrafos(texto).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

function SeccionPerfil({ perfil }: { perfil: Perfil }) {
  const { disponibilidad } = perfil;

  return (
    <section>
      <h1>{perfil.nombreVisible}</h1>
      <p>{perfil.rol}</p>
      <p>{perfil.frase}</p>
      <p>
        {perfil.ubicacion.ciudad}, {perfil.ubicacion.pais} · {MODALIDAD[perfil.modalidad]}
      </p>
      <p>
        {disponibilidad.disponible ? "Disponible" : "No disponible"}
        {disponibilidad.texto && `: ${disponibilidad.texto}`}
      </p>
      {perfil.foto && (
        <p>
          Foto: <EnlaceExterno href={perfil.foto.url}>{perfil.foto.alt}</EnlaceExterno>
        </p>
      )}

      <h2>Sobre mí</h2>
      <p>{perfil.bioCorta}</p>
      <Parrafos texto={perfil.bioLarga} />

      <h2>Contacto</h2>
      <p>
        Correo: <a href={`mailto:${perfil.correoContacto}`}>{perfil.correoContacto}</a>
      </p>
      <ul>
        {perfil.redes.map((red) => (
          <li key={red.url}>
            <EnlaceExterno href={red.url}>{RED[red.tipo]}</EnlaceExterno>
          </li>
        ))}
      </ul>
      {perfil.cv && (
        <p>
          <EnlaceExterno href={perfil.cv.url}>Descargar CV</EnlaceExterno>
        </p>
      )}

      <h2>Habilidades</h2>
      {agruparPor(perfil.habilidades, (h) => h.categoria).map(([categoria, habilidades]) => (
        <p key={categoria}>
          {CATEGORIA[categoria]}: {habilidades.map((h) => h.nombre).join(", ")}
        </p>
      ))}

      <h2>Idiomas</h2>
      <ul>
        {perfil.idiomas.map((i) => (
          <li key={i.idioma}>
            {i.idioma}: {NIVEL[i.nivel]}
          </li>
        ))}
      </ul>

      <h2>Datos curiosos</h2>
      {agruparPor(perfil.datosCuriosos, (d) => d.tipo).map(([tipo, datos]) => (
        <div key={tipo}>
          <h3>{TIPO_DATO[tipo]}</h3>
          <ul>
            {datos.map((d) => (
              <li key={d.titulo}>
                {d.titulo}: {d.valor}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function SeccionProyectos({ proyectos, correo }: { proyectos: Proyecto[]; correo: string }) {
  return (
    <section>
      <h2>Proyectos</h2>
      {proyectos.length === 0 && <p>Todavía no hay proyectos publicados.</p>}
      {proyectos.map((proyecto) => (
        <FichaProyecto key={proyecto.id} proyecto={proyecto} correo={correo} />
      ))}
    </section>
  );
}

/** Todo el proyecto como texto. Se usa en la lista y en el detalle */
export function FichaProyecto({ proyecto, correo }: { proyecto: Proyecto; correo?: string }) {
  const { enlaces } = proyecto;

  return (
    <article>
      <h3>
        {proyecto.titulo}
        {proyecto.destacado && " (destacado)"}
      </h3>
      <p>
        {TIPO_PROYECTO[proyecto.tipo]} · {proyecto.rol} · desde {mes(proyecto.fecha)}
      </p>
      <p>{proyecto.resumen}</p>
      <Parrafos texto={proyecto.descripcion} />
      {proyecto.tecnologias.length > 0 && <p>Tecnologías: {proyecto.tecnologias.join(", ")}</p>}

      <ul>
        {enlaces.demo && (
          <li>
            <EnlaceExterno href={enlaces.demo}>Ver demo</EnlaceExterno>
          </li>
        )}
        {enlaces.repositorios.map((r) => (
          <li key={r.url}>
            Repositorio: <EnlaceExterno href={r.url}>{r.nombre}</EnlaceExterno>
          </li>
        ))}
        {enlaces.tiendas.map((t) => (
          <li key={`${t.tienda}-${t.app}`}>
            {TIENDA[t.tienda]}: <EnlaceExterno href={t.url}>{t.app}</EnlaceExterno>
          </li>
        ))}
        {enlaces.apkDemo && (
          <li>
            <EnlaceExterno href={enlaces.apkDemo.url}>Descargar APK demo</EnlaceExterno>
            {enlaces.apkDemo.nota && <p>{enlaces.apkDemo.nota}</p>}
          </li>
        )}
        {enlaces.demoPorSolicitud && (
          <li>
            Demo por Meet a pedido
            {correo && (
              <>
                {": "}
                <a href={`mailto:${correo}?subject=${encodeURIComponent(`Demo de ${proyecto.titulo}`)}`}>
                  pedila por correo
                </a>
              </>
            )}
          </li>
        )}
      </ul>

      {proyecto.portada && (
        <p>
          Portada: <EnlaceExterno href={proyecto.portada.url}>{proyecto.portada.alt}</EnlaceExterno>
        </p>
      )}
      {proyecto.galeria.length > 0 && (
        <>
          <p>Galería:</p>
          <ul>
            {proyecto.galeria.map((imagen) => (
              <li key={imagen.url}>
                <EnlaceExterno href={imagen.url}>{imagen.alt}</EnlaceExterno>
              </li>
            ))}
          </ul>
        </>
      )}
      {proyecto.documentos.length > 0 && (
        <>
          <p>Documentos:</p>
          <ul>
            {proyecto.documentos.map((doc) => (
              <li key={doc.url}>
                <EnlaceExterno href={doc.url}>{doc.titulo}</EnlaceExterno>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}

function SeccionExperiencia({ experiencia }: { experiencia: Experiencia[] }) {
  return (
    <section>
      <h2>Experiencia</h2>
      {experiencia.length === 0 && <p>Todavía no hay experiencia publicada.</p>}
      {experiencia.map((trabajo) => (
        <article key={trabajo.id}>
          <h3>
            {trabajo.puesto} en {trabajo.empresa}
          </h3>
          <p>
            {rango(trabajo.desde, trabajo.hasta)}
            {trabajo.ubicacion && ` · ${trabajo.ubicacion}`} · {MODALIDAD[trabajo.modalidad]}
          </p>
          <Parrafos texto={trabajo.descripcion} />
          {trabajo.logros.length > 0 && (
            <>
              <p>Logros:</p>
              <ul>
                {trabajo.logros.map((logro) => (
                  <li key={logro}>{logro}</li>
                ))}
              </ul>
            </>
          )}
          {trabajo.tecnologias.length > 0 && <p>Tecnologías: {trabajo.tecnologias.join(", ")}</p>}
        </article>
      ))}
    </section>
  );
}

function SeccionEstudios({ estudios }: { estudios: Estudio[] }) {
  return (
    <section>
      <h2>Estudios</h2>
      {estudios.length === 0 && <p>Todavía no hay estudios publicados.</p>}
      {estudios.map((estudio) => (
        <article key={estudio.id}>
          <h3>
            {estudio.titulo}, {estudio.institucion}
          </h3>
          <p>
            {TIPO_ESTUDIO[estudio.tipo]} · {rango(estudio.desde, estudio.hasta, "en curso")} · {estadoEstudio(estudio)}
          </p>
          <Parrafos texto={estudio.descripcion} />
          {estudio.urlVerificacion && (
            <p>
              <EnlaceExterno href={estudio.urlVerificacion}>Verificar certificado</EnlaceExterno>
            </p>
          )}
          {estudio.certificado && (
            <p>
              <EnlaceExterno href={estudio.certificado.url}>Ver certificado</EnlaceExterno>
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
