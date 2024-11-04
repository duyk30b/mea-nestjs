import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Image from './image.entity'

@Entity('TicketDiagnosis')
@Index('IDX_TicketDiagnosis__oid_ticketId', ['oid', 'ticketId'])
export default class TicketDiagnosis extends BaseEntity {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column()
  @Expose({})
  ticketId: number

  @Column({ default: '' })
  @Expose({})
  reason: string // Lý do vào viện

  @Column({ type: 'text', default: '' })
  @Expose({})
  healthHistory: string // Tiền sử

  @Column({ type: 'text', default: JSON.stringify({}) })
  @Expose({})
  general: string // Khám tổng quát, toàn thân

  @Column({ type: 'text', default: JSON.stringify({}) })
  @Expose()
  regional: string // khám bộ phận

  @Column({ type: 'text', default: '' })
  @Expose({})
  summary: string // Tóm tăt bệnh án

  @Column({ type: 'text', default: JSON.stringify({}) })
  @Expose()
  special: string // khám đặc biệt, VD: đo thị lực

  @Column({ default: '' })
  @Expose({})
  diagnosis: string // Chẩn đoán

  @Column({ type: 'varchar', length: 100, default: JSON.stringify([]) })
  @Expose()
  imageIds: string

  @Column({ type: 'text', default: '' })
  @Expose({})
  advice: string // Lời dặn của bác sĩ

  @OneToOne(() => TicketDiagnosis, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ticketId', referencedColumnName: 'id' })
  @Expose()
  ticketDiagnosis: TicketDiagnosis

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

export type TicketDiagnosisRelationType = Pick<TicketDiagnosis, 'ticketDiagnosis' | 'imageList'>

export type TicketDiagnosisSortType = Pick<TicketDiagnosis, 'oid' | 'id' | 'ticketId'>

export type TicketDiagnosisInsertType = Omit<
  TicketDiagnosis,
  keyof TicketDiagnosisRelationType | keyof Pick<TicketDiagnosis, 'id'>
>

export type TicketDiagnosisUpdateType = Omit<
  TicketDiagnosis,
  keyof TicketDiagnosisRelationType | keyof Pick<TicketDiagnosis, 'oid' | 'id'>
>
