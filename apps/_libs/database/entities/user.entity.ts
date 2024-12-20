import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { EGender } from '../common/variable'
import Device from './device'
import Organization from './organization.entity'
import UserRole from './user-role.entity'

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
  @Column({ type: 'varchar', length: 255 })
  username: string

  @Exclude()
  @Column({ name: 'hashPassword', type: 'varchar', length: 255 })
  hashPassword: string

  @Expose({ groups: [UserGroup.ROOT] })
  @Column({ type: 'varchar', length: 255, nullable: true })
  secret: string

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
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
  isAdmin: 0 | 1

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
  @ManyToOne((type) => Organization, (organization) => organization.userList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'oid', referencedColumnName: 'id' })
  organization: Organization

  @Expose()
  @OneToMany((type) => UserRole, (userRole) => userRole.user)
  userRoleList: UserRole[]

  @Expose()
  devices: Device[]

  static fromRaw(raw: { [P in keyof User]: any }) {
    if (!raw) return null
    const entity = new User()
    Object.assign(entity, raw)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)
    entity.deletedAt = raw.deletedAt == null ? raw.deletedAt : Number(raw.deletedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof User]: any }[]) {
    return raws.map((i) => User.fromRaw(i))
  }
}

export type UserRelationType = {
  [P in keyof Pick<User, 'organization' | 'devices'>]?: boolean
} & {
  [P in keyof Pick<
    User,
    'userRoleList'
  >]?: { [P in keyof Pick<UserRole, 'user' | 'role'>]?: boolean } | false
}

export type UserInsertType = Omit<
  User,
  keyof UserRelationType | keyof Pick<User, 'id' | 'updatedAt' | 'deletedAt'>
>

export type UserUpdateType = {
  [K in Exclude<
    keyof User,
    keyof UserRelationType | keyof Pick<User, 'oid' | 'id' | 'updatedAt'>
  >]: User[K] | (() => string)
}

export type UserSortType = {
  [P in keyof Pick<User, 'oid' | 'id' | 'phone' | 'username'>]?: 'ASC' | 'DESC'
}
