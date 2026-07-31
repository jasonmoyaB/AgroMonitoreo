import { describe, expect, it } from 'vitest'

import { rangoIsoDelMes } from '../../../src/shared/utils/fecha-iso'

describe('rangoIsoDelMes', () => {
  it('acota el mes con el dia 1 del mes siguiente, no con el 31', () => {
    expect(rangoIsoDelMes('2026-02')).toEqual({ desde: '2026-02-01', hastaExclusivo: '2026-03-01' })
  })

  it('pasa al anio siguiente en diciembre', () => {
    expect(rangoIsoDelMes('2026-12')).toEqual({ desde: '2026-12-01', hastaExclusivo: '2027-01-01' })
  })

  it('mantiene el cero a la izquierda del mes', () => {
    expect(rangoIsoDelMes('2026-09')).toEqual({ desde: '2026-09-01', hastaExclusivo: '2026-10-01' })
  })
})
