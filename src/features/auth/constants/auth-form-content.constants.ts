export const AUTH_FORM_CONTENT = {
  login: {
    title: 'Entrar al campo',
    subtitle: 'Inicia sesión para registrar labores de la finca.',
    button: 'Iniciar sesión',
    footer: '¿Nuevo supervisor?',
    linkText: 'Crear cuenta',
    linkTo: '/registro',
  },
  register: {
    title: 'Crear supervisor',
    subtitle: 'Toda cuenta nueva se registra con el rol supervisor.',
    button: 'Crear cuenta',
    footer: '¿Ya tienes cuenta?',
    linkText: 'Iniciar sesión',
    linkTo: '/login',
  },
} as const
