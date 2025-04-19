import { type DeleteResult, type InsertResult, UpdateResult, sql } from 'kysely'
import { jsonArrayFrom as jsonArrayFromMssql } from 'kysely/helpers/mssql'
import { jsonArrayFrom as jsonArrayFromMySQL } from 'kysely/helpers/mysql'
import { jsonArrayFrom as jsonArrayFromPostgres } from 'kysely/helpers/postgres'
import { jsonArrayFrom as jsonArrayFromSQLite } from 'kysely/helpers/sqlite'
import omit from 'lodash/omit'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'

import { SUPPORTED_DIALECTS } from '../../src/supported-dialects'
import { PersonEntity } from './entity/Person'
import {
	DEFAULT_DATA_SET,
	type PerDialect,
	type TestContext,
	initTest,
	seedDatabase,
} from './test-setup'

for (const dialect of SUPPORTED_DIALECTS) {
	describe(`KyselyTypeORMDialect: ${dialect}`, () => {
		let ctx: TestContext

		const jsonArrayFrom = {
			'better-sqlite3': jsonArrayFromSQLite,
			mssql: jsonArrayFromMssql,
			mysql: jsonArrayFromMySQL,
			postgres: jsonArrayFromPostgres,
			sqlite: jsonArrayFromSQLite,
		}[dialect] as typeof jsonArrayFromMySQL

		beforeEach(async () => {
			ctx = await initTest(dialect)
			await seedDatabase(ctx)
		})

		afterEach(async () => {
			await ctx.typeORMDataSource.dropDatabase()
		})

		afterAll(async () => {
			if (dialect === 'mysql') {
				setTimeout(() => process.exit(0), 1_000)
			}

			await ctx.kysely.destroy()
		})

		it('should be able to perform select queries', async () => {
			const ormPeople = await PersonEntity.find({
				select: {
					firstName: true,
					gender: true,
					lastName: true,
					maritalStatus: true,
					middleName: true,
					pets: {
						name: true,
						species: true,
						toys: true,
					},
				},
				relations: ['pets', 'pets.toys'],
				order: { id: 1 },
			})

			expect(ormPeople).to.have.lengthOf(DEFAULT_DATA_SET.length)

			const normalizedOrmPeople = ormPeople.map((ormPerson) =>
				omit(
					{
						...ormPerson,
						pets: ormPerson.pets.map((pet) =>
							omit(pet, ['id', 'owner', 'ownerId']),
						),
					},
					['id'],
				),
			)

			expect(normalizedOrmPeople).to.deep.equal(DEFAULT_DATA_SET)

			const queryBuilderPeople = await ctx.kysely
				.selectFrom('person')
				.select((eb) => [
					'firstName',
					'gender',
					'lastName',
					'maritalStatus',
					'middleName',
					jsonArrayFrom(
						eb
							.selectFrom('pet')
							.whereRef('pet.ownerId', '=', 'person.id')
							.select(['pet.name', 'pet.species', sql`'[]'`.as('toys')]),
					).as('pets'),
				])
				.execute()

			expect(queryBuilderPeople).to.deep.equal(normalizedOrmPeople)
		})

		it('should be able to perform insert queries', async () => {
			const result = await ctx.kysely
				.insertInto('person')
				.values({ gender: 'female' })
				.executeTakeFirstOrThrow()

			expect(result).to.deep.equal(
				(
					{
						'better-sqlite3': {
							insertId: BigInt(DEFAULT_DATA_SET.length + 1),
							numInsertedOrUpdatedRows: BigInt(1),
						},
						mssql: { insertId: undefined, numInsertedOrUpdatedRows: BigInt(1) },
						mysql: {
							insertId: BigInt(DEFAULT_DATA_SET.length + 1),
							numInsertedOrUpdatedRows: BigInt(1),
						},
						postgres: {
							insertId: undefined,
							numInsertedOrUpdatedRows: BigInt(1),
						},
						sqlite: {
							insertId: undefined,
							numInsertedOrUpdatedRows: undefined,
						},
					} satisfies PerDialect<{ [K in keyof InsertResult]: InsertResult[K] }>
				)[dialect],
			)
		})

		if (dialect === 'postgres' || dialect === 'sqlite') {
			it('should be able to perform insert queries with returning', async () => {
				const result = await ctx.kysely
					.insertInto('person')
					.values({ gender: 'female' })
					.returning('id')
					.executeTakeFirst()

				expect(result).to.deep.equal({ id: DEFAULT_DATA_SET.length + 1 })
			})
		}

		it('should be able to perform update queries', async () => {
			const result = await ctx.kysely
				.updateTable('person')
				.set({ maritalStatus: 'widowed' })
				.where('id', '=', 1)
				.executeTakeFirstOrThrow()

			expect(result).to.deep.equal(
				(
					{
						'better-sqlite3': new UpdateResult(BigInt(1), undefined),
						mssql: new UpdateResult(BigInt(1), undefined),
						mysql: new UpdateResult(BigInt(1), BigInt(1)),
						postgres: new UpdateResult(BigInt(1), undefined),
						sqlite: new UpdateResult(BigInt(0), undefined),
					} satisfies PerDialect<{ [K in keyof UpdateResult]: UpdateResult[K] }>
				)[dialect],
			)
		})

		if (dialect === 'postgres' || dialect === 'sqlite') {
			it('should be able to perform update queries with returning', async () => {
				const result = await ctx.kysely
					.updateTable('person')
					.set({ maritalStatus: 'widowed' })
					.where('id', '=', 1)
					.returning(['gender'])
					.executeTakeFirstOrThrow()

				expect(result).to.deep.equal({ gender: DEFAULT_DATA_SET[0].gender })
			})
		}

		it('should be able to perform delete queries', async () => {
			const result = await ctx.kysely
				.deleteFrom('person')
				.where('id', '=', 1)
				.executeTakeFirstOrThrow()

			expect(result).to.deep.equal(
				(
					{
						'better-sqlite3': { numDeletedRows: BigInt(1) },
						mssql: { numDeletedRows: BigInt(1) },
						mysql: { numDeletedRows: BigInt(1) },
						postgres: { numDeletedRows: BigInt(1) },
						sqlite: { numDeletedRows: BigInt(0) },
					} satisfies PerDialect<{ [K in keyof DeleteResult]: DeleteResult[K] }>
				)[dialect],
			)
		})

		if (dialect === 'postgres' || dialect === 'sqlite') {
			it('should be able to perform delete queries with returning', async () => {
				const result = await ctx.kysely
					.deleteFrom('person')
					.where('id', '=', 1)
					.returning('gender')
					.executeTakeFirstOrThrow()

				expect(result).to.deep.equal({ gender: DEFAULT_DATA_SET[0].gender })
			})
		}
	})
}
