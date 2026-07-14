import { useToastStore } from '../../../shared/stores/toast-store'
import { FINCA_ACTUAL } from '../../../shared/constants/finca.constants'
import { descargarBlob } from '../../../shared/lib/descargar-blob'
import { quitarDiacriticos } from '../../../shared/utils/quitar-diacriticos'
import { generarPdfMetricasTrabajador } from '../utils/generar-pdf-metricas-trabajador'
import type { MetricaPorLabor, TrabajadorMetricasTotales } from '../types/trabajador-metricas.types'

interface UseDescargarMetricasTrabajadorPdfParams {
  trabajadorNombre: string
  metricasPorLabor: readonly MetricaPorLabor[]
  totales: TrabajadorMetricasTotales
}

export function useDescargarMetricasTrabajadorPdf({ trabajadorNombre, metricasPorLabor, totales }: UseDescargarMetricasTrabajadorPdfParams) {
  const mostrarToast = useToastStore((state) => state.mostrarToast)

  function descargar() {
    const blob = generarPdfMetricasTrabajador({ trabajadorNombre, fincaNombre: FINCA_ACTUAL.nombre, metricasPorLabor, totales })
    descargarBlob(blob, crearNombreArchivo(trabajadorNombre))
    mostrarToast({ type: 'success', title: 'PDF descargado', description: `Metricas de ${trabajadorNombre} exportadas.` })
  }

  return { descargar }
}

function crearNombreArchivo(trabajadorNombre: string): string {
  const slug = quitarDiacriticos(trabajadorNombre.toLowerCase())
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `metricas-${slug || 'trabajador'}.pdf`
}
