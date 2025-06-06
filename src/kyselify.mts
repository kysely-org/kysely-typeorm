import type {
	Generated as KyselyGenerated,
	GeneratedAlways as KyselyGeneratedAlways,
	JSONColumnType as KyselyJSONColumnType,
} from 'kysely'

/**
 * This is used to mark entity properties that have their values generated by TypeORM
 * or the database, so that {@link KyselifyEntity} can mark them as Kysely Generated.
 *
 * Kysely treats Generated properties as write-optional.
 *
 * Also see {@link GeneratedAlways} and {@link NonAttribute}.
 *
 * ### example
 *
 * ```ts
 * import type { Generated, GeneratedAlways, NonAttribute } from 'kysely-typeorm'
 * import {
 *   Column,
 *   CreateDateColumn,
 *   DeleteDateColumn,
 *   Entity,
 *   Generated as TypeORMGenerated,
 *   PrimaryGeneratedColumn,
 *   UpdateDateColumn,
 *   VersionColumn
 * } from 'typeorm'
 *
 * \@Entity({ name: 'user' })
 * export class UserEntity {
 *   \@PrimaryGeneratedColumn()
 *   id: GeneratedAlways<number>
 *
 *   \@Column({ type: 'varchar', length: 255, unique: true })
 *   username: string
 *
 *   \@Column({ type: 'varchar', length: 255, nullable: true })
 *   steamAccountId: string | null
 *
 *   \@CreateDateColumn()
 *   createdAt: Generated<Date>
 *
 *   \@UpdateDateColumn()
 *   updatedAt: Generated<Date>
 *
 *   \@DeleteDateColumn()
 *   deletedAt: Generated<Date | null>
 *
 *   \@VersionColumn()
 *   version: Generated<number>
 *
 *   \@Column()
 *   \@TypeORMGenerated('uuid')
 *   uuid: Generated<string>
 * }
 *
 * type User = KyselifyEntity<UserEntity>
 * //    ^?  { id: GeneratedAlways<number>, username: string, steamAccountId: string | null, createdAt: Generated<Date>, updatedAt: Generated<Date>, deletedAt: Generated<Date | null>, version: Generated<number>, uuid: Generated<string> }
 * ```
 */
export type Generated<T> =
	| (Exclude<T, null> & {
			readonly __kysely__generated__?: unique symbol
	  })
	| Extract<null, T>

/**
 * This is used to mark entity properties that have their values generated by TypeORM
 * or the database, so that {@link KyselifyEntity} can mark them as Kysely GeneratedAlways.
 *
 * Kysely treats GeneratedAlways properties as read-only.
 *
 * Also see {@link Generated} and {@link NonAttribute}.
 *
 * ### example
 *
 * ```ts
 * import type { Generated, GeneratedAlways, NonAttribute } from 'kysely-typeorm'
 * import {
 *   Column,
 *   CreateDateColumn,
 *   DeleteDateColumn,
 *   Generated as TypeORMGenerated,
 *   PrimaryGeneratedColumn,
 *   UpdateDateColumn,
 *   VersionColumn
 * } from 'typeorm'
 *
 * \@Entity({ name: 'user' })
 * export class UserEntity {
 *   \@PrimaryGeneratedColumn()
 *   id: GeneratedAlways<number>
 *
 *   \@Column({ type: 'varchar', length: 255, unique: true })
 *   username: string
 *
 *   \@Column({ type: 'varchar', length: 255, nullable: true })
 *   steamAccountId: string | null
 *
 *   \@CreateDateColumn()
 *   createdAt: Generated<Date>
 *
 *   \@UpdateDateColumn()
 *   updatedAt: Generated<Date>
 *
 *   \@DeleteDateColumn()
 *   deletedAt: Generated<Date | null>
 *
 *   \@VersionColumn()
 *   version: Generated<number>
 *
 *   \@Column()
 *   \@TypeORMGenerated('uuid')
 *   uuid: Generated<string>
 * }
 *
 * type User = KyselifyEntity<UserEntity>
 * //    ^?  { id: GeneratedAlways<number>, username: string, steamAccountId: string | null, createdAt: Generated<Date>, updatedAt: Generated<Date>, deletedAt: Generated<Date | null>, version: Generated<number>, uuid: Generated<string> }
 * ```
 */
