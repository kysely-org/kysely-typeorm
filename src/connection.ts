import type {CompiledQuery, DatabaseConnection, QueryResult, TransactionSettings} from 'kysely'
import type {QueryRunner} from 'typeorm'
import {ISOLATION_LEVELS} from './isolation-levels.js'
import {isObject} from './type-utils.js'

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
    const result = await this.#queryRunner.query(compiledQuery.sql, [...compiledQuery.parameters], true)

    return {
      rows: result.records || [],
      numAffectedRows: result.affected ? BigInt(result.affected) : undefined,
      insertId: Number.isInteger(result.raw)
        ? BigInt(result.raw)
        : isObject(result.raw) && 'insertId' in result.raw && Number.isInteger(result.raw.insertId)
          ? BigInt(result.raw.insertId)
          : undefined,
      numChangedRows:
        isObject(result.raw) && 'changedRows' in result.raw && Number.isInteger(result.raw.changedRows)
          ? BigInt(result.raw.changedRows)
          : undefined,
    }
  }

  // TODO: implement!
  async *streamQuery<R>(compiledQuery: CompiledQuery<unknown>): AsyncIterableIterator<QueryResult<R>> {
    // const readStream = await this.#queryRunner.stream(compiledQuery.sql, [...compiledQuery.parameters])

    // const rows: R[] = []
    // let done = false

    // readStream.on('data', console.log).once('end', () => (done = true))

    throw new Error('Unimplemented!')
  }
}
