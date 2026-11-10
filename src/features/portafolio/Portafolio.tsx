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
      <SeccionProyectos proyectos={proyectos} />
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

/** wa.me y tel: piden solo dígitos */
const soloDigitos = (numero: string) => numero.replace(/\D/g, "");

/** Cada dato opcional se muestra solo si tiene valor */
function SeccionContacto({ contacto }: { contacto: Perfil["contacto"] }) {
  const { correo, telefono, redes, mensaje, abiertoA, tiempoRespuesta, horario, agenda } = contacto;

  return (
    <>
      <h2>Contacto</h2>
      {mensaje && <p>{mensaje}</p>}
      {abiertoA.length > 0 && <p>Abierto a: {abiertoA.join(" · ")}</p>}
      <p>
        Correo: <a href={`mailto:${correo}`}>{correo}</a>
      </p>
      {telefono && (
        <p>
          Teléfono: <a href={`tel:+${soloDigitos(telefono.numero)}`}>{telefono.numero}</a>
          {telefono.whatsapp && (
            <>
              {" · "}
              <EnlaceExterno href={`https://wa.me/${soloDigitos(telefono.numero)}`}>WhatsApp</EnlaceExterno>
            </>
          )}
        </p>
      )}
      {agenda && (
        <p>
          <EnlaceExterno href={agenda}>Agendá una llamada</EnlaceExterno>
        </p>
      )}
      {tiempoRespuesta && <p>{tiempoRespuesta}</p>}
      {horario && <p>Horario: {horario}</p>}
      <ul>
        {redes.map((red) => (
          <li key={red.url}>
            <EnlaceExterno href={red.url}>{RED[red.tipo]}</EnlaceExterno>
          </li>
        ))}
      </ul>
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

      <SeccionContacto contacto={perfil.contacto} />
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

function SeccionProyectos({ proyectos }: { proyectos: Proyecto[] }) {
  return (
    <section>
      <h2>Proyectos</h2>
      {proyectos.length === 0 && <p>Todavía no hay proyectos publicados.</p>}
      {proyectos.map((proyecto) => (
        <FichaProyecto key={proyecto.id} proyecto={proyecto} />
      ))}
    </section>
  );
}

/** Todo el proyecto como texto. Se usa en la lista y en el detalle */
export function FichaProyecto({ proyecto }: { proyecto: Proyecto }) {
  const [portada, ...galeria] = proyecto.galeria; // la primera es la portada

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

      {proyecto.repositorios.length > 0 && (
        <ul>
          {proyecto.repositorios.map((r) => (
            <li key={r.url}>
              Repositorio: <EnlaceExterno href={r.url}>{r.nombre}</EnlaceExterno>
            </li>
          ))}
        </ul>
      )}

      {portada && (
        <p>
          Portada: <EnlaceExterno href={portada.url}>{portada.alt}</EnlaceExterno>
        </p>
      )}
      {galeria.length > 0 && (
        <>
          <p>Galería:</p>
          <ul>
            {galeria.map((imagen) => (
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
