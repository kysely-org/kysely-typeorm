# kysely-typeorm

TypeORM is an ORM that can run in NodeJS, Browser, Cordova, PhoneGap, Ionic, React Native, NativeScript, Expo, and Electron platforms and can be used with TypeScript and JavaScript (ES2021). Its goal is to always support the latest JavaScript features and provide additional features that help you to develop any kind of application that uses databases - from small applications with a few tables to large-scale enterprise applications with multiple databases.

As of Mar 17, 2024, TypeORM [has 1,723,707 weekly downloads on npm](https://npmtrends.com/prisma-vs-sequelize-vs-typeorm) (3rd most popular ORM). It is a very popular ORM for Node.js and TypeScript.

Just like most ORMs for Node.js, TypeORM has poor TypeScript support when it comes to writing queries outside the ORM's CRUD methods - something that happens more often than you might imagine - usually due to performance optimizations OR as a general escape hatch. This is where Kysely comes in.

Kysely (pronounced “Key-Seh-Lee”) is a type-safe and autocompletion-friendly TypeScript SQL query builder. Inspired by Knex. Mainly developed for Node.js but also runs on Deno and in the browser.

A match made in heaven, on paper. Let's see how it works in practice, with `kysely-typeorm` - a toolkit (dialect, type translators, etc.) that allows using your existing TypeORM setup with Kysely.

## Installation

Main dependencies:

```sh
npm i kysely kysely-typeorm typeorm
```

PostgreSQL:

```sh
npm i pg
```

MySQL:

```sh
npm i mysql2
```

MS SQL Server (MSSQL):

ATTENTION: While Kysely supports `tedious` with its core MS SQL Server (MSSQL) dialect, TypeORM uses `mssql` under the hood. This library doesn't use Kysely's own drivers.

```sh
npm i mssql
```

SQLite:

```sh
npm i better-sqlite3
```

## Usage

### Entities & Types

Update your entities using this library's `NonAttribute`, `Generated` and `GeneratedAlways` types.

`src/entities/Person.ts`

```diff
+import type {Generated, NonAttribute} from 'kysely-typeorm'
import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import {PetEntity} from './Pet'

@Entity({name: 'person'})
export class PersonEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
- id: number
+ id: Generated<number>

  @Column({type: 'varchar', length: 255, nullable: true})
  firstName: string | null

  @Column({type: 'varchar', length: 255, nullable: true})
  middleName: string | null

  @Column({type: 'varchar', length: 255, nullable: true})
  lastName: string | null

  @Column({type: 'varchar', length: 50})
  gender: 'male' | 'female' | 'other'

  @Column({type: 'varchar', length: 50, nullable: true})
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | null

  @OneToMany(() => PetEntity, (pet) => pet.owner, {cascade: ['insert']})
- pets: PetEntity[]
+ pets: NonAttribute<PetEntity[]>
}
```

`src/entities/Pet.ts`

```diff
+import type {Generated, NonAttribute} from 'kysely-typeorm'
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm'
import {PersonEntity} from './Person'
import {ToyEntity} from './Toy'

@Entity({name: 'pet'})
export class PetEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
- id: number
+ id: Generated<number>

  @Column({type: 'varchar', length: 255, unique: true})
  name: string

  @ManyToOne(() => PersonEntity, (person) => person.pets, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'owner_id', referencedColumnName: 'id'})
  @Index('pet_owner_id_index')
- owner: PersonEntity
+ owner: NonAttribute<PersonEntity>

  @RelationId((pet: PetEntity) => pet.owner)
  ownerId: number

  @Column({type: 'varchar', length: 50})
  species: 'dog' | 'cat' | 'hamster'

  @OneToMany(() => ToyEntity, (toy) => toy.pet, {cascade: ['insert']})
- toys: ToyEntity[]
+ toys: NonAttribute<ToyEntity[]>
}
```

`src/entities/Toy.ts`

```ts
+import type {Generated, NonAttribute} from 'kysely-typeorm'
import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId} from 'typeorm'
import {PetEntity} from './Pet'

@Entity({name: 'toy'})
export class ToyEntity extends BaseEntity {
  @PrimaryGeneratedColumn({type: 'integer'})
- id: number
+ id: Generated<number>

  @Column({type: 'varchar', length: 255, unique: true})
  name: string

  @Column({type: 'double precision'})
  price: number

  @ManyToOne(() => PetEntity, (pet) => pet.toys, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'pet_id', referencedColumnName: 'id'})
- pet: PetEntity
+ pet: NonAttribute<PetEntity>

  @RelationId((toy: ToyEntity) => toy.pet)
  petId: number
}
```

`src/types/database.ts`:

```ts
import type {KyselifyEntity} from 'kysely-typeorm'
import type {PersonEntity} from '../entities/Person'
import type {PetEntity} from '../entities/Pet'
import type {ToyEntity} from '../entities/Toy'

export type PersonTable = KyselifyEntity<PersonEntity>
//               ^? { id: Generated<number>, firstName: string | null, ... }
export type PetTable = KyselifyEntity<PetEntity>
export type ToyTable = KyselifyEntity<ToyEntity>

export interface Database {
  person: PersonTable
  pet: PetTable
  toy: ToyTable
}
```

### TypeORM DataSource Instance

Create a TypeORM DataSource instance.

`src/typeorm.ts`:

```ts
import {SnakeNamingStrategy} from 'typeorm-naming-strategies' // optional
import {PersonEntity} from './entities/Person'
import {PetEntity} from './entities/Pet'
import {ToyEntity} from './entities/Toy'

export const dataSource = new DataSource({
  entities: [PersonEntity, PetEntity, ToyEntity],
  database: 'test',
  host: 'localhost',
  namingStrategy: new SnakeNamingStrategy(), // optional
  poolSize: 10,
  port: 5434,
  type: 'postgres',
  username: 'kysely',
  useUTC: true,
})
```

### Kysely Instance

Create a Kysely instance.

`src/kysely.ts`:

```ts
import {
  CamelCasePlugin, // optional
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler
} from 'kysely'
import { KyselyTypeORMDialect } from 'kysely-typeorm'
import type {Database} from './types/database'
import {dataSource} from './typeorm'

export const kysely = new Kysely<Database>({
  dialect: new KyselyTypeORMDialect({
    // kysely-typeorm also supports MySQL, MS SQL Server (MSSQL), and SQLite.
    kyselySubDialect: {
      createAdapter: () => new PostgresAdapter(),
      createIntrospector: (db) => new PostgresIntrospector(db),
      createQueryCompiler: () => new PostgresQueryCompiler(),
    },
    typeORMDataSource: dataSource,
  }),
  // `CamelCasePlugin` is used to align with `typeorm-naming-strategies`'s `SnakeNamingStrategy`.
  plugins: [new CamelCasePlugin()], // optional
})
```
