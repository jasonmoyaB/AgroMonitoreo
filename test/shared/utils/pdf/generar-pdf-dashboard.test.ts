import { describe, expect, it } from 'vitest'
import { generarPdfDashboard } from '../../../../src/shared/utils/pdf/generar-pdf-dashboard'
import type { DashboardKpis } from '../../../../src/shared/types/kpis.types'

const KPIS: DashboardKpis = {
  totalHoras: 120,
  trabajadoresActivos: 8,
  cantidadesPorUnidad: [
    { unidad: 'tramos', totalCantidad: 300, productividadPromedio: 2.5 },
    { unidad: 'cajas', totalCantidad: 50, productividadPromedio: 0.4 },
  ],
}

async function generarTextoPdf(): Promise<string> {
  const blob = generarPdfDashboard({
    titulo: 'Dashboard',
    subtitulo: 'Resumen del mes',
    kpis: KPIS,
    rankingLabores: [],
    rankingTrabajadores: [],
    tendenciaDiaria: [],
  })
  return blob.text()
}

describe('generarPdfDashboard', () => {
  it('incluye una tarjeta por cada unidad de cantidad producida', async () => {
    const texto = await generarTextoPdf()
    expect(texto).toContain('Tramos producidos')
    expect(texto).toContain('Cajas producidos')
  })

  it('incluye la productividad de cada unidad, no solo la primera', async () => {
    const texto = await generarTextoPdf()
    expect(texto).toContain('Productividad \\(tramos/hora\\)')
    expect(texto).toContain('Productividad \\(cajas/hora\\)')
  })

  it('incluye horas del mes y trabajadores activos', async () => {
    const texto = await generarTextoPdf()
    expect(texto).toContain('Horas del mes')
    expect(texto).toContain('Trabajadores activos')
  })
})
