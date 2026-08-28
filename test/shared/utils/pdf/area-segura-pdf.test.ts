import { describe, expect, it } from 'vitest'
import { generarPdfDashboard } from '../../../../src/shared/utils/pdf/generar-pdf-dashboard'
import { generarPdfAusencias } from '../../../../src/features/asistencia/utils/generar-pdf-ausencias'
import { generarPdfLiquidacion } from '../../../../src/features/planilla/utils/generar-pdf-liquidacion'
import { generarPdfMetricasTrabajador } from '../../../../src/features/trabajadores/utils/generar-pdf-metricas-trabajador'
import { PDF_LAYOUT, PDF_PAGINA } from '../../../../src/shared/utils/pdf/tokens-pdf'
import type { AsistenciaConTrabajador } from '../../../../src/features/asistencia/types/asistencia.types'
import type { MetricaPorLabor } from '../../../../src/features/trabajadores/types/trabajador-metricas.types'

// Nadie debe escribir fuera del area util: ni bajo el pie, ni sobre la banda de marca,
// ni fuera de los margenes. Se valida sobre el stream real, con datos largos a proposito.
const NOMBRES = ['Wilberth Alberto Mora Rodriguez', 'Ana Lucia Vega', 'Jose Chinchilla', 'Marta Nunez', 'Kendall Solis']
const DIAS_CON_AUSENCIA = [3, 4, 4, 11, 18, 18, 18, 18, 25]

const REGISTROS = DIAS_CON_AUSENCIA.map((dia, index) => ({
  id: String(index),
  trabajadorId: `t${index % NOMBRES.length}`,
  trabajadorNombre: NOMBRES[index % NOMBRES.length],
  fecha: `2026-08-${String(dia).padStart(2, '0')}`,
  tipo: 'vacaciones',
  fincaId: 'birrisito',
})) as unknown as readonly AsistenciaConTrabajador[]

const METRICAS = [
  { nombre: 'Cosecha', horas: 80, horasExtra: 6, cantidad: 1200, cantidadExtra: 90, productividad: 15, unidadMedida: 'cajas' },
  { nombre: 'Deshija de matas muy grandes', horas: 66, horasExtra: 8, cantidad: 210, cantidadExtra: 12, productividad: 3.2, unidadMedida: 'tramos' },
] as unknown as readonly MetricaPorLabor[]

const DOCUMENTOS: Record<string, Blob> = {
  dashboard: generarPdfDashboard({
    titulo: 'Dashboard de Birrisito',
    subtitulo: 'Agosto 2026',
    kpis: {
      totalHoras: 1240.5,
      trabajadoresActivos: 18,
      cantidadesPorUnidad: [
        { unidad: 'cajas', totalCantidad: 3120, productividadPromedio: 2.51 },
        { unidad: 'tramos', totalCantidad: 890, productividadPromedio: 0.72 },
      ],
    },
    porUnidad: ['cajas', 'tramos'].map((unidad) => ({
      unidad,
      produccionDiaria: { dias: [], total: 0, maximo: 0, promedio: 0, diasConRegistro: 0, mejorDia: null },
      rankingLabores: ['Cosecha', 'Amarre 1', 'Deshija de matas grandes', 'Emplasticado', 'Deshierba'].map((etiqueta, index) => ({ id: String(index), etiqueta, valor: 900 - index * 120 })),
      rankingTrabajadores: NOMBRES.map((etiqueta, index) => ({ id: String(index), etiqueta, valor: 450 - index * 47 })),
      tendenciaDiaria: Array.from({ length: 12 }, (_item, index) => ({ fecha: `${String(index + 1).padStart(2, '0')}/08`, valor: 120 + index * 33 })),
    })),
  }),
  ausencias: generarPdfAusencias({ registros: REGISTROS, fincaNombre: 'Finca Birrisito', anio: 2026, mes: 8 }),
  liquidacion: generarPdfLiquidacion({
    nombreCompleto: NOMBRES[0],
    fincaNombre: 'Finca Birrisito',
    inicio: '2026-08-01',
    fin: '2026-08-15',
    monto: 151150,
    montoBruto: 179150,
    diasAusentes: 2,
    moneda: 'colones',
  }),
  metricas: generarPdfMetricasTrabajador({
    trabajadorNombre: NOMBRES[0],
    fincaNombre: 'Finca Birrisito',
    periodo: 'Agosto 2026',
    metricasPorLabor: METRICAS,
    totales: { horas: 186, horasExtra: 14, productividad: 2.4, cantidad: 1410 },
  }),
}

async function posicionesDeTexto(blob: Blob): Promise<readonly { x: number; y: number }[]> {
  const contenido = await blob.text()
  return [...contenido.matchAll(/([-\d.]+) ([-\d.]+) Td/g)].map((coincidencia) => ({ x: Number(coincidencia[1]), y: Number(coincidencia[2]) }))
}

describe('area segura de los PDF', () => {
  it.each(Object.keys(DOCUMENTOS))('%s escribe todo dentro de los margenes y sobre el pie', async (nombre) => {
    const posiciones = await posicionesDeTexto(DOCUMENTOS[nombre])

    expect(posiciones.length).toBeGreaterThan(0)
    for (const { x, y } of posiciones) {
      expect(x).toBeGreaterThanOrEqual(PDF_PAGINA.margen - 1)
      expect(x).toBeLessThanOrEqual(PDF_PAGINA.derecha)
      expect(y).toBeGreaterThanOrEqual(PDF_LAYOUT.pieY)
      expect(y).toBeLessThanOrEqual(PDF_LAYOUT.marcaY)
    }
  })

  it.each(Object.keys(DOCUMENTOS))('%s declara la longitud real de cada stream', async (nombre) => {
    const contenido = await DOCUMENTOS[nombre].text()
    const streams = [...contenido.matchAll(/\/Length (\d+) >>\nstream\n([\s\S]*?)\nendstream/g)]

    expect(streams.length).toBeGreaterThan(0)
    for (const [, declarada, real] of streams) expect(Number(declarada)).toBe(real.length)
  })
})
