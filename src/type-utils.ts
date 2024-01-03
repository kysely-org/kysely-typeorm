export function isObject(thing: unknown): thing is Record<string, any> {
  return typeof thing === 'object' && thing !== null && !Array.isArray(thing)
}
