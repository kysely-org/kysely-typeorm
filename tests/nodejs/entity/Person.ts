import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import type {Generated, NonAttribute} from '../../../src'
import {PetEntity} from './Pet'

// Trying to recreate the following interface with typeorm:
//
// export interface Person {
//   id: Generated<number>
//   first_name: string | null
//   middle_name: ColumnType<string | null, string | undefined, string | undefined>
//   last_name: string | null
//   gender: 'male' | 'female' | 'other'
//   marital_status: 'single' | 'married' | 'divorced' | 'widowed' | null
// }
//
// .addColumn('first_name', 'varchar(255)')
// .addColumn('middle_name', 'varchar(255)')
// .addColumn('last_name', 'varchar(255)')
// .addColumn('gender', 'varchar(50)', (col) => col.notNull())
// .addColumn('marital_status', 'varchar(50)')

@Entity({name: 'person'})
export class PersonEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: Generated<number>

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
  pets: NonAttribute<PetEntity[]>
}
