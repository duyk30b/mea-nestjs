import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('LaboratoryGroup')
export default class LaboratoryGroup {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string

  static fromRaw(raw: { [P in keyof LaboratoryGroup]: any }) {
    if (!raw) return null
    const entity = new LaboratoryGroup()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof LaboratoryGroup]: any }[]) {
    return raws.map((i) => LaboratoryGroup.fromRaw(i))
  }
}

export type LaboratoryGroupRelationType = Pick<LaboratoryGroup, never>

export type LaboratoryGroupSortType = Pick<LaboratoryGroup, 'oid' | 'id' | 'name'>

export type LaboratoryGroupInsertType = Omit<
  LaboratoryGroup,
  keyof LaboratoryGroupRelationType | keyof Pick<LaboratoryGroup, 'id'>
>

export type LaboratoryGroupUpdateType = Omit<
  LaboratoryGroup,
  keyof LaboratoryGroupRelationType | keyof Pick<LaboratoryGroup, 'oid' | 'id'>
>
