import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('PrescriptionSampleItem')
export default class PrescriptionSampleItem {
  @Expose()
  @Column()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  prescriptionSampleId: string

  @Column({ default: 1 })
  @Expose()
  priority: number

  @Expose()
  @Column({ default: 0 })
  productId: number

  @Column({ default: 1 })
  @Expose()
  unitQuantity: number

  @Column({ default: 1 })
  @Expose()
  unitRate: number

  @Expose()
  @Column({ type: 'text', default: '' })
  hintUsage: string

  static fromRaw(raw: { [P in keyof PrescriptionSampleItem]: any }) {
    if (!raw) return null
    const entity = new PrescriptionSampleItem()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof PrescriptionSampleItem]: any }[]) {
    return raws.map((i) => PrescriptionSampleItem.fromRaw(i))
  }
}

export type PrescriptionSampleItemRelationType = {
  [P in keyof Pick<PrescriptionSampleItem, never>]?: boolean
}

export type PrescriptionSampleItemSortType = {
  [P in keyof Pick<PrescriptionSampleItem, 'oid' | 'id' | 'prescriptionSampleId' | 'priority'>]?:
    | 'ASC'
    | 'DESC'
}

export type PrescriptionSampleItemInsertType = Omit<
  PrescriptionSampleItem,
  keyof PrescriptionSampleItemRelationType | keyof Pick<PrescriptionSampleItem, 'id'>
>

export type PrescriptionSampleItemUpdateType = {
  [K in Exclude<
    keyof PrescriptionSampleItem,
    keyof PrescriptionSampleItemRelationType | keyof Pick<PrescriptionSampleItem, 'oid' | 'id'>
  >]: PrescriptionSampleItem[K] | (() => string)
}
