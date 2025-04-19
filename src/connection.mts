import type {
	CompiledQuery,
	DatabaseConnection,
	QueryResult,
	TransactionSettings,
} from 'kysely'
import type { QueryRunner } from 'typeorm'

import { ISOLATION_LEVELS } from './isolation-levels.mjs'
import { isObject } from './type-utils.mjs'

export class KyselyTypeORMConnection implements DatabaseConnection {
	readonly #queryRunner: QueryRunner

	constructor(queryRunner: QueryRunner) {
		this.#queryRunner = queryRunner
	}

	async beginTransaction(settings: TransactionSettings): Promise<void> {
		const { isolationLevel: kyselyIsolationLevel } = settings

		const isolationLevel =
			kyselyIsolationLevel && ISOLATION_LEVELS[kyselyIsolationLevel]

		if (isolationLevel === null) {
			throw new Error(
				`Isolation level '${kyselyIsolationLevel}' is not supported!`,
			)
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

	async executeQuery<R>(
		compiledQuery: CompiledQuery<unknown>,
	): Promise<QueryResult<R>> {
		const result = await this.#queryRunner.query(
			compiledQuery.sql,
			[...compiledQuery.parameters],
			true,
		)

		const { affected, raw, records } = result

		return {
			insertId: Number.isInteger(raw)
				? BigInt(raw)
				: isObject(raw) && 'insertId' in raw && Number.isInteger(raw.insertId)
					? BigInt(raw.insertId as number)
					: undefined,
			numAffectedRows: Number.isInteger(affected)
				? // biome-ignore lint/style/noNonNullAssertion: it's alright.
					BigInt(affected!)
				: undefined,
			numChangedRows:
				isObject(raw) &&
				'changedRows' in raw &&
				Number.isInteger(raw.changedRows)
					? BigInt(raw.changedRows as number)
					: undefined,
			rows: records || [],
		}
	}

	async *streamQuery<R>(
		compiledQuery: CompiledQuery<unknown>,
	): AsyncIterableIterator<QueryResult<R>> {
		for await (const row of await this.#queryRunner.stream(compiledQuery.sql, [
			...compiledQuery.parameters,
		])) {
			yield { rows: [row] }
		}
	}
}
