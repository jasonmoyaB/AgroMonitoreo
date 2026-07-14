import type { FormEvent } from 'react'
import type { ActualizarSupervisorInput } from './supervisor.types'

export type SupervisorFormValues = Omit<ActualizarSupervisorInput, 'id'>

export interface SupervisoresCrudState {
  values: SupervisorFormValues
  error: string | null
  isSubmitting: boolean
}

export interface SupervisoresCrudActions {
  onFieldChange: <K extends keyof SupervisorFormValues>(field: K, value: SupervisorFormValues[K]) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}
