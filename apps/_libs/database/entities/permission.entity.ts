import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { PermissionId } from '../../permission/permission.enum'

@Entity('Permission')
export default class Permission {
  @PrimaryGeneratedColumn('identity', { name: 'id', generatedIdentity: 'BY DEFAULT' })
  @Expose()
  id: PermissionId

  @Column({ type: 'smallint' })
  @Expose()
  level: number

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  code: string

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  parentId: PermissionId | 0

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  rootId: PermissionId | 0

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  pathId: string

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isActive: 0 | 1

  static fromRaw(raw: { [P in keyof Permission]: any }) {
    if (!raw) return null
    const entity = new Permission()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof Permission]: any }[]) {
    return raws.map((i) => Permission.fromRaw(i))
  }
}

export type PermissionRelationType = {
  [P in keyof Pick<Permission, never>]?: boolean
}

export type PermissionInsertType = Omit<
  Permission,
  keyof PermissionRelationType | keyof Pick<Permission, 'id'>
>

export type PermissionUpdateType = {
  [K in Exclude<keyof Permission, keyof PermissionRelationType | keyof Pick<Permission, 'id'>>]:
  | Permission[K]
  | (() => string)
}

export type PermissionSortType = {
  [P in keyof Pick<Permission, 'id'>]?: 'ASC' | 'DESC'
}
