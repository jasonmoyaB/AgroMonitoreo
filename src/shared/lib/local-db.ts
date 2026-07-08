import { get, set } from 'idb-keyval'

export async function readLocalValue<T>(key: string, fallback: T): Promise<T> {
  const value = await get<T>(key)
  return value ?? fallback
}

export async function writeLocalValue<T>(key: string, value: T): Promise<void> {
  await set(key, value)
}
