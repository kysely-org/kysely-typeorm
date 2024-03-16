import {
  CamelCasePlugin,
  Kysely,
  MssqlAdapter,
  MssqlIntrospector,
  MssqlQueryCompiler,
  MysqlAdapter,
  MysqlIntrospector,
  MysqlQueryCompiler,
  ParseJSONResultsPlugin,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
  type KyselyPlugin,
} from 'kysely'
import 'reflect-metadata'
import {DataSource, type DataSourceOptions, type DeepPartial} from 'typeorm'
import {SnakeNamingStrategy} from 'typeorm-naming-strategies'
import {
  KyselyTypeORMDialect,
  type KyselifyEntity,
  type KyselySubDialect,
  type KyselyTypeORMDialectConfig,
} from '../../src'
import type {SupportedDialect} from '../../src/supported-dialects'
import {PersonEntity} from './entity/Person'
import {PetEntity} from './entity/Pet'
import {ToyEntity} from './entity/Toy'

export type Person = KyselifyEntity<PersonEntity>
export type Pet = KyselifyEntity<PetEntity>
export type Toy = KyselifyEntity<ToyEntity>

export interface Database {
  person: Person
  pet: Pet
  toy: Toy
}

export interface TestContext {
  kysely: Kysely<Database>
  typeORMDataSource: DataSource
}

export type PerDialect<T> = Record<SupportedDialect, T>

const TEST_INIT_TIMEOUT = 5 * 60 * 1_000

export const PLUGINS: KyselyPlugin[] = [new ParseJSONResultsPlugin(), new CamelCasePlugin()]

const POOL_SIZE = 10

const sqliteSubDialect = {
  createAdapter: () => new SqliteAdapter(),
  createIntrospector: (db) => new SqliteIntrospector(db),
  createQueryCompiler: () => new SqliteQueryCompiler(),
} satisfies KyselySubDialect

const BASE_DATA_SOURCE_OPTIONS = {
  entities: [PersonEntity, PetEntity, ToyEntity],
  logging: false,
  // logging: 'all',
  namingStrategy: new SnakeNamingStrategy(),
} satisfies Omit<DataSourceOptions, 'type'>

export const CONFIGS: PerDialect<
  Omit<KyselyTypeORMDialectConfig, 'typeORMDataSource'> & {
    typeORMDataSourceOptions: DataSourceOptions
  }
> = {
  'better-sqlite3': {
    kyselySubDialect: sqliteSubDialect,
    typeORMDataSourceOptions: {
      ...BASE_DATA_SOURCE_OPTIONS,
      database: ':memory:',
      type: 'better-sqlite3',
    },
  },
  mssql: {
    kyselySubDialect: {
      createAdapter: () => new MssqlAdapter(),
      createIntrospector: (db) => new MssqlIntrospector(db),
      createQueryCompiler: () => new MssqlQueryCompiler(),
    },
    typeORMDataSourceOptions: {
      ...BASE_DATA_SOURCE_OPTIONS,
      database: 'kysely_test',
      host: 'localhost',
      password: 'KyselyTest0',
      pool: {min: 0, max: POOL_SIZE},
      port: 21433,
      type: 'mssql',
      username: 'sa',
      options: {
        trustServerCertificate: true,
        useUTC: true,
      },
    },
  },
  mysql: {
    kyselySubDialect: {
      createAdapter: () => new MysqlAdapter(),
      createIntrospector: (db) => new MysqlIntrospector(db),
      createQueryCompiler: () => new MysqlQueryCompiler(),
    },
    typeORMDataSourceOptions: {
      ...BASE_DATA_SOURCE_OPTIONS,
      bigNumberStrings: true,
      database: 'kysely_test',
      host: 'localhost',
      password: 'kysely',
      poolSize: POOL_SIZE,
      port: 3308,
      supportBigNumbers: true,
      type: 'mysql',
      username: 'kysely',
    },
  },
  postgres: {
    kyselySubDialect: {
      createAdapter: () => new PostgresAdapter(),
      createIntrospector: (db) => new PostgresIntrospector(db),
      createQueryCompiler: () => new PostgresQueryCompiler(),
    },
    typeORMDataSourceOptions: {
      ...BASE_DATA_SOURCE_OPTIONS,
      database: 'kysely_test',
      host: 'localhost',
      poolSize: POOL_SIZE,
      port: 5434,
      type: 'postgres',
      username: 'kysely',
      useUTC: true,
    },
  },
  sqlite: {
    kyselySubDialect: sqliteSubDialect,
    typeORMDataSourceOptions: {
      ...BASE_DATA_SOURCE_OPTIONS,
      database: ':memory:',
      type: 'sqlite',
    },
  },
}

export async function initTest(ctx: Mocha.Context, dialect: SupportedDialect): Promise<TestContext> {
  const config = CONFIGS[dialect]

  const typeORMDataSource = new DataSource(config.typeORMDataSourceOptions)

  ctx.timeout(TEST_INIT_TIMEOUT)
  await typeORMDataSource.initialize()

  await typeORMDataSource.synchronize(true)

  const kysely = new Kysely<Database>({
    dialect: new KyselyTypeORMDialect({
      kyselySubDialect: config.kyselySubDialect,
      typeORMDataSource,
    }),
    plugins: PLUGINS,
  })

  return {kysely, typeORMDataSource}
}

export const DEFAULT_DATA_SET = [
  {
    firstName: 'Jennifer',
    middleName: null,
    lastName: 'Aniston',
    gender: 'female',
    pets: [{name: 'Catto', species: 'cat', toys: []}],
    maritalStatus: 'divorced',
  },
  {
    firstName: 'Arnold',
    middleName: null,
    lastName: 'Schwarzenegger',
    gender: 'male',
    pets: [{name: 'Doggo', species: 'dog', toys: []}],
    maritalStatus: 'divorced',
  },
  {
    firstName: 'Sylvester',
    middleName: 'Rocky',
    lastName: 'Stallone',
    gender: 'male',
    pets: [{name: 'Hammo', species: 'hamster', toys: []}],
    maritalStatus: 'married',
  },
] as const satisfies DeepPartial<PersonEntity>[]

export async function seedDatabase(_ctx: TestContext): Promise<void> {
  for (const datum of DEFAULT_DATA_SET) {
    await PersonEntity.create(datum).save()
  }
}
