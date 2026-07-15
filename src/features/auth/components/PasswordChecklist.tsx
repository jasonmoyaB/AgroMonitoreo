import { Check, X } from 'lucide-react'
import { evaluarRequisitosPassword } from '../utils/evaluar-requisitos-password'

interface PasswordChecklistProps {
  password: string
}

export function PasswordChecklist({ password }: PasswordChecklistProps) {
  return (
    <ul className="mt-2 space-y-1">
      {evaluarRequisitosPassword(password).map((requisito) => (
        <li
          key={requisito.texto}
          className={`flex items-center gap-1.5 text-xs font-bold ${requisito.cumplido ? 'text-green-700' : 'text-slate-500'}`}
        >
          {requisito.cumplido ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <X className="h-3.5 w-3.5" aria-hidden="true" />}
          {requisito.texto}
        </li>
      ))}
    </ul>
  )
}
