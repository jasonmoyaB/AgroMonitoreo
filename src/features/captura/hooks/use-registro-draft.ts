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

export function useRegistroDraft(trabajadorId: string, tipoLaborId: string, fecha: string) {
  const clave = construirClaveDraft(trabajadorId, tipoLaborId, fecha)
  const [draft, setDraft] = useState<RegistroDraft>(DRAFT_INICIAL)
  const [cargado, setCargado] = useState(false)

  useEffect(() => {
    setCargado(false)
    readLocalValue(clave, DRAFT_INICIAL).then((valorGuardado) => {
      setDraft(valorGuardado)
      setCargado(true)
    })
  }, [clave])

  useEffect(() => {
    if (!cargado) return
    const timeoutId = setTimeout(() => writeLocalValue(clave, draft), DEMORA_GUARDADO_MS)
    return () => clearTimeout(timeoutId)
  }, [clave, draft, cargado])

  function limpiarDraft() {
    setDraft(DRAFT_INICIAL)
    writeLocalValue(clave, DRAFT_INICIAL)
  }

  return { draft, setDraft, limpiarDraft }
}
