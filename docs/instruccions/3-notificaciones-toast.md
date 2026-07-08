# 3. Notificaciones (toast)

No usar librerias externas de toast/notificaciones (ver commit que elimino `sileo`). El sistema es propio, chico, y vive en `shared/`:

- `shared/types/toast.types.ts` — tipo `Toast` (`id`, `type: 'success' | 'error'`, `title`, `description?`).
- `shared/constants/toast.constants.ts` — `TOAST_DURATION_MS`.
- `shared/stores/toast-store.ts` — Zustand store: `toasts`, `mostrarToast(toast)`, `descartarToast(id)`.
- `shared/components/Toast.tsx` / `ToastViewport.tsx` — render + auto-dismiss. `ToastViewport` esta montado una sola vez en `App.tsx`.

## Uso

Cualquier hook `-crud.ts` que crea/edita/elimina llama al store directo:

```ts
import { useToastStore } from '../../../shared/stores/toast-store'

const mostrarToast = useToastStore((state) => state.mostrarToast)

mostrarToast({ type: 'success', title: 'Trabajador agregado', description: `${nombre} ya forma parte de ${finca.nombre}.` })
```

Ejemplo real: `src/features/trabajadores/hooks/use-trabajadores-crud.ts` -> `guardarTrabajador`.

## Regla para forms nuevos (labores, fincas, admin, etc.)

Cada `crear*` / `actualizar*` en un hook `-crud.ts` dispara un toast al terminar, con mensaje corto y en pasado:

- Crear -> `"<Entidad> agregado"` (+ descripcion opcional).
- Editar -> `"<Entidad> editado correctamente"`.
- Eliminar / cambiar estado -> `"<Entidad> <activado|inactivado|eliminado>"`.
- Error (catch) -> `mostrarToast({ type: 'error', title: '...' })` en vez de (o ademas de) `setError` inline, si el error necesita ser visible aunque el modal ya se haya cerrado.

No dejar el resultado de un guardado solo en un `setSuccess` inline si el componente que lo muestra puede desmontarse/cerrarse antes de que el usuario lo vea (ej: modal que se cierra al guardar). El toast vive en `App.tsx`, sobrevive al cierre de cualquier modal.
