import { useState } from 'react'

export function useCalendarioAusentesModal() {
  const [isOpen, setIsOpen] = useState(false)

  return {
    isOpen,
    abrir: () => setIsOpen(true),
    cerrar: () => setIsOpen(false),
  }
}
