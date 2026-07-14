import { useEffect, useState } from 'react'
import { readLocalValue, writeLocalValue } from '../../../shared/lib/local-db'

interface RegistroDraft {
  horas: number
  cantidad: number
}

const DRAFT_INICIAL: RegistroDraft = { horas: 0, cantidad: 0 }
const DEMORA_GUARDADO_MS = 300

function construirClaveDraft(trabajadorId: string, tipoLaborId: string, fecha: string): string {
  return `draft_${fecha}_${tipoLaborId}_${trabajadorId}`
}

interface EstadoRegistroDraft {
  draft: RegistroDraft
  cargado: boolean
}

export function useRegistroDraft(trabajadorId: string, tipoLaborId: string, fecha: string) {
  const clave = construirClaveDraft(trabajadorId, tipoLaborId, fecha)
  const [estado, setEstado] = useState<EstadoRegistroDraft>({ draft: DRAFT_INICIAL, cargado: false })
  const { draft, cargado } = estado

  useEffect(() => {
    setEstado((actual) => ({ ...actual, cargado: false }))
    readLocalValue(clave, DRAFT_INICIAL).then((valorGuardado) => {
      setEstado({ draft: valorGuardado, cargado: true })
    })
  }, [clave])

  useEffect(() => {
    if (!cargado) return
    const timeoutId = setTimeout(() => writeLocalValue(clave, draft), DEMORA_GUARDADO_MS)
    return () => clearTimeout(timeoutId)
  }, [clave, draft, cargado])

  function setDraft(nuevoDraft: RegistroDraft) {
    setEstado((actual) => ({ ...actual, draft: nuevoDraft }))
  }

  function limpiarDraft() {
    setDraft(DRAFT_INICIAL)
    writeLocalValue(clave, DRAFT_INICIAL)
  }

  return { draft, setDraft, limpiarDraft, cargado }
}
