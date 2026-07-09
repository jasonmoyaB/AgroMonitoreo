import type { Finca, Trabajador } from '../../../shared/types/domain.types'
import type { FormEvent } from 'react'
import type { TrabajadorFormValues } from './trabajador-form.types'

export interface TrabajadoresCrudState {
  trabajadores: readonly Trabajador[]
  values: TrabajadorFormValues
  finca: Finca
  trabajadorEditando: Trabajador | null
  error: string | null
  isLoading: boolean
  isSubmitting: boolean
  isFormOpen: boolean
  fotoPreviewUrl: string | null
}

export interface TrabajadoresCrudActions {
  onFieldChange: <K extends keyof TrabajadorFormValues>(field: K, value: TrabajadorFormValues[K]) => void
  onFotoChange: (archivo: File | null) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onOpenCreate: () => void
  onCloseForm: () => void
  onEdit: (trabajador: Trabajador) => void
  onToggleActive: (trabajador: Trabajador) => void
}
