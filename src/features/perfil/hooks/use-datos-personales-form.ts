import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useToastStore } from '../../../shared/stores/toast-store'
import { DATOS_PERSONALES_QUERY_KEY, DATOS_PERSONALES_VACIOS } from '../constants/perfil-query.constants'
import { actualizarDatosPersonales, obtenerDatosPersonales } from '../services/perfil-service'
import { validarEmailContacto } from '../utils/validar-email-contacto'
import type { DatosPersonalesUsuario } from '../types/perfil.types'

export function useDatosPersonalesForm(usuarioId: string) {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const queryKey = [...DATOS_PERSONALES_QUERY_KEY, usuarioId]

  const { data, isLoading } = useQuery({ queryKey, queryFn: () => obtenerDatosPersonales(usuarioId) })

  // null = "todavia no toco nada", asi que el form espeja al servidor sin un effect
  // que copie data a estado. Al guardar vuelve a null y el form vuelve a espejar la
  // fila recien invalidada, en vez de quedarse con lo que el usuario tipeo.
  const [editados, setEditados] = useState<DatosPersonalesUsuario | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const values = editados ?? data ?? DATOS_PERSONALES_VACIOS

  function onFieldChange(campo: keyof DatosPersonalesUsuario, valor: string) {
    setEditados({ ...values, [campo]: valor })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errorEmail = validarEmailContacto(values.emailContacto)
    if (errorEmail) {
      mostrarToast({ type: 'error', title: 'Revisá el correo de contacto', description: errorEmail })
      return
    }

    setIsSubmitting(true)

    try {
      await actualizarDatosPersonales(usuarioId, values)
      await queryClient.invalidateQueries({ queryKey })
      setEditados(null)
      mostrarToast({ type: 'success', title: 'Datos actualizados' })
    } catch (unknownError) {
      const description = unknownError instanceof Error ? unknownError.message : 'No se pudieron actualizar los datos.'
      mostrarToast({ type: 'error', title: 'No se pudieron actualizar los datos', description })
    } finally {
      setIsSubmitting(false)
    }
  }

  return { values, isLoading, isSubmitting, onFieldChange, handleSubmit }
}