export type GeneratedAlways<T> =
	| (Exclude<T, null> & {
			readonly __kysely__generated__always__?: unique symbol
	  })
	| Extract<null, T>

/**
 * This is used to mark entity properties that are populated at runtime by TypeORM and do
 * not exist in the database schema, so that {@link KyselifyEntity} can exclude
 * them.
 *
 * ### example
 *
 * ```ts
 * import type { GeneratedAlways, NonAttribute } from 'kysely-typeorm'
 * import {
 *   Column,
 *   Entity,
 *   JoinColumn,
 *   ManyToMany,
 *   ManyToOne,
 *   OneToMany,
 *   PrimaryGeneratedColumn,
 *   RelationId,
 *   VirtualColumn
 * } from 'typeorm'
 * import { ClanEntity } from './Clan'
 * import { PostEntity } from './Post'
 * import { RoleEntity } from './Role'
 *
 * \@Entity({ name: 'user' })
 * export class UserEntity {
 *   \@PrimaryGeneratedColumn()
 *   id: GeneratedAlways<number>
 *
 *   \@Column({ type: 'varchar', length: 255, unique: true })
 *   username: string
 *
 *   \@Column({ type: 'varchar', length: 255, nullable: true })
 *   steamAccountId: string | null
 *
 *   \@OneToMany(() => PostEntity, (post) => post.user)
 *   posts: NonAttribute<PostEntity[]>
 *
 *   \@ManyToOne(() => ClanEntity, (clan) => clan.users)
 *   \@JoinColumn({ name: 'clanId', referencedColumnName: 'id' })
 *   clan: NonAttribute<ClanEntity>
 *
 *   \@RelationId((user) => user.clan)
 *   clanId: number | null
 *
 *   \@ManyToMany(() => RoleEntity)
 *   \@JoinTable()
 *   roles: NonAttribute<RoleEntity[]>
 *
 *   \@RelationId((role) => role.users)
 *   roleIds: NonAttribute<number[]>
 *
 *   \@VirtualColumn({ query: (alias) => `select count("id") from "posts" where "author_id" = ${alias}.id` })
 *   totalPostsCount: NonAttribute<number>
 * }
 *
 * type User = KyselifyEntity<UserEntity>
 * //    ^?  { id: Generated<number>, username: string, steamAccountId: string | null, clanId: number | null }
 * ```
 */
export type NonAttribute<T> =
	| (Exclude<T, null> & {
			readonly __kysely__non__attribute__?: unique symbol
	  })
	| Extract<null, T>

/**
 * This is used to mark entity properties of type `'simple-array'` that are stored as
 * comma-separated string values in the database, and are transformed into arrays in the
 * TypeORM entity, so that they are properly represented as string values when
 * fetched from the database using Kysely.
 */
// biome-ignore lint/suspicious/noExplicitAny: this is fine.
export type SimpleArray<T extends any[] | null> =
	| (Exclude<T, null> & {
			readonly __kysely__simple__array__?: unique symbol
	  })
	| Extract<null, T>

/**
 * This is used to mark entity properties of type `'simple-json'` or other JSON types that are stored as
 * `JSON.stringify`d values in the database, and are `JSON.parse`d in the
 * TypeORM entity, so that they are properly represented as string values when
 * fetched from the database using Kysely.
 */
export type JSONColumnType<T extends object | null> =
	| (Exclude<T, null> & {
			readonly __kysely__json__?: unique symbol
	  })
	| Extract<null, T>

