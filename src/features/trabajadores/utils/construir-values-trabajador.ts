import type { Trabajador } from '../../../shared/types/domain.types'
import type { TrabajadorFormValues } from '../types/trabajador-form.types'

// El dominio usa null para "sin cargar" y el form usa '': un input controlado con
// value={null} pasa a no controlado y React tira warning. La conversion inversa
// (a null al guardar) vive en aNullSiVacio, dentro del service.
export function construirValuesTrabajador(trabajador: Trabajador | null): TrabajadorFormValues {
  return {
    nombreCompleto: trabajador?.nombreCompleto ?? '',
    fotoUrl: trabajador?.fotoUrl ?? '',
    activo: trabajador?.activo ?? true,
    cedula: trabajador?.cedula ?? '',
    fechaIngreso: trabajador?.fechaIngreso ?? '',
    telefono: trabajador?.telefono ?? '',
  }
}
