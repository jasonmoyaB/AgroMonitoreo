import type { SentidoFiltroTraslado, Traslado, TrasladosFiltros } from '../types/traslado.types'

export const FILTROS_TRASLADOS_VACIOS: TrasladosFiltros = {
  trabajador: '',
  estado: 'todos',
  finca: '',
  sentido: 'todos',
  desde: '',
  hasta: '',
}

export function filtrarTraslados(traslados: readonly Traslado[], filtros: TrasladosFiltros, fincaPropiaId = ''): Traslado[] {
  return traslados.filter(
    (traslado) =>
      traslado.trabajadorNombre.toLowerCase().includes(filtros.trabajador.trim().toLowerCase()) &&
      (filtros.estado === 'todos' || traslado.estado === filtros.estado) &&
      (filtros.finca === '' || traslado.fincaOrigenNombre === filtros.finca || traslado.fincaDestinoNombre === filtros.finca) &&
      // las fechas son ISO yyyy-mm-dd: comparar como string es correcto y evita el desfase de timezone
      (filtros.desde === '' || traslado.fecha >= filtros.desde) &&
      (filtros.hasta === '' || traslado.fecha <= filtros.hasta) &&
      coincideSentido(traslado, filtros.sentido, fincaPropiaId),
  )
}

function coincideSentido(traslado: Traslado, sentido: SentidoFiltroTraslado, fincaPropiaId: string): boolean {
  if (sentido === 'todos' || fincaPropiaId === '') return true
  return sentido === 'recibido' ? traslado.fincaDestinoId === fincaPropiaId : traslado.fincaOrigenId === fincaPropiaId
}