/**
 * This is used to transform TypeORM entities into Kysely entities.
 *
 * Also see {@link Generated}, {@link GeneratedAlways} and {@link NonAttribute}.
 *
 * ### example
 *
 * ```ts
 * import type { Generated, GeneratedAlways, NonAttribute } from 'kysely-typeorm'
 * import {
 *   Column,
 *   CreateDateColumn,
 *   DeleteDateColumn,
 *   Entity,
 *   Generated as TypeORMGenerated,
 *   JoinColumn,
 *   JoinTable,
 *   ManyToMany,
 *   ManyToOne,
 *   OneToMany,
 *   PrimaryGeneratedColumn,
 *   RelationId,
 *   UpdateDateColumn,
 *   VersionColumn,
 *   VirtualColumn
 * } from 'typeorm'
 * import { ClanEntity } from './Clan'
 * import { PostEntity } from './Post'
 * import { RoleEntity } from './Role'
 *
 * \@Entity({ name: 'user' })
 * export class UserEntity {
 *   \@PrimaryGeneratedColumn()
 *   id: GeneratedAlways<number>
 *
 *   \@Column({ type: 'varchar', length: 255, unique: true })
 *   username: string
 *
 *   \@Column({ type: 'varchar', length: 255, nullable: true })
 *   steamAccountId: string | null
 *
 *   \@CreateDateColumn()
 *   createdAt: Generated<Date>
 *
 *   \@UpdateDateColumn()
 *   updatedAt: Generated<Date>
 *
 *   \@DeleteDateColumn()
 *   deletedAt: Generated<Date | null>
 *
 *   \@VersionColumn()
 *   version: Generated<number>
 *
 *   \@Column()
 *   \@TypeORMGenerated('uuid')
 *   uuid: Generated<string>
 *
 *   \@OneToMany(() => PostEntity, (post) => post.user)
 *   posts: NonAttribute<PostEntity[]>
 *
 *   \@ManyToOne(() => ClanEntity, (clan) => clan.users)
 *   \@JoinColumn({ name: 'clanId', referencedColumnName: 'id' })
 *   clan: NonAttribute<ClanEntity>
 *
 *   \@RelationId((user) => user.clan)
 *   clanId: number | null
 *
 *   \@ManyToMany(() => RoleEntity)
 *   \@JoinTable()
 *   roles: NonAttribute<RoleEntity[]>
 *
 *   \@RelationId((role) => role.users)
 *   roleIds: NonAttribute<number[]>
 *
 *   \@VirtualColumn({ query: (alias) => `select count("id") from "posts" where "author_id" = ${alias}.id` })
 *   totalPostsCount: NonAttribute<number>
 * }
 *
 * export type User = KyselifyEntity<UserEntity>
 * //            ^?  { id: GeneratedAlways<number>, username: string, steamAccountId: string | null, createdAt: Generated<Date>, updatedAt: Generated<Date>, deletedAt: Generated<Date | null>, version: Generated<number>, uuid: Generated<string>, clandId: number | null }
 * ```
 *
 * and then you can use it like this:
 *
 * ```ts
 * import { Clan } from './Clan'
 * import { Post } from './Post'
 * import { Role } from './Role'
 * import { User } from './User'
 *
 * export interface Database {
 *   clan: Clan
 *   post: Post
 *   role: Role
 *   user: User
 * }
 *
 * export const kysely = new Kysely<Database>(
 *   // ...
 * )
 * ```
 */
export type KyselifyEntity<E> = {
	// biome-ignore lint/suspicious/noExplicitAny: it's fine here.
	[K in keyof E as E[K] extends (...args: any) => any
		? never
		: // Record<string, ...>
			string extends keyof NonNullable<E[K]>
			? K
			: '__kysely__non__attribute__' extends keyof NonNullable<E[K]>
				? never
				: K]-?: // Record<string, ...>
	string extends keyof NonNullable<E[K]>
		? '__kysely__json__' extends keyof NonNullable<E[K]>
			? E[K] extends JSONColumnType<infer T>
				? KyselyJSONColumnType<T>
				: never
			: E[K] extends object | null
				? KyselyJSONColumnType<E[K]>
				: never
		: '__kysely__generated__' extends keyof NonNullable<E[K]>
			? E[K] extends Generated<infer T>
				? KyselyGenerated<Exclude<T, undefined>>
				: never
			: '__kysely__generated__always__' extends keyof NonNullable<E[K]>
				? E[K] extends GeneratedAlways<infer T>
					? KyselyGeneratedAlways<Exclude<T, undefined>>
					: never
				: '__kysely__simple__array__' extends keyof NonNullable<E[K]>
					? E[K] extends SimpleArray<infer T>
						? string | Extract<null, T>
						: never
					: '__kysely__json__' extends keyof NonNullable<E[K]>
						? E[K] extends JSONColumnType<infer T>
							? KyselyJSONColumnType<T>
							: never
						: Exclude<E[K], undefined>
}
