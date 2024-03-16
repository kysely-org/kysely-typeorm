import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId} from 'typeorm'
import type {Generated, NonAttribute} from '../../../src'
import {PetEntity} from './Pet'

// Trying to recreate the following interface with typeorm:
//
// export interface Toy {
//   id: Generated<number>
//   name: string
//   price: number
//   pet_id: number
// }
//
// .addColumn('name', 'varchar(255)', (col) => col.unique().notNull())
// .addColumn('price', 'double precision', (col) => col.notNull())
// .addColumn('pet_id', 'integer', (col) => col.references('pet.id').onDelete('cascade').notNull())

@Entity({name: 'toy'})
export class ToyEntity extends BaseEntity {
  @PrimaryGeneratedColumn({type: 'integer'})
  id: Generated<number>

  @Column({type: 'varchar', length: 255, unique: true})
  name: string

  @Column({type: 'double precision'})
  price: number

  @ManyToOne(() => PetEntity, (pet) => pet.toys, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'pet_id', referencedColumnName: 'id'})
  pet: NonAttribute<PetEntity>

  @RelationId((toy: ToyEntity) => toy.pet)
  petId: number
}
