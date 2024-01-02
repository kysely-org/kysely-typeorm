import type {DatabaseConnection, Driver, TransactionSettings} from 'kysely'
import type {KyselyTypeORMDialectConfig} from './config.js'
import {KyselyTypeORMConnection} from './connection.js'

export class KyselyTypeORMDriver implements Driver {
  readonly #config: KyselyTypeORMDialectConfig

  constructor(config: KyselyTypeORMDialectConfig) {
    this.#config = config
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    return new KyselyTypeORMConnection(this.#config.typeORMDataSource.createQueryRunner())
  }

  async beginTransaction(connection: KyselyTypeORMConnection, settings: TransactionSettings): Promise<void> {
    await connection.beginTransaction(settings)
  }

  async commitTransaction(connection: KyselyTypeORMConnection): Promise<void> {
    await connection.commitTransaction()
  }

  async destroy(): Promise<void> {
    if (this.#config.typeORMDataSource.isInitialized && this.#config.shouldDestroyDataSource) {
      await this.#config.typeORMDataSource.destroy()
    }
  }

  async init(): Promise<void> {
    if (!this.#config.typeORMDataSource.isInitialized && this.#config.shouldInitializeDataSource) {
      await this.#config.typeORMDataSource.initialize()
    }
  }

  async releaseConnection(connection: KyselyTypeORMConnection): Promise<void> {
    await connection.release()
  }

  async rollbackTransaction(connection: KyselyTypeORMConnection): Promise<void> {
    await connection.rollbackTransaction()
  }
}
