import type { RegistroTrabajo } from '../../../shared/types/domain.types'

// La cache del dia ya viene acotada a una fecha, asi que alcanza con trabajador + labor:
// es la misma llave del unique de la base (trabajador_id, tipo_labor_id, fecha) contra la
// que `crearRegistro` hace upsert. Reemplazar en vez de agregar evita que corregir un
// registro pinte dos filas del mismo trabajador en la grid.
export function insertarRegistroEnCache(registros: readonly RegistroTrabajo[], nuevo: RegistroTrabajo): RegistroTrabajo[] {
  const yaCargado = registros.some(
    (registro) => registro.trabajadorId === nuevo.trabajadorId && registro.tipoLaborId === nuevo.tipoLaborId
  )

  if (!yaCargado) return [...registros, nuevo]
  return registros.map((registro) =>
    registro.trabajadorId === nuevo.trabajadorId && registro.tipoLaborId === nuevo.tipoLaborId ? nuevo : registro
  )
}
