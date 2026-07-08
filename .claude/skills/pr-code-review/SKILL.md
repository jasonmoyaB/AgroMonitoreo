---
name: pr-code-review
description: Use when reviewing code as a senior PR reviewer — finds security vulnerabilities, SOLID violations, and refactoring opportunities. Prioritizes findings by severity. Optimized for React, Python, and Supabase but applies to any language.
---

# PR Code Review

## Overview

Revisá el código como si fuera un Pull Request real. Seguridad primero, diseño segundo, calidad tercero. Cada finding incluye la línea, el problema, y el fix. Cero ruido.

---

## Protocolo de revisión (orden obligatorio)

1. **Seguridad** — cualquier vuln es BLOCKER inmediato. Termina aquí si hay red flags.
2. **Correctitud** — ¿el código hace lo que dice que hace?
3. **Diseño** — SOLID, acoplamiento, cohesión.
4. **Calidad** — duplicación, naming, complejidad.
5. **Rendimiento** — solo si hay evidencia medible de problema.

---

## Niveles de severidad

| Nivel | Cuándo |
|-------|--------|
| 🔴 **BLOCKER** | Seguridad, pérdida de datos, crash en producción. No mergear. |
| 🟡 **WARNING** | SOLID violado, deuda técnica grave, bug potencial. Mergear con cambios. |
| 🔵 **NOTE** | Mejora opcional, estilo, legibilidad. Mergear si el autor acepta. |

**Cap por revisión:** máximo 3 BLOCKERs · 5 WARNINGs · 5 NOTEs. Si hay más, priorizá los más impactantes. Un reviewer que reporta 20 issues es ruido.

---

## Red Flags — BLOCKER inmediato (detectar antes que nada)

Si aparece cualquiera de estos, reportalo primero sin importar el orden:

- Secret / API key hardcodeada en código fuente
- `service_role_key` accesible desde el cliente
- `eval()` con input del usuario
- SQL construido con concatenación de strings o f-string con variables de usuario
- RLS deshabilitado en tabla que almacena datos de usuarios
- Query que no filtra por `organizacion_id` en contexto multi-tenant

---

## Checklist de Seguridad (OWASP-aligned)

- [ ] **A01 Broken Access Control** — authz checks presentes en cada endpoint/acción sensible
- [ ] **A02 Cryptographic Failures** — datos sensibles no expuestos en logs, respuestas, o código
- [ ] **A03 Injection** — ninguna query construida con input de usuario sin parametrizar
- [ ] **A05 Security Misconfiguration** — no secrets en `.env.example`, no CORS `*` en producción
- [ ] **A07 Auth Failures** — tokens validados server-side, sesiones con expiración
- [ ] **A10 SSRF** — URLs externas no construidas desde input de usuario sin allowlist

**Supabase específico:**
- [ ] Tabla nueva tiene RLS habilitado (`ALTER TABLE x ENABLE ROW LEVEL SECURITY`)
- [ ] Política RLS usa `get_organizacion_actual()` (no `auth.uid()` directo para multi-tenant)
- [ ] No hay `service_role_key` en código frontend ni en variables de entorno del cliente
- [ ] Storage buckets: validar si son públicos intencionalmente
- [ ] Migración nueva no expone datos entre organizaciones

---

## Checklist SOLID

**S — Single Responsibility**
- Señales: nombre con "And" / "Manager" / "Handler", función > 30 líneas, archivo > 200 líneas
- Fix: extraer lógica a función/hook/servicio separado con nombre descriptivo

**O — Open/Closed**
- Señales: `switch` o cadena de `if/elif` sobre un tipo para decidir comportamiento
- Fix: polimorfismo, estrategia, o map de handlers

**L — Liskov Substitution**
- Señales: subclase lanza excepción que el padre no declara, override que ignora el contrato
- Fix: revisar jerarquía o usar composición en vez de herencia

**I — Interface Segregation**
- Señales: prop/interfaz con campos que el componente/función no usa, `_` o `pass` en implementación
- Fix: partir la interfaz, usar interfaces específicas por caso de uso

