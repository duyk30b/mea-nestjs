import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('UserGroup')
export default class UserGroup {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column({ type: 'character varying', length: 255 })
  name: string

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

  static fromRaw(raw: { [P in keyof UserGroup]: any }) {
    if (!raw) return null
    const entity = new UserGroup()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof UserGroup]: any }[]) {
    return raws.map((i) => UserGroup.fromRaw(i))
  }
}

export type UserGroupRelationType = Pick<UserGroup, never>

export type UserGroupSortType = Pick<UserGroup, 'oid' | 'id'>

export type UserGroupInsertType = Omit<
  UserGroup,
  keyof UserGroupRelationType | keyof Pick<UserGroup, 'id' | 'updatedAt'>
>

export type UserGroupUpdateType = Omit<
  UserGroup,
  keyof UserGroupRelationType | keyof Pick<UserGroup, 'oid' | 'id' | 'updatedAt'>
>
