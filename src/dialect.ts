import type {DatabaseIntrospector, Dialect, DialectAdapter, Driver, Kysely, QueryCompiler} from 'kysely'
import type {KyselyTypeORMDialectConfig} from './config.js'
import {KyselyTypeORMDriver} from './driver.js'
import {assertSupportedDialect} from './supported-dialects.js'

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

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return this.#config.kyselySubDialect.createIntrospector(db)
  }

  createQueryCompiler(): QueryCompiler {
    return this.#config.kyselySubDialect.createQueryCompiler()
  }
}
