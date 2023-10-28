import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { EGender } from '../common/variable'
import Device from './device'
import Organization from './organization.entity'
import Role from './role.entity'

export enum UserGroup {
  ROOT = 'ROOT',
}

@Entity('User')
export default class User {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column({ type: 'char', length: 10, nullable: true })
  phone: string

  @Expose()
  @Column({ type: 'character varying', length: 255 })
  username: string

  @Exclude()
  @Column({ name: 'hashPassword', type: 'character varying', length: 255 })
  hashPassword: string

  @Expose({ groups: [UserGroup.ROOT] })
  @Column({ type: 'character varying', length: 255, nullable: true })
  secret: string

  @Expose()
  @Column({ type: 'integer', default: 1 })
  roleId: number

  @Expose()
  @Column({ type: 'character varying', length: 255, nullable: true })
  fullName: string

  @Expose()
  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  birthday: number

  @Expose()
  @Column({ type: 'smallint', nullable: true })
  gender: EGender

  @Expose()
  @Column({ type: 'smallint', default: 1 })
  isActive: 0 | 1

  @Expose()
  @Column({
    type: 'bigint',
    default: () => '(EXTRACT(epoch FROM now()) * (1000))',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  createdAt: number

  @Expose()
  @Column({
    type: 'bigint',
    default: () => '(EXTRACT(epoch FROM now()) * (1000))',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  updatedAt: number

  @Expose()
  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  deletedAt: number

  @Expose()
  @ManyToOne((type) => Organization, (organization) => organization.users, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'oid', referencedColumnName: 'id' })
  organization: Organization

  @Expose()
  @ManyToOne((type) => Role, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'roleId', referencedColumnName: 'id' })
  role: Role

  @Expose()
  devices: Device[]
}

export type UserInsertType = Omit<
  User,
  'id' | 'role' | 'organization' | 'devices' | 'createdAt' | 'updatedAt' | 'deletedAt'
>
export type UserUpdateType = Omit<
  User,
  'oid' | 'id' | 'role' | 'organization' | 'devices' | 'createdAt' | 'updatedAt'
>
