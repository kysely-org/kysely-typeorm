import type {
	DatabaseIntrospector,
	DefaultQueryCompiler,
	Dialect,
	DialectAdapter,
	Driver,
	Kysely,
	QueryCompiler,
} from 'kysely'

import type { KyselyTypeORMDialectConfig } from './config.mjs'
import { KyselyTypeORMDriver } from './driver.mjs'
import { assertSupportedDialect } from './supported-dialects.mjs'

export class KyselyTypeORMDialect implements Dialect {
	readonly #config: KyselyTypeORMDialectConfig

	constructor(config: KyselyTypeORMDialectConfig) {
		assertSupportedDialect(config.typeORMDataSource.options.type)
		this.#config = config
	}

	createAdapter(): DialectAdapter {
		return this.#config.kyselySubDialect.createAdapter()
	}

	createDriver(): Driver {
		return new KyselyTypeORMDriver(this.#config)
	}

	// biome-ignore lint/suspicious/noExplicitAny: this is fine.
	createIntrospector(db: Kysely<any>): DatabaseIntrospector {
		return this.#config.kyselySubDialect.createIntrospector(db)
	}

	createQueryCompiler(): QueryCompiler {
		const queryCompiler = this.#config.kyselySubDialect.createQueryCompiler()

		// `typeorm` uses `node-mssql` internally with zero-based variable names.
		if (this.#config.typeORMDataSource.options.type === 'mssql') {
			;(
				queryCompiler as QueryCompiler & {
					getCurrentParameterPlaceholder(this: DefaultQueryCompiler): string
				}
			).getCurrentParameterPlaceholder = function (
				this: DefaultQueryCompiler,
			): string {
				return `@${this.numParameters - 1}`
			}
		}

		return queryCompiler
	}
}
