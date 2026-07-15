import { useState } from 'react'
import { useToastStore } from '../../../shared/stores/toast-store'
import { descargarBlob } from '../../../shared/lib/descargar-blob'
import { construirFechaIso } from '../../captura/utils/fecha-iso'
import { obtenerDiasEnMes } from '../../captura/utils/obtener-dias-en-mes'
import type { Finca } from '../../../shared/types/domain.types'
import { listarAsistenciaPorRango } from '../services/asistencia-service'
import { generarPdfAusencias } from '../utils/generar-pdf-ausencias'

export function useDescargarAusenciasPdf(finca: Pick<Finca, 'id' | 'nombre'>) {
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [isDownloading, setIsDownloading] = useState(false)
  const mostrarToast = useToastStore((state) => state.mostrarToast)

  async function descargar() {
    try {
      setIsDownloading(true)
      const registros = await listarAsistenciaPorRango(finca.id, construirDesde(), construirHasta())
      descargarBlob(generarPdfAusencias({ registros, fincaNombre: finca.nombre, anio, mes }), crearNombreArchivo())
      mostrarToast({ type: 'success', title: 'PDF descargado', description: `${registros.length} ausencias exportadas.` })
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Intenta de nuevo.'
      mostrarToast({ type: 'error', title: 'No se pudo descargar el PDF', description })
    } finally {
      setIsDownloading(false)
    }
  }

  return { anio, mes, aniosDisponibles: crearAniosDisponibles(hoy.getFullYear()), isDownloading, setAnio, setMes, descargar }

  function construirDesde() {
    return construirFechaIso({ anio, mes, dia: 1 })
  }

  function construirHasta() {
    return construirFechaIso({ anio, mes, dia: obtenerDiasEnMes(anio, mes) })
  }

  function crearNombreArchivo() {
    return `registro-ausentes-${anio}-${String(mes).padStart(2, '0')}.pdf`
  }
}

function crearAniosDisponibles(anioActual: number): number[] {
  return Array.from({ length: 5 }, (_item, index) => anioActual - 2 + index)
}
