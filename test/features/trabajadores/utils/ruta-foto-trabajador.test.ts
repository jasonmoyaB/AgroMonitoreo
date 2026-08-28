import { describe, expect, it } from 'vitest'
import { rutaDesdeFotoUrl } from '../../../../src/features/trabajadores/utils/ruta-foto-trabajador'

describe('rutaDesdeFotoUrl', () => {
  it('sin foto devuelve null', () => {
    expect(rutaDesdeFotoUrl(null)).toBeNull()
  })

  it('cadena vacia o con solo espacios devuelve null', () => {
    expect(rutaDesdeFotoUrl('')).toBeNull()
    expect(rutaDesdeFotoUrl('   ')).toBeNull()
  })

  it('una ruta pelada se devuelve tal cual', () => {
    expect(rutaDesdeFotoUrl('birrisito/abc-123.jpg')).toBe('birrisito/abc-123.jpg')
  })

  it('extrae la ruta de una URL publica de las filas viejas', () => {
    const url = 'https://xyz.supabase.co/storage/v1/object/public/trabajador-fotos/birrisito/abc-123.jpg'
    expect(rutaDesdeFotoUrl(url)).toBe('birrisito/abc-123.jpg')
  })

  it('descarta el querystring de una URL ya firmada', () => {
    const url = 'https://xyz.supabase.co/storage/v1/object/sign/trabajador-fotos/birrisito/abc.jpg?token=eyJhbGciOi'
    expect(rutaDesdeFotoUrl(url)).toBe('birrisito/abc.jpg')
  })

  // El id de finca lleva prefijo de organizacion desde que la app es multi-empresa, y el
  // primer segmento de la ruta es lo que scopea la policy del bucket.
  it('conserva el prefijo de organizacion del id de finca', () => {
    expect(rutaDesdeFotoUrl('chayotes-la-esperanza/abc.jpg')).toBe('chayotes-la-esperanza/abc.jpg')
  })

  it('una URL cortada justo despues del bucket no devuelve ruta vacia', () => {
    const url = 'https://xyz.supabase.co/storage/v1/object/public/trabajador-fotos/'
    expect(rutaDesdeFotoUrl(url)).toBeNull()
  })
})
