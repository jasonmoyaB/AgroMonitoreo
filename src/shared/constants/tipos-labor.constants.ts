import type { TipoLabor } from '../types/domain.types'

export const TIPOS_LABOR: readonly TipoLabor[] = [
  { id: 'cosecha', codigo: 'cosecha', nombre: 'Cosecha', icono: 'wheat', color: '#16a34a', tieneCantidad: true, unidadMedida: 'cajas', pasoCantidad: 1, orden: 1 },
  { id: 'amarre_1', codigo: 'amarre_1', nombre: 'Amarre 1', icono: 'link', color: '#2563eb', tieneCantidad: true, unidadMedida: 'tramos', pasoCantidad: 1, orden: 2 },
  { id: 'amarre_2', codigo: 'amarre_2', nombre: 'Amarre 2', icono: 'link', color: '#0891b2', tieneCantidad: true, unidadMedida: 'tramos', pasoCantidad: 1, orden: 3 },
  { id: 'amarre_3', codigo: 'amarre_3', nombre: 'Amarre 3', icono: 'link', color: '#7c3aed', tieneCantidad: true, unidadMedida: 'tramos', pasoCantidad: 1, orden: 4 },
  { id: 'amarre_4', codigo: 'amarre_4', nombre: 'Amarre 4', icono: 'link', color: '#c026d3', tieneCantidad: true, unidadMedida: 'tramos', pasoCantidad: 1, orden: 5 },
  { id: 'deshija', codigo: 'deshija', nombre: 'Deshija', icono: 'scissors', color: '#dc2626', tieneCantidad: true, unidadMedida: 'tramos', pasoCantidad: 1, orden: 6 },
  { id: 'deshoja', codigo: 'deshoja', nombre: 'Deshoja', icono: 'leaf', color: '#65a30d', tieneCantidad: true, unidadMedida: 'tramos', pasoCantidad: 1, orden: 7 },
  { id: 'despunte', codigo: 'despunte', nombre: 'Despunte', icono: 'knife', color: '#ea580c', tieneCantidad: true, unidadMedida: 'tramos', pasoCantidad: 1, orden: 8 },
  { id: 'palea', codigo: 'palea', nombre: 'Palea', icono: 'shovel', color: '#78716c', tieneCantidad: true, unidadMedida: 'tramos', pasoCantidad: 1, orden: 9 },
  { id: 'deshierba', codigo: 'deshierba', nombre: 'Deshierba', icono: 'sprout', color: '#ca8a04', tieneCantidad: true, unidadMedida: 'tramos', pasoCantidad: 1, orden: 10 },
  { id: 'emplasticado', codigo: 'emplasticado', nombre: 'Emplasticado', icono: 'package', color: '#0d9488', tieneCantidad: true, unidadMedida: 'tramos', pasoCantidad: 1, orden: 11 },
]
