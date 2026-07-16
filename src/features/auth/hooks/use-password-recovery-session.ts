import { useEffect, useState } from 'react'
import { supabase } from '../../../shared/lib/supabase-client'

type EstadoRecuperacion = 'cargando' | 'valida' | 'invalida'

export function usePasswordRecoverySession() {
  const [estado, setEstado] = useState<EstadoRecuperacion>('cargando')

  useEffect(() => {
    let isMounted = true

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && isMounted) setEstado('valida')
    })

    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!isMounted) return
      setEstado((current) => (current === 'valida' ? current : sessionData.session ? 'valida' : 'invalida'))
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  return estado
}
