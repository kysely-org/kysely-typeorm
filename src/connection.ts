import type {CompiledQuery, DatabaseConnection, QueryResult, TransactionSettings} from 'kysely'
import type {QueryRunner} from 'typeorm'
import {ISOLATION_LEVELS} from './isolation-levels'

export class KyselyTypeORMConnection implements DatabaseConnection {
  readonly #queryRunner: QueryRunner

  constructor(queryRunner: QueryRunner) {
    this.#queryRunner = queryRunner
  }

  async beginTransaction(settings: TransactionSettings): Promise<void> {
    const {isolationLevel: kyselyIsolationLevel} = settings

    const isolationLevel = kyselyIsolationLevel && ISOLATION_LEVELS[kyselyIsolationLevel]

    if (isolationLevel === null) {
      throw new Error(`Isolation level '${kyselyIsolationLevel}' is not supported!`)
    }

    await this.#queryRunner.startTransaction(isolationLevel)
  }

  async commitTransaction(): Promise<void> {
    await this.#queryRunner.commitTransaction()
  }

  async release(): Promise<void> {
    await this.#queryRunner.release()
  }

  async rollbackTransaction(): Promise<void> {
    await this.#queryRunner.rollbackTransaction()
  }

  async executeQuery<R>(compiledQuery: CompiledQuery<unknown>): Promise<QueryResult<R>> {
    const results = await this.#queryRunner.query(compiledQuery.sql, [...compiledQuery.parameters])

    console.log('results', results)

    return {rows: []}
  }

  async *streamQuery<R>(compiledQuery: CompiledQuery<unknown>): AsyncIterableIterator<QueryResult<R>> {
    const readStream = await this.#queryRunner.stream(compiledQuery.sql, [...compiledQuery.parameters])

    const dataYielder = (chunk: any[]) => yield chunk

    await new Promise((resolve, reject) => {
      readStream.on('data', dataYielder).once('error', reject).once('end', resolve)
    })
  }
}
