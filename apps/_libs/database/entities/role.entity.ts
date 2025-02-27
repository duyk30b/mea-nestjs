import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import UserRole from './user-role.entity'

@Entity('Role')
export default class Role {
  @Column()
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn()
  @Expose()
  id: number

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string

  @Column({ type: 'varchar', length: 255, default: '' })
  @Expose()
  displayName: string

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

  @Expose()
  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoleList: UserRole[]

  static fromRaw(raw: { [P in keyof Role]: any }) {
    if (!raw) return null
    const entity = new Role()
    Object.assign(entity, raw)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Role]: any }[]) {
    return raws.map((i) => Role.fromRaw(i))
  }
}

export type RoleRelationType = {
  [P in keyof Pick<Role, never>]?: boolean
} & {
  [P in keyof Pick<
    Role,
    'userRoleList'
  >]?: { [P in keyof Pick<UserRole, 'user' | 'role'>]?: boolean } | false
}

export type RoleInsertType = Omit<
  Role,
  keyof RoleRelationType | keyof Pick<Role, 'id' | 'updatedAt'>
>

export type RoleUpdateType = {
  [K in Exclude<
    keyof Role,
    keyof RoleRelationType | keyof Pick<Role, 'oid' | 'id' | 'updatedAt'>
  >]: Role[K] | (() => string)
}

export type RoleSortType = {
  [P in keyof Pick<Role, 'oid' | 'id'>]?: 'ASC' | 'DESC'
}
