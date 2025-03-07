import { Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Role from './role.entity'
import User from './user.entity'

@Entity('UserRole')
export default class UserRole {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column()
  userId: number

  @Expose()
  @Column()
  roleId: number

  @Expose()
  @ManyToOne((type) => Role, (role) => role.userRoleList, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'roleId', referencedColumnName: 'id' })
  role: Role

  @Expose()
  @ManyToOne((type) => User, (user) => user.userRoleList, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User

  static fromRaw(raw: { [P in keyof UserRole]: any }) {
    if (!raw) return null
    const entity = new UserRole()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof UserRole]: any }[]) {
    return raws.map((i) => UserRole.fromRaw(i))
  }
}

export type UserRoleRelationType = {
  [P in keyof Pick<UserRole, 'role' | 'user'>]?: boolean
}

export type UserRoleInsertType = Omit<
  UserRole,
  keyof UserRoleRelationType | keyof Pick<UserRole, 'id'>
>

export type UserRoleUpdateType = {
  [K in Exclude<
    keyof UserRole,
    keyof UserRoleRelationType | keyof Pick<UserRole, 'oid' | 'id'>
  >]: UserRole[K] | (() => string)
}

export type UserRoleSortType = {
  [P in keyof Pick<UserRole, 'oid'>]?: 'ASC' | 'DESC'
}
