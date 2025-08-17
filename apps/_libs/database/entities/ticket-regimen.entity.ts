import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { PaymentMoneyStatus, TicketRegimenStatus } from '../common/variable'
import Customer from './customer.entity'
import Regimen from './regimen.entity'
import TicketRegimenItem from './ticket-regimen-item.entity'
import Ticket from './ticket.entity'

@Entity('TicketRegimen')
@Index('IDX_TicketRegimen__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketRegimen__oid_registeredAt', ['oid', 'registeredAt'])
export default class TicketRegimen {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column()
  @Expose()
  ticketId: number

  @Column()
  @Expose()
  customerId: number

  @Column()
  @Expose()
  regimenId: number

  @Column({ type: 'smallint', default: TicketRegimenStatus.Pending })
  @Expose()
  status: TicketRegimenStatus

  @Column({ type: 'smallint', default: PaymentMoneyStatus.NoEffect })
  @Expose()
  paymentMoneyStatus: PaymentMoneyStatus

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  registeredAt: number

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  completedAt: number

  @Expose()
  ticket: Ticket

  @Expose()
  customer: Customer

  @Expose()
  regimen: Regimen

  @Expose()
  ticketRegimenItemList: TicketRegimenItem[]

  static fromRaw(raw: { [P in keyof TicketRegimen]: any }) {
    if (!raw) return null
    const entity = new TicketRegimen()
    Object.assign(entity, raw)

    entity.registeredAt = raw.registeredAt == null ? raw.registeredAt : Number(raw.registeredAt)
    entity.completedAt = raw.completedAt == null ? raw.completedAt : Number(raw.completedAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketRegimen]: any }[]) {
    return raws.map((i) => TicketRegimen.fromRaw(i))
  }
}

export type TicketRegimenRelationType = {
  [P in keyof Pick<
    TicketRegimen,
    | 'ticket'
    | 'customer'
    | 'regimen'
    | 'ticketRegimenItemList'
  >]?: boolean
}

export type TicketRegimenInsertType = Omit<
  TicketRegimen,
  keyof TicketRegimenRelationType | keyof Pick<TicketRegimen, 'id'>
>

export type TicketRegimenUpdateType = {
  [K in Exclude<
    keyof TicketRegimen,
    keyof TicketRegimenRelationType | keyof Pick<TicketRegimen, 'oid' | 'id'>
  >]: TicketRegimen[K] | (() => string)
}

export type TicketRegimenSortType = {
  [P in keyof Pick<
    TicketRegimen,
    'id' | 'ticketId' | 'customerId' | 'status' | 'regimenId' | 'registeredAt' | 'completedAt'
  >]?: 'ASC' | 'DESC'
}
