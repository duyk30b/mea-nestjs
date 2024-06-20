import { Expose } from 'class-transformer'
import { Column, Entity, Index, OneToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Visit from './visit.entity'

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

  @Column({ type: 'text', default: '' })
  @Expose({})
  advice: string // Lời dặn của bác sĩ

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

export type VisitDiagnosisInsertType = Omit<VisitDiagnosis, 'id'>

export type VisitDiagnosisUpdateType = Omit<VisitDiagnosis, 'oid' | 'id'>
