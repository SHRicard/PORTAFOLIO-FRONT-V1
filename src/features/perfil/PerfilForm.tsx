import { useMemo, useState, type ReactNode } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CampoArchivo } from "@/features/archivos/CampoArchivo";
import { CATEGORIA, MODALIDAD, NIVEL, RED, TIPO_DATO } from "@/features/portafolio/formato";
import { getErrorDetail } from "@/lib/errors";
import { applyServerFieldErrors } from "@/lib/forms";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Casilla } from "@/components/ui/Casilla";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { FilaEditable, ListaEditable } from "@/components/ui/ListaEditable";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useGuardarPerfilMutation } from "./perfilApi";
import {
  aFormulario,
  aPerfilInput,
  campoFormulario,
  CATEGORIAS,
  MODALIDADES,
  NIVELES,
  PERFIL_VACIO,
  perfilSchema,
  REDES,
  TIPOS_DATO,
  type PerfilFormValues,
} from "./schemas";
import type { Perfil } from "./types";

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Card className="space-y-4">
      <h2 className="font-subtitulo text-lg font-semibold text-texto">{titulo}</h2>
      {children}
    </Card>
  );
}

/** Sin perfil: todavía no se cargó y el formulario lo crea */
export function PerfilForm({ perfil }: { perfil?: Perfil }) {
  const [guardar, { isLoading }] = useGuardarPerfilMutation();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const values = useMemo(() => (perfil ? aFormulario(perfil) : undefined), [perfil]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<PerfilFormValues>({ resolver: zodResolver(perfilSchema), defaultValues: PERFIL_VACIO, values });

  const redes = useFieldArray({ control, name: "redes" });
  const habilidades = useFieldArray({ control, name: "habilidades" });
  const idiomas = useFieldArray({ control, name: "idiomas" });
  const datosCuriosos = useFieldArray({ control, name: "datosCuriosos" });

  async function alGuardar(valores: PerfilFormValues) {
    setErrorGeneral(null);
    setGuardado(false);
    try {
      await guardar(aPerfilInput(valores)).unwrap();
      setGuardado(true);
    } catch (err) {
      if (!applyServerFieldErrors(err, setError, campoFormulario)) setErrorGeneral(getErrorDetail(err));
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(alGuardar)} className="space-y-6">
      <Seccion titulo="Presentación">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre visible" htmlFor="nombreVisible" error={errors.nombreVisible?.message}>
            <Input id="nombreVisible" invalid={!!errors.nombreVisible} {...register("nombreVisible")} />
          </Field>
          <Field label="Rol" htmlFor="rol" error={errors.rol?.message}>
            <Input id="rol" invalid={!!errors.rol} {...register("rol")} />
          </Field>
        </div>
        <Field label="Frase (hasta 100 caracteres)" htmlFor="frase" error={errors.frase?.message}>
          <Input id="frase" invalid={!!errors.frase} {...register("frase")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Ciudad" htmlFor="ciudad" error={errors.ciudad?.message}>
            <Input id="ciudad" invalid={!!errors.ciudad} {...register("ciudad")} />
          </Field>
          <Field label="País" htmlFor="pais" error={errors.pais?.message}>
            <Input id="pais" invalid={!!errors.pais} {...register("pais")} />
          </Field>
          <Field label="Modalidad" htmlFor="modalidad" error={errors.modalidad?.message}>
            <Select id="modalidad" invalid={!!errors.modalidad} {...register("modalidad")}>
              {MODALIDADES.map((m) => (
                <option key={m} value={m}>
                  {MODALIDAD[m]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Casilla label="Disponible para ofertas" {...register("disponible")} />
        <Field label="Texto de disponibilidad" htmlFor="disponibilidadTexto" error={errors.disponibilidadTexto?.message}>
          <Input
            id="disponibilidadTexto"
            invalid={!!errors.disponibilidadTexto}
            {...register("disponibilidadTexto")}
          />
        </Field>
      </Seccion>

      <Seccion titulo="Sobre mí">
        <Field label="Bio corta (hasta 280 caracteres)" htmlFor="bioCorta" error={errors.bioCorta?.message}>
          <Textarea id="bioCorta" rows={3} invalid={!!errors.bioCorta} {...register("bioCorta")} />
        </Field>
        <Field
          label="Bio larga (separá los párrafos con una línea en blanco)"
          htmlFor="bioLarga"
          error={errors.bioLarga?.message}
        >
          <Textarea id="bioLarga" rows={10} invalid={!!errors.bioLarga} {...register("bioLarga")} />
        </Field>
      </Seccion>

      <Seccion titulo="Foto y CV">
        <Field label="Foto" htmlFor="fotoUrl" error={errors.fotoUrl?.message}>
          <Controller
            control={control}
            name="fotoUrl"
            render={({ field }) => (
              <CampoArchivo
                id="fotoUrl"
                tipo="imagen"
                carpeta="perfil"
                valor={field.value}
                onCambio={field.onChange}
                invalid={!!errors.fotoUrl}
              />
            )}
          />
        </Field>
        <Field label="Descripción de la foto" htmlFor="fotoAlt" error={errors.fotoAlt?.message}>
          <Input id="fotoAlt" invalid={!!errors.fotoAlt} {...register("fotoAlt")} />
        </Field>
        <Field label="CV (PDF)" htmlFor="cvUrl" error={errors.cvUrl?.message}>
          <Controller
            control={control}
            name="cvUrl"
            render={({ field }) => (
              <CampoArchivo
                id="cvUrl"
                tipo="documento"
                carpeta="perfil"
                valor={field.value}
                onCambio={field.onChange}
                invalid={!!errors.cvUrl}
              />
            )}
          />
        </Field>
      </Seccion>

      <Seccion titulo="Contacto y redes">
        <Field label="Correo público" htmlFor="correoContacto" error={errors.correoContacto?.message}>
          <Input id="correoContacto" type="email" invalid={!!errors.correoContacto} {...register("correoContacto")} />
        </Field>
        <ListaEditable
          titulo="Redes"
          error={errors.redes?.root?.message}
          textoAgregar="Agregar red"
          onAgregar={() => redes.append({ tipo: "github", url: "" })}
        >
          {redes.fields.map((campo, i) => (
            <FilaEditable key={campo.id} etiquetaQuitar={`Quitar red ${i + 1}`} onQuitar={() => redes.remove(i)}>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Red" htmlFor={`red-tipo-${i}`} error={errors.redes?.[i]?.tipo?.message}>
                  <Select id={`red-tipo-${i}`} {...register(`redes.${i}.tipo`)}>
                    {REDES.map((r) => (
                      <option key={r} value={r}>
                        {RED[r]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="URL" htmlFor={`red-url-${i}`} error={errors.redes?.[i]?.url?.message}>
                    <Input id={`red-url-${i}`} type="url" {...register(`redes.${i}.url`)} />
                  </Field>
                </div>
              </div>
            </FilaEditable>
          ))}
        </ListaEditable>
      </Seccion>

      <Seccion titulo="Habilidades">
        <ListaEditable
          titulo="Habilidades"
          error={errors.habilidades?.root?.message}
          textoAgregar="Agregar habilidad"
          onAgregar={() => habilidades.append({ nombre: "", categoria: "front" })}
        >
          {habilidades.fields.map((campo, i) => (
            <FilaEditable
              key={campo.id}
              etiquetaQuitar={`Quitar habilidad ${i + 1}`}
              onQuitar={() => habilidades.remove(i)}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nombre" htmlFor={`hab-nombre-${i}`} error={errors.habilidades?.[i]?.nombre?.message}>
                  <Input id={`hab-nombre-${i}`} {...register(`habilidades.${i}.nombre`)} />
                </Field>
                <Field label="Categoría" htmlFor={`hab-cat-${i}`} error={errors.habilidades?.[i]?.categoria?.message}>
                  <Select id={`hab-cat-${i}`} {...register(`habilidades.${i}.categoria`)}>
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORIA[c]}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </FilaEditable>
          ))}
        </ListaEditable>
      </Seccion>

      <Seccion titulo="Idiomas">
        <ListaEditable
          titulo="Idiomas"
          error={errors.idiomas?.root?.message}
          textoAgregar="Agregar idioma"
          onAgregar={() => idiomas.append({ idioma: "", nivel: "basico" })}
        >
          {idiomas.fields.map((campo, i) => (
            <FilaEditable key={campo.id} etiquetaQuitar={`Quitar idioma ${i + 1}`} onQuitar={() => idiomas.remove(i)}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Idioma" htmlFor={`idioma-${i}`} error={errors.idiomas?.[i]?.idioma?.message}>
                  <Input id={`idioma-${i}`} {...register(`idiomas.${i}.idioma`)} />
                </Field>
                <Field label="Nivel" htmlFor={`nivel-${i}`} error={errors.idiomas?.[i]?.nivel?.message}>
                  <Select id={`nivel-${i}`} {...register(`idiomas.${i}.nivel`)}>
                    {NIVELES.map((n) => (
                      <option key={n} value={n}>
                        {NIVEL[n]}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </FilaEditable>
          ))}
        </ListaEditable>
      </Seccion>

      <Seccion titulo="Datos curiosos">
        <ListaEditable
          titulo="Datos curiosos"
          error={errors.datosCuriosos?.root?.message}
          textoAgregar="Agregar dato"
          onAgregar={() => datosCuriosos.append({ titulo: "", valor: "", tipo: "profesional" })}
        >
          {datosCuriosos.fields.map((campo, i) => (
            <FilaEditable
              key={campo.id}
              etiquetaQuitar={`Quitar dato ${i + 1}`}
              onQuitar={() => datosCuriosos.remove(i)}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Título" htmlFor={`dato-titulo-${i}`} error={errors.datosCuriosos?.[i]?.titulo?.message}>
                  <Input id={`dato-titulo-${i}`} {...register(`datosCuriosos.${i}.titulo`)} />
                </Field>
                <Field label="Valor" htmlFor={`dato-valor-${i}`} error={errors.datosCuriosos?.[i]?.valor?.message}>
                  <Input id={`dato-valor-${i}`} {...register(`datosCuriosos.${i}.valor`)} />
                </Field>
                <Field label="Tipo" htmlFor={`dato-tipo-${i}`} error={errors.datosCuriosos?.[i]?.tipo?.message}>
                  <Select id={`dato-tipo-${i}`} {...register(`datosCuriosos.${i}.tipo`)}>
                    {TIPOS_DATO.map((t) => (
                      <option key={t} value={t}>
                        {TIPO_DATO[t]}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </FilaEditable>
          ))}
        </ListaEditable>
      </Seccion>

      {errorGeneral && <Alert tipo="error">{errorGeneral}</Alert>}
      {Object.keys(errors).length > 0 && <Alert tipo="error">Revisá los campos marcados.</Alert>}
      {guardado && !isDirty && <Alert>Cambios guardados. Ya se ven en la web.</Alert>}

      <Button type="submit" cargando={isLoading}>
        Guardar cambios
      </Button>
    </form>
  );
}
