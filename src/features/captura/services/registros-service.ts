import { readLocalValue, writeLocalValue } from '../../../shared/lib/local-db'
import type { RegistroTrabajo } from '../../../shared/types/domain.types'

const CLAVE_ALMACENAMIENTO_REGISTROS = 'registros_trabajo'

function esMismoRegistro(a: RegistroTrabajo, b: RegistroTrabajo): boolean {
  return a.trabajadorId === b.trabajadorId && a.tipoLaborId === b.tipoLaborId && a.fecha === b.fecha
}

export async function listarRegistrosPorFecha(fecha: string): Promise<RegistroTrabajo[]> {
  const registros = await readLocalValue<RegistroTrabajo[]>(CLAVE_ALMACENAMIENTO_REGISTROS, [])
  return registros.filter((registro) => registro.fecha === fecha)
}

export async function listarTodosRegistros(): Promise<RegistroTrabajo[]> {
  return readLocalValue<RegistroTrabajo[]>(CLAVE_ALMACENAMIENTO_REGISTROS, [])
}

export async function crearRegistro(registro: RegistroTrabajo): Promise<RegistroTrabajo> {
  const registros = await readLocalValue<RegistroTrabajo[]>(CLAVE_ALMACENAMIENTO_REGISTROS, [])
  const siguientes = [...registros.filter((existente) => !esMismoRegistro(existente, registro)), registro]
  await writeLocalValue(CLAVE_ALMACENAMIENTO_REGISTROS, siguientes)
  return registro
}
