import { useToastStore } from '../../../shared/stores/toast-store'
import { descargarBlob } from '../../../shared/lib/descargar-blob'
import { crearSlugArchivo } from '../../../shared/utils/crear-slug-archivo'
import { generarPdfMetricasTrabajador } from '../utils/generar-pdf-metricas-trabajador'
import { describirPeriodoMetricas } from '../utils/describir-periodo-metricas'
import type { MetricaPorLabor, TrabajadorMetricasFiltros, TrabajadorMetricasTotales } from '../types/trabajador-metricas.types'

interface UseDescargarMetricasTrabajadorPdfParams {
  trabajadorNombre: string
  fincaNombre: string
  filtros: TrabajadorMetricasFiltros
  metricasPorLabor: readonly MetricaPorLabor[]
  totales: TrabajadorMetricasTotales
}

export function useDescargarMetricasTrabajadorPdf({ trabajadorNombre, fincaNombre, filtros, metricasPorLabor, totales }: UseDescargarMetricasTrabajadorPdfParams) {
  const mostrarToast = useToastStore((state) => state.mostrarToast)

  function descargar() {
    const periodo = describirPeriodoMetricas(filtros)
    const blob = generarPdfMetricasTrabajador({ trabajadorNombre, fincaNombre, periodo, metricasPorLabor, totales })
    descargarBlob(blob, crearNombreArchivo(trabajadorNombre))
    mostrarToast({ type: 'success', title: 'PDF descargado', description: `Metricas de ${trabajadorNombre} exportadas.` })
  }

  return { descargar }
}

function crearNombreArchivo(trabajadorNombre: string): string {
  return `metricas-${crearSlugArchivo(trabajadorNombre) || 'trabajador'}.pdf`
}
