# Refactor: $ARGUMENTS

## Step 1 — Read before touching

1. Read every file in $ARGUMENTS.
2. Search codebase for existing abstractions that already solve this. Don't recreate.
3. Ask: does this code cause real pain? No violated limit below → no refactor. Say so.

## Step 2 — Delete first

Before adding anything, delete:
- Dead code / unused vars / unused imports
- Comments that describe WHAT (rename instead)
- Abstractions with one caller that add no clarity

Deletion is the best refactor.

## Step 3 — Apply ladder (stop at first rung that holds)

1. **Rename** — unclear name? Rename. Don't extract until names are right.
2. **Early return** — indent > 3 levels? Flatten with guard clauses.
3. **Extract function** — logic block > 10 lines with one job → named fn.
4. **Extract file** — file > 150 lines OR does 2+ things → split by responsibility.
5. **Move to correct layer** — logic in component? data call in UI? move it.

## Step 4 — Hard limits (non-negotiable)

En proyectos grandes y escalables, el foco no está en el mínimo, sino en el máximo. La regla general para mantener la legibilidad es: máximo 100-150 líneas por archivo de componente. Si un archivo supera las 150 líneas, es una señal clara de que debés romperlo en subcomponentes, hooks personalizados o archivos de utilidad independientes.

| What | Limit | Fix |
|------|-------|-----|
| Lines per file | 150 | Split by responsibility |
| Lines per function | 30 | Extract sub-functions |
| Params per function | 3 | Use object param |
| Indent levels | 3 | Early return |
| Props per component | 5 | Group or split component |

## Step 5 — Layer rules

```
components/  → render only. no fetch. no business logic. no direct DB.
hooks/       → state + effects. no JSX.
utils/       → pure fns. no side effects. no framework imports.
types/       → interfaces + types only. no logic.
services/    → data access only. no state. no UI.
```

Dependency direction (never reverse):
```
components → hooks → utils → types
components → services → types
```

## Step 6 — SOLID checklist

- [ ] **S**: each file does one thing. Two things = two files.
- [ ] **O**: new behavior = new file, not modifying existing fn.
- [ ] **L**: no component/fn breaks its caller's expectations.
- [ ] **I**: props/params carry only what that unit needs — no fat objects.
- [ ] **D**: components receive data as props, don't fetch internally.

## NEVER do

- Add abstraction for hypothetical future use (YAGNI — if no second caller exists, don't abstract)
- Add error handling for impossible states
- Create interface with one implementation
- Add comments explaining WHAT code does (rename instead)
- Refactor code that violates no limit above

## Output format (exact, no deviation)

**Problems found:** numbered list — file, line range, rule violated.

**Changes made:** numbered list — what moved, where, why (one line each).

**File tree after refactor:** names + line counts.

Then: complete content of every modified or created file.
