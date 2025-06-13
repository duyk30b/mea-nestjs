import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('LaboratorySample')
export default class LaboratorySample {
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

  static fromRaw(raw: { [P in keyof LaboratorySample]: any }) {
    if (!raw) return null
    const entity = new LaboratorySample()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof LaboratorySample]: any }[]) {
    return raws.map((i) => LaboratorySample.fromRaw(i))
  }
}

export type LaboratorySampleRelationType = {
  [P in keyof Pick<LaboratorySample, never>]?: boolean
}

export type LaboratorySampleInsertType = Omit<
  LaboratorySample,
  keyof LaboratorySampleRelationType | keyof Pick<LaboratorySample, 'id'>
>

export type LaboratorySampleUpdateType = {
  [K in Exclude<
    keyof LaboratorySample,
    keyof LaboratorySampleRelationType | keyof Pick<LaboratorySample, 'oid' | 'id'>
  >]: LaboratorySample[K] | (() => string)
}

export type LaboratorySampleSortType = {
  [P in keyof Pick<LaboratorySample, 'oid' | 'id' | 'priority' | 'name'>]?: 'ASC' | 'DESC'
}