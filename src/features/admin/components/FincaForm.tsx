import { useEffect, useRef } from "react";
import { BOTON_PRIMARIO } from "../../../shared/constants/botones.constants";
import type { CrearFincaInput } from "../types/finca-form.types";

interface FincaFormProps {
  values: CrearFincaInput;
  error: string | null;
  isSubmitting: boolean;
  isEditing: boolean;
  onFieldChange: <K extends keyof CrearFincaInput>(
    field: K,
    value: CrearFincaInput[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function FincaForm({
  values,
  error,
  isSubmitting,
  isEditing,
  onFieldChange,
  onSubmit,
}: FincaFormProps) {
  const nombreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nombreInputRef.current?.focus();
  }, [isEditing]);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 font-black text-slate-800">
        Nombre
        <input
          ref={nombreInputRef}
          value={values.nombre}
          onChange={(event) => onFieldChange("nombre", event.target.value)}
          className="neu-pressed min-h-16 rounded-2xl px-4 text-xl font-black text-slate-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
          required
        />
      </label>

      {error && (
        <p className="rounded-2xl bg-red-100 p-4 font-black text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={BOTON_PRIMARIO}
      >
        {isSubmitting ? "Guardando" : "Guardar"}
      </button>
    </form>
  );
}