**D — Dependency Inversion**
- Señales: import de clase concreta donde podría ir una abstracción, instanciación directa de dependencias
- Fix: inyectar dependencia como parámetro/prop, usar factory o DI

---

## Checklist Refactoring

- [ ] **DRY** — lógica duplicada ≥ 3 veces → extraer función/constante
- [ ] **Magic values** — números o strings literales sin nombre → constante nombrada
- [ ] **Naming** — nombre que no refleja qué hace → renombrar (el nombre es el comentario)
- [ ] **Complejidad** — función > 30 líneas o > 3 niveles de indentación → extraer
- [ ] **Comentarios** — comentario que explica QUÉ hace el código → eliminar (el código debe ser claro); comentario que explica POR QUÉ → mantener
- [ ] **Early return** — nested ifs que se pueden aplanar con return/throw temprano
- [ ] **Negación doble** — `!isNotValid` → `isValid`

---

## Checks por lenguaje

### React / TypeScript

- `useEffect` con dependencias faltantes o en exceso (revisar exhaustive-deps)
- Estado local que debería vivir en el servidor (TanStack Query) o store global (Zustand)
- Prop drilling > 2 niveles → usar Context, composición, o estado compartido
- `memo` / `useCallback` sin evidencia de re-render problemático → no agregar por defecto
- `any` en TypeScript → tipar correctamente o usar `unknown` con type guard
- Fetch directo dentro de un componente → mover a custom hook o query function
- Componente que hace fetch + transforma datos + renderiza → SRP violado, extraer hook

### Python

- Funciones públicas sin type hints → agregar anotaciones
- `except Exception` sin re-raise ni log específico → capturar excepción concreta
- Argumento mutable como default (`def fn(x=[])`) → usar `None` + inicializar dentro
- Función con > 3 parámetros posicionales → `dataclass` o `TypedDict`
- f-string interpolando variables en SQL → 🔴 SQLi, usar parámetros (`%s` o `?`)
- Lógica de negocio dentro de un endpoint FastAPI/Flask → extraer a servicio

### Supabase / SQL / Migraciones

- Tabla nueva sin `organizacion_id UUID NOT NULL` → multi-tenant incompleto
- `DELETE FROM` físico → usar `UPDATE SET activo = false` (soft delete)
- Migración que modifica datos sin transacción (`BEGIN / COMMIT`)
- Política RLS que no llama a `get_organizacion_actual()` → posible cross-tenant leak
- `SECURITY DEFINER` en función sin justificación explícita → revisar
- Query en frontend que accede a tabla sin usar el cliente con RLS activo

---

## Formato de output

```
## Revisión PR — `NombreArchivo.ext` (o descripción del cambio)

### 🔴 BLOCKERs (N)

**[B1]** `archivo.py:42` — **SQL Injection**
→ f-string interpola `user_id` directamente en la query.
❌  query = f"SELECT * FROM users WHERE id = {user_id}"
✅  query = "SELECT * FROM users WHERE id = %s", (user_id,)

---

### 🟡 WARNINGs (N)

**[W1]** `UserCard.tsx:15-60` — **Viola SRP**
→ El componente hace fetch, transforma datos y renderiza. Extraer a `useUserCardData()`.

---

### 🔵 NOTEs (N)

**[N1]** `utils.py:88` — **Magic string**
→ `"active"` aparece 4 veces. Definir `STATUS_ACTIVE = "active"` en constants.py.

---

**Resumen:** N BLOCKERs · N WARNINGs · N NOTEs
**Veredicto:** BLOQUEADO / MERGEAR CON CAMBIOS / APROBADO
```

---

## Qué NO hacer como reviewer

- No reportar más de 13 findings totales (3+5+5). Priorizá.
- No comentar estilo que el linter ya cubre (indentación, quotes, etc.).
- No optimizar sin evidencia de problema de rendimiento.
- No proponer refactors grandes en el mismo PR (abrí un issue separado).
- No usar "considerar" ni "tal vez" para BLOCKERs — sé directo.
