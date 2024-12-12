import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import CustomerSource from './customer-source.entity'
import Customer from './customer.entity'

export enum AppointmentStatus {
  Waiting = 1, // Đợi - Nhắc khám
  Confirm = 2, // Xác nhận
  Completed = 3, // Hoàn thành
  Cancelled = 4, // Hủy
}

@Entity('Appointment')
@Index('IDX_Appointment__fromTicketId', ['fromTicketId'])
export default class Appointment extends BaseEntity {
  @Column()
  @Expose()
  customerId: number

  @Column({ default: 0 })
  @Expose()
  customerSourceId: number

  @Column({ type: 'varchar', length: 255, default: '' })
  @Expose()
  reason: string // Lý do hẹn

  @Column({
    type: 'bigint',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  registeredAt: number

  @Column({ default: 0 })
  @Expose()
  fromTicketId: number

  @Column({ default: 0 })
  @Expose()
  toTicketId: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  cancelReason: string // Lý do hẹn

  @Column({ type: 'smallint', default: AppointmentStatus.Waiting })
  @Expose()
  appointmentStatus: AppointmentStatus

  @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  @Expose()
  customer: Customer

  @ManyToOne((type) => CustomerSource, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerSourceId', referencedColumnName: 'id' })
  @Expose()
  customerSource: CustomerSource

  static fromRaw(raw: { [P in keyof Appointment]: any }) {
    if (!raw) return null
    const entity = new Appointment()
    Object.assign(entity, raw)

    entity.registeredAt = raw.registeredAt == null ? raw.registeredAt : Number(raw.registeredAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Appointment]: any }[]) {
    return raws.map((i) => Appointment.fromRaw(i))
  }
}

export type AppointmentRelationType = {
  [P in keyof Pick<Appointment, 'customer' | 'customerSource'>]?: boolean
}

export type AppointmentInsertType = Omit<
  Appointment,
  keyof AppointmentRelationType | keyof Pick<Appointment, 'id'>
>

export type AppointmentUpdateType = {
  [K in Exclude<
    keyof Appointment,
    keyof AppointmentRelationType | keyof Pick<Appointment, 'oid' | 'id'>
  >]: Appointment[K] | (() => string)
}

export type AppointmentSortType = {
  [P in keyof Pick<Appointment, 'oid' | 'id' | 'registeredAt'>]?: 'ASC' | 'DESC'
}
