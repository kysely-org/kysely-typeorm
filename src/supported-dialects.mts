import type { DataSourceOptions } from 'typeorm'

export const SUPPORTED_DIALECTS = {
	'aurora-mysql': true,
	'aurora-postgres': true,
	'better-sqlite3': true,
	capacitor: true, // sqlite
	cockroachdb: false,
	cordova: true, // sqlite
	expo: true, // sqlite
	mariadb: false,
	mongodb: false,
	mssql: true,
	mysql: true,
	nativescript: true, // sqlite
	oracle: false,
	postgres: true,
	sap: false,
	spanner: false,
	'react-native': true, // sqlite
	sqljs: true, // sqlite
} as const satisfies Record<DataSourceOptions['type'], boolean>

export type SupportedDialect = {
	[K in keyof typeof SUPPORTED_DIALECTS]: (typeof SUPPORTED_DIALECTS)[K] extends true
		? K
		: never
}[keyof typeof SUPPORTED_DIALECTS]

function isDialectSupported(dialect: string): dialect is SupportedDialect {
	return SUPPORTED_DIALECTS[dialect as never] === true
}

export function assertSupportedDialect(dialect: string) {
	if (!isDialectSupported(dialect)) {
		throw new Error(`Unsupported dialect: ${dialect}!`)
	}
}
