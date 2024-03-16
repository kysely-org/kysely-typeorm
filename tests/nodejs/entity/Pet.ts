import 'reflect-metadata'
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
import type {Generated, NonAttribute} from '../../../src'
import {PersonEntity} from './Person'
import {ToyEntity} from './Toy'

// Trying to recreate the following interface with typeorm:
//
// export interface Pet {
//   id: Generated<number>
//   name: string
//   owner_id: number
//   species: 'dog' | 'cat' | 'hamster'
// }
//
//  .addColumn('name', 'varchar(255)', (col) => col.unique().notNull())
//  .addColumn('owner_id', 'integer', (col) => col.references('person.id').onDelete('cascade').notNull())
//  .addColumn('species', 'varchar(50)', (col) => col.notNull())
//
//  .createIndex('pet_owner_id_index').on('pet').column('owner_id')

@Entity({name: 'pet'})
export class PetEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: Generated<number>

  @Column({type: 'varchar', length: 255, unique: true})
  name: string

  @ManyToOne(() => PersonEntity, (person) => person.pets, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'owner_id', referencedColumnName: 'id'})
  @Index('pet_owner_id_index')
  owner: NonAttribute<PersonEntity>

  @RelationId((pet: PetEntity) => pet.owner)
  ownerId: number

  @Column({type: 'varchar', length: 50})
  species: 'dog' | 'cat' | 'hamster'

  @OneToMany(() => ToyEntity, (toy) => toy.pet, {cascade: ['insert']})
  toys: NonAttribute<ToyEntity[]>
}
