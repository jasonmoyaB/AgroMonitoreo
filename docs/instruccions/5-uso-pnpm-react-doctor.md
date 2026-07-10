# 5. Uso de pnpm y React Doctor

En este proyecto se usa `pnpm`. No usar `npm install` para instalar o modificar dependencias.

## Diagnostico React

Para revisar advertencias o problemas relacionados con React, se puede correr:

```bash
pnpm dlx react-doctor --verbose
```

Este comando es solo diagnostico. No reemplaza los checks normales del proyecto.

## Checks oficiales

Antes de entregar cambios, correr:

```bash
pnpm build
pnpm lint
```

## Cache de npm

No correr esto como limpieza general ni como medida de seguridad:

```bash
npm cache clean --force
```

Ese comando solo limpia la cache local de `npm`. No elimina dependencias maliciosas, no audita el proyecto y no reemplaza una revision de seguridad.

Usarlo solo si hay un error concreto relacionado con la cache de `npm`.
