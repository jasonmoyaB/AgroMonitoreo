import { CampoCedulaHacienda } from '../../../shared/components/CampoCedulaHacienda'
import { CampoTexto } from '../../../shared/components/CampoTexto'
import { SeccionColapsable } from '../../../shared/components/SeccionColapsable'
import { BOTON_PRIMARIO_COMPACTO } from '../../../shared/constants/botones.constants'
import { useDatosPersonalesForm } from '../hooks/use-datos-personales-form'

interface DatosPersonalesFormProps {
  usuarioId: string
}

export function DatosPersonalesForm({ usuarioId }: DatosPersonalesFormProps) {
  const form = useDatosPersonalesForm(usuarioId)
  const { values } = form

  // el titulo y la tarjeta los pone SeccionColapsable: son el area clickeable
  return (
    <SeccionColapsable titulo="Datos personales" descripcion="Todos los campos son opcionales. Solo los ve la oficina.">
      {form.isLoading ? (
        <p className="mt-4 font-bold text-slate-600">Cargando datos...</p>
      ) : (
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit}>
          <CampoTexto etiqueta="Teléfono" valor={values.telefono} onChange={(valor) => form.onFieldChange('telefono', valor)} tipo="tel" />

          {/* NO es el correo de acceso: ese vive en auth.users y no se cambia desde
              aca. La ayuda lo dice para que nadie lo edite creyendo que muda su login. */}
          <CampoTexto
            etiqueta="Correo de contacto"
            valor={values.emailContacto}
            onChange={(valor) => form.onFieldChange('emailContacto', valor)}
            tipo="email"
            ayuda="No cambia el correo con el que iniciás sesión."
          />

          {/* sin onNombreEncontrado: aca el nombre se edita en EditarNombreForm, que es
              otra tarjeta con su propio estado. Hacienda solo confirma de quien es la cedula. */}
          <CampoCedulaHacienda valor={values.cedula} onChange={(valor) => form.onFieldChange('cedula', valor)} />

          {/* input type=date nativo: el picker del sistema ya es tactil y localizado */}
          <CampoTexto etiqueta="Fecha de nacimiento" valor={values.fechaNacimiento} onChange={(valor) => form.onFieldChange('fechaNacimiento', valor)} tipo="date" />

          <div className="sm:col-span-2">
            <CampoTexto etiqueta="Dirección" valor={values.direccion} onChange={(valor) => form.onFieldChange('direccion', valor)} />
          </div>

          <div className="sm:col-span-2">
            <CampoTexto
              etiqueta="Contacto de emergencia"
              valor={values.contactoEmergencia}
              onChange={(valor) => form.onFieldChange('contactoEmergencia', valor)}
              ayuda="Nombre y teléfono de a quién avisar."
            />
          </div>

          <button
            type="submit"
            disabled={form.isSubmitting}
            className={`${BOTON_PRIMARIO_COMPACTO} w-full sm:col-span-2`}
          >
            {form.isSubmitting ? 'Guardando...' : 'Guardar datos'}
          </button>
        </form>
      )}
    </SeccionColapsable>
  )
}
