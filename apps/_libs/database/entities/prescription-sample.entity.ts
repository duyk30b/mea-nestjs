import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryColumn } from 'typeorm'
import PrescriptionSampleItem from './prescription-sample-item.entity'

@Entity('PrescriptionSample')
export default class PrescriptionSample {
  @Expose()
  @Column()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Expose()
  @Column({ default: 0 })
  userId: number

  @Column({ default: 1 })
  @Expose()
  priority: number

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string

  @Expose()
  prescriptionSampleItemList: PrescriptionSampleItem[]

  static fromRaw(raw: { [P in keyof PrescriptionSample]: any }) {
    if (!raw) return null
    const entity = new PrescriptionSample()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof PrescriptionSample]: any }[]) {
    return raws.map((i) => PrescriptionSample.fromRaw(i))
  }
}

export type PrescriptionSampleRelationType = {
  [P in keyof Pick<PrescriptionSample, 'prescriptionSampleItemList'>]?: boolean
}

export type PrescriptionSampleSortType = {
  [P in keyof Pick<PrescriptionSample, 'oid' | 'id' | 'priority' | 'name'>]?: 'ASC' | 'DESC'
}

export type PrescriptionSampleInsertType = Omit<
  PrescriptionSample,
  keyof PrescriptionSampleRelationType | keyof Pick<PrescriptionSample, 'id'>
>

export type PrescriptionSampleUpdateType = {
  [K in Exclude<
    keyof PrescriptionSample,
    keyof PrescriptionSampleRelationType | keyof Pick<PrescriptionSample, 'oid' | 'id'>
  >]: PrescriptionSample[K] | (() => string)
}
