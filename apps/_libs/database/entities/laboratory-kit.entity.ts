import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('LaboratoryKit')
export default class LaboratoryKit {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: 1 })
  @Expose()
  priority: number

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string

  @Expose()
  @Column({ type: 'text', default: JSON.stringify([]) })
  laboratoryIds: string

  static fromRaw(raw: { [P in keyof LaboratoryKit]: any }) {
    if (!raw) return null
    const entity = new LaboratoryKit()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof LaboratoryKit]: any }[]) {
    return raws.map((i) => LaboratoryKit.fromRaw(i))
  }
}

export type LaboratoryKitRelationType = {
  [P in keyof Pick<LaboratoryKit, never>]?: boolean
}

export type LaboratoryKitInsertType = Omit<
  LaboratoryKit,
  keyof LaboratoryKitRelationType | keyof Pick<LaboratoryKit, 'id'>
>

export type LaboratoryKitUpdateType = {
  [K in Exclude<
    keyof LaboratoryKit,
    keyof LaboratoryKitRelationType | keyof Pick<LaboratoryKit, 'oid' | 'id'>
  >]: LaboratoryKit[K] | (() => string)
}

export type LaboratoryKitSortType = {
  [P in keyof Pick<LaboratoryKit, 'oid' | 'id' | 'priority' | 'name'>]?: 'ASC' | 'DESC'
}