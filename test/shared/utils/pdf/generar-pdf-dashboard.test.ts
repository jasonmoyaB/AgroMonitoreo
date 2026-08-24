import { describe, expect, it } from 'vitest'
import { generarPdfDashboard } from '../../../../src/shared/utils/pdf/generar-pdf-dashboard'
import type { DashboardKpis, DashboardUnidad } from '../../../../src/shared/types/kpis.types'

const KPIS: DashboardKpis = {
  totalHoras: 120,
  trabajadoresActivos: 8,
  cantidadesPorUnidad: [
    { unidad: 'tramos', totalCantidad: 300, productividadPromedio: 2.5 },
    { unidad: 'cajas', totalCantidad: 50, productividadPromedio: 0.4 },
  ],
}

const POR_UNIDAD: DashboardUnidad[] = ['tramos', 'cajas'].map((unidad) => ({
  unidad,
  produccionDiaria: { dias: [], total: 0, maximo: 0, promedio: 0, diasConRegistro: 0, mejorDia: null },
  rankingLabores: [{ id: 'cosecha', etiqueta: 'Cosecha', valor: 900 }],
  rankingTrabajadores: [{ id: 't1', etiqueta: 'Ana Vega', valor: 450 }],
  tendenciaDiaria: [{ fecha: '01/08', valor: 120 }],
}))

async function generarTextoPdf(porUnidad: readonly DashboardUnidad[] = POR_UNIDAD): Promise<string> {
  const blob = generarPdfDashboard({ titulo: 'Dashboard', subtitulo: 'Resumen del mes', kpis: KPIS, porUnidad })
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
    expect(texto).toContain('Prod. \\(tramos/hora\\)')
    expect(texto).toContain('Prod. \\(cajas/hora\\)')
  })

  it('incluye horas del mes y trabajadores activos', async () => {
    const texto = await generarTextoPdf()
    expect(texto).toContain('Horas del mes')
    expect(texto).toContain('Trabajadores activos')
  })

  it('rotula cada total con su unidad en vez de dejarlo en "unidades"', async () => {
    const texto = await generarTextoPdf()
    expect(texto).toContain('Total \\(cajas\\)')
    expect(texto).toContain('Total \\(tramos\\)')
    expect(texto).not.toContain('unidades')
  })

  it('abre una pagina por unidad para no mezclar cajas con tramos', async () => {
    const texto = await generarTextoPdf()
    expect(texto).toContain('/Count 2')
  })

  // Un mes sin registros imprimia encabezado, tarjetas en cero y media pagina en blanco.
  it('un mes sin produccion imprime los estados vacios y no una pagina hueca', async () => {
    const texto = await generarTextoPdf([])

    expect(texto).toContain('Sin datos del mes.')
    expect(texto).toContain('Sin produccion registrada este mes.')
    expect(texto).toContain('/Count 1')
  })

  it('sin unidad de la que hablar, los titulos no arrastran un sufijo vacio', async () => {
    const texto = await generarTextoPdf([])

    expect(texto).toContain('(Mejor labor)')
    expect(texto).toContain('(Produccion diaria del mes)')
  })
})
