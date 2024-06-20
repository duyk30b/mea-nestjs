import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('Role')
export default class Role {
  @Column()
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn()
  @Expose()
  id: number

  @Column({ type: 'character varying', length: 255 })
  @Expose()
  name: string

  @Column({ type: 'text', default: '[]' })
  @Expose()
  permissionIds: string

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isActive: 0 | 1

  @Column({
    type: 'bigint',
    default: () => '(EXTRACT(epoch FROM now()) * (1000))',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  updatedAt: number
}

export type RoleRelationType = Pick<Role, never>

export type RoleSortType = Pick<Role, 'oid' | 'id'>

export type RoleInsertType = Omit<
  Role,
  keyof RoleRelationType | keyof Pick<Role, 'id' | 'updatedAt'>
>

export type RoleUpdateType = Omit<
  Role,
  keyof RoleRelationType | keyof Pick<Role, 'oid' | 'id' | 'updatedAt'>
>
