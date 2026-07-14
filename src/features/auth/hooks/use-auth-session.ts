import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'

interface EstadoAuthSession {
  session: Session | null
  isLoading: boolean
}

export function useAuthSession() {
  const [estado, setEstado] = useState<EstadoAuthSession>({ session: null, isLoading: true })

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setEstado({ session: data.session, isLoading: false })
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setEstado({ session: nextSession, isLoading: false })
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  return estado
}
