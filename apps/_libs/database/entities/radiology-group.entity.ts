import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('RadiologyGroup')
export default class RadiologyGroup {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column({ default: 0 })
  roomId: number

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string

  static fromRaw(raw: { [P in keyof RadiologyGroup]: any }) {
    if (!raw) return null
    const entity = new RadiologyGroup()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof RadiologyGroup]: any }[]) {
    return raws.map((i) => RadiologyGroup.fromRaw(i))
  }
}

export type RadiologyGroupRelationType = {
  [P in keyof Pick<RadiologyGroup, never>]?: boolean
}

export type RadiologyGroupInsertType = Omit<
  RadiologyGroup,
  keyof RadiologyGroupRelationType | keyof Pick<RadiologyGroup, 'id'>
>

export type RadiologyGroupUpdateType = {
  [K in Exclude<
    keyof RadiologyGroup,
    keyof RadiologyGroupRelationType | keyof Pick<RadiologyGroup, 'oid' | 'id'>
  >]: RadiologyGroup[K] | (() => string)
}

export type RadiologyGroupSortType = {
  [P in keyof Pick<RadiologyGroup, 'oid' | 'id' | 'name'>]?: 'ASC' | 'DESC'
}
