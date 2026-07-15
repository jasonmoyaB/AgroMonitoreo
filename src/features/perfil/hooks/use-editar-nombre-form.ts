import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useToastStore } from '../../../shared/stores/toast-store'
import { USUARIO_ACTUAL_QUERY_KEY } from '../../auth/hooks/use-usuario-actual'
import { actualizarNombreUsuario } from '../../auth/services/usuario-service'
import type { Usuario } from '../../../shared/types/domain.types'

export function useEditarNombreForm(usuario: Usuario) {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const [nombre, setNombre] = useState(usuario.nombre ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await actualizarNombreUsuario(nombre)
      await queryClient.invalidateQueries({ queryKey: USUARIO_ACTUAL_QUERY_KEY })
      mostrarToast({ type: 'success', title: 'Nombre actualizado' })
    } catch (unknownError) {
      const description = unknownError instanceof Error ? unknownError.message : 'No se pudo actualizar el nombre.'
      mostrarToast({ type: 'error', title: 'No se pudo actualizar el nombre', description })
    } finally {
      setIsSubmitting(false)
    }
  }

  return { nombre, setNombre, isSubmitting, handleSubmit }
}
