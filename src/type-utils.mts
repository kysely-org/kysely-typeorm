export function isObject(thing: unknown): thing is Record<string, unknown> {
	return typeof thing === 'object' && thing !== null && !Array.isArray(thing)
}
