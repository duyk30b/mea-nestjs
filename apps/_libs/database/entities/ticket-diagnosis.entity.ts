import { Expose } from 'class-transformer'
import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Image from './image.entity'

@Entity('TicketDiagnosis')
@Index('IDX_TicketDiagnosis__oid_ticketId', ['oid', 'ticketId'])
export default class TicketDiagnosis extends BaseEntity {
  @Column()
  @Expose({})
  ticketId: number

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

  static fromRaw(raw: { [P in keyof TicketDiagnosis]: any }) {
    if (!raw) return null
    const entity = new TicketDiagnosis()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof TicketDiagnosis]: any }[]) {
    return raws.map((i) => TicketDiagnosis.fromRaw(i))
  }
}

export type TicketDiagnosisRelationType = Pick<TicketDiagnosis, 'imageList'>

export type TicketDiagnosisSortType = Pick<TicketDiagnosis, 'oid' | 'id' | 'ticketId'>

export type TicketDiagnosisInsertType = Omit<
  TicketDiagnosis,
  keyof TicketDiagnosisRelationType | keyof Pick<TicketDiagnosis, 'id'>
>

export type TicketDiagnosisUpdateType = Omit<
  TicketDiagnosis,
  keyof TicketDiagnosisRelationType | keyof Pick<TicketDiagnosis, 'oid' | 'id'>
>
