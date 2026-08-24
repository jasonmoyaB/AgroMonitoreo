import { useState } from 'react'
import { useToastStore } from '../stores/toast-store'
import { descargarBlob } from '../lib/descargar-blob'
import { generarPdfDashboard } from '../utils/pdf/generar-pdf-dashboard'
import { crearSlugArchivo } from '../utils/crear-slug-archivo'
import type { DashboardKpis, DashboardUnidad } from '../types/kpis.types'

interface UseDescargarDashboardPdfInput {
  archivoPrefijo: string
  titulo: string
  subtitulo: string
  kpis: DashboardKpis
  porUnidad: readonly DashboardUnidad[]
}

export function useDescargarDashboardPdf(input: UseDescargarDashboardPdfInput) {
  const [isDownloading, setIsDownloading] = useState(false)
  const mostrarToast = useToastStore((state) => state.mostrarToast)

  function descargar() {
    try {
      setIsDownloading(true)
      const blob = generarPdfDashboard(input)
      descargarBlob(blob, crearNombreArchivo(input.archivoPrefijo))
      mostrarToast({ type: 'success', title: 'PDF descargado', description: 'Resumen del dashboard exportado.' })
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Intenta de nuevo.'
      mostrarToast({ type: 'error', title: 'No se pudo descargar el PDF', description })
    } finally {
      setIsDownloading(false)
    }
  }

  return { isDownloading, descargar }
}

function crearNombreArchivo(prefijo: string): string {
  const hoy = new Date()
  return `${crearSlugArchivo(prefijo)}-${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}.pdf`
}
