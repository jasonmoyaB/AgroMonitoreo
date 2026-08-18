import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { HACIENDA_QUERY_KEY } from '../constants/hacienda.constants'
import { consultarContribuyente } from '../services/hacienda-service'
import { esCedulaConsultable, normalizarCedula } from '../utils/normalizar-cedula'

/**
 * Consulta Hacienda a medida que se escribe la cedula y avisa el nombre encontrado.
 *
 * `enabled` recorta el grueso de las requests: mientras la cedula no llega al largo
 * minimo no se pregunta nada, asi que una cedula fisica de 9 digitos dispara una sola.
 * No es una sola siempre: el rango valido va de 9 a 12 (fisica 9, juridica 10, DIMEX
 * 11-12), asi que un DIMEX completo pasa por 9, 10, 11 y 12 y dispara cuatro. Se acepta
 * porque el cache de TanStack las retiene con staleTime Infinity y son GET a una API
 * publica; si algun dia molesta, la salida es un debounce sobre `identificacion`.
 */
export function useContribuyenteHacienda(cedula: string, onNombreEncontrado?: (nombre: string) => void) {
  const identificacion = normalizarCedula(cedula)
  const habilitada = esCedulaConsultable(identificacion)

  const { data, isFetching, isError } = useQuery({
    queryKey: [...HACIENDA_QUERY_KEY, identificacion],
    // el signal es el que corta la consulta al desmontar el campo; sin consumirlo,
    // TanStack marca la query como no cancelable y cerrar el modal no aborta nada
    queryFn: ({ signal }) => consultarContribuyente(identificacion, { signal }),
    enabled: habilitada,
    // el QueryClient de App.tsx tiene throwOnError: true. Sin este override, que
    // Hacienda este caida o que no haya internet tumba la pantalla entera contra el
    // error boundary. Es una API de terceros y opcional: su falla se muestra al lado
    // del campo, no se propaga.
    throwOnError: false,
    // un 404 es "no esta inscrito", no una falla de red: reintentarlo no cambia nada
    retry: false,
    // la cedula no cambia de dueno mientras dura la sesion
    staleTime: Infinity,
  })

  // ref para que el callback no entre en las deps del efecto: los padres lo pasan
  // como arrow inline, y con eso el efecto se redispararia en cada render
  const avisarRef = useRef(onNombreEncontrado)
  useEffect(() => {
    avisarRef.current = onNombreEncontrado
  })

  const nombre = data?.nombre
  useEffect(() => {
    if (nombre) avisarRef.current?.(nombre)
  }, [nombre])

  return {
    contribuyente: data ?? null,
    isFetching: habilitada && isFetching,
    // data === null es "Hacienda contesto 404"; undefined es "todavia no se pregunto"
    noEncontrado: habilitada && !isFetching && data === null,
    isError,
  }
}
