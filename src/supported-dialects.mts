import type { DataSourceOptions } from 'typeorm'

export const SUPPORTED_DIALECTS = [
	'better-sqlite3',
	'mssql',
	'mysql',
	'postgres',
	'sqlite',
] as const satisfies DataSourceOptions['type'][]

export type SupportedDialect = (typeof SUPPORTED_DIALECTS)[number]

function isDialectSupported(dialect: string): dialect is SupportedDialect {
	return SUPPORTED_DIALECTS.includes(dialect as never)
}

export function assertSupportedDialect(dialect: string) {
	if (!isDialectSupported(dialect)) {
		throw new Error(`Unsupported dialect: ${dialect}!`)
	}
}
