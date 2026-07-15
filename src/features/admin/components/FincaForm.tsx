import { useEffect, useRef } from "react";
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
  const idInputRef = useRef<HTMLInputElement>(null);
  const nombreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (isEditing ? nombreInputRef : idInputRef).current?.focus();
  }, [isEditing]);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 font-black text-slate-800">
        Identificador (slug)
        <input
          ref={idInputRef}
          value={values.id}
          onChange={(event) => onFieldChange("id", event.target.value)}
          disabled={isEditing}
          className="neu-pressed min-h-16 rounded-2xl px-4 text-xl font-black text-slate-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 disabled:opacity-60"
          placeholder="ej: la-esperanza"
          required
        />
      </label>

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
        className="min-h-16 cursor-pointer rounded-2xl bg-green-700 px-5 text-xl font-black text-white shadow-lg shadow-green-900/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Guardando" : "Guardar"}
      </button>
    </form>
  );
}
