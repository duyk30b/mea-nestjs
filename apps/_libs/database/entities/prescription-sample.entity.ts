import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('PrescriptionSample')
export default class PrescriptionSample {
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
  medicines: string

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

export type PrescriptionSampleRelationType = Pick<PrescriptionSample, never>

export type PrescriptionSampleSortType = Pick<PrescriptionSample, 'oid' | 'id' | 'priority' | 'name'>

export type PrescriptionSampleInsertType = Omit<
  PrescriptionSample,
  keyof PrescriptionSampleRelationType | keyof Pick<PrescriptionSample, 'id'>
>

export type PrescriptionSampleUpdateType = Omit<
  PrescriptionSample,
  keyof PrescriptionSampleRelationType | keyof Pick<PrescriptionSample, 'oid' | 'id'>
>
