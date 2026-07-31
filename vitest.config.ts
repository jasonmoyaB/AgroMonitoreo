import { configDefaults, defineConfig } from 'vitest/config'

// separado de vite.config.ts a proposito: el proyecto compila con vite 8, pero vitest
// 3.2 declara vite ^5||^6||^7 y pnpm le resuelve vite 7, asi que importar
// 'vitest/config' dentro de vite.config.ts mezcla ambos juegos de tipos y rompe tsc -b.
// este archivo no esta en el include de ningun tsconfig, por lo que tsc nunca lo mira.
//
// los tests son TS puro (sin JSX), asi que no necesitan los plugins de vite.config.ts.
export default defineConfig({
  test: {
    // worktrees de agentes guardan copias viejas de test/: sin excluirlas vitest corre
    // dos veces cada test, la mitad contra codigo que ya no existe
    exclude: [...configDefaults.exclude, '.claude/**', '.agents/**', '.amazonq/**'],
    // las fincas son de Costa Rica y varios bugs de fecha son justamente el desfase
    // UTC-6. sin fijar la TZ, un runner en UTC deja pasar en verde todo test de
    // "el dia local no es el dia UTC", que es la clase de bug que mas duele aca.
    env: { TZ: 'America/Costa_Rica' },
  },
})
