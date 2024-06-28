import { Expose } from 'class-transformer'
import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Image from './image.entity'

@Entity('VisitDiagnosis')
@Index('IDX_VisitDiagnosis__oid_visitId', ['oid', 'visitId'])
export default class VisitDiagnosis extends BaseEntity {
  @Column()
  @Expose({})
  visitId: number

  @Column({ default: '' })
  @Expose({})
  reason: string // Lý do vào viện

  @Column({ type: 'text', default: '' })
  @Expose({})
  healthHistory: string // Tiền sử

  @Column({ type: 'text', default: '' })
  @Expose({})
  summary: string // Tóm tăt bệnh án

  @Column({ default: '' })
  @Expose({})
  diagnosis: string // Chẩn đoán

  @Column({ type: 'text', default: JSON.stringify({}) })
  @Expose()
  vitalSigns: string

  @Column({ type: 'varchar', length: 100, default: JSON.stringify([]) })
  @Expose()
  imageIds: string

  @Column({ type: 'text', default: '' })
  @Expose({})
  advice: string // Lời dặn của bác sĩ

  @Expose()
  imageList: Image[]

  static fromRaw(raw: { [P in keyof VisitDiagnosis]: any }) {
    if (!raw) return null
    const entity = new VisitDiagnosis()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof VisitDiagnosis]: any }[]) {
    return raws.map((i) => VisitDiagnosis.fromRaw(i))
  }
}

export type VisitDiagnosisRelationType = Pick<VisitDiagnosis, 'imageList'>

export type VisitDiagnosisSortType = Pick<VisitDiagnosis, 'oid' | 'id' | 'visitId'>

export type VisitDiagnosisInsertType = Omit<
  VisitDiagnosis,
  keyof VisitDiagnosisRelationType | keyof Pick<VisitDiagnosis, 'id'>
>

export type VisitDiagnosisUpdateType = Omit<
  VisitDiagnosis,
  keyof VisitDiagnosisRelationType | keyof Pick<VisitDiagnosis, 'oid' | 'id'>
>
