import type { Dialect } from 'kysely'
import type { DataSource } from 'typeorm'

export interface KyselyTypeORMDialectConfig {
	kyselySubDialect: KyselySubDialect
	typeORMDataSource: DataSource
}

export type KyselySubDialect = Omit<Dialect, 'createDriver'>
