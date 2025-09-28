import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryColumn } from 'typeorm'
import { DiscountType, TicketRegimenStatus } from '../common/variable'
import Customer from './customer.entity'
import Regimen from './regimen.entity'
import TicketProcedure from './ticket-procedure.entity'
import TicketRegimenItem from './ticket-regimen-item.entity'
import TicketUser from './ticket-user.entity'
import Ticket from './ticket.entity'

@Entity('TicketRegimen')
@Index('IDX_TicketRegimen__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketRegimen__oid_customerId', ['oid', 'customerId'])
@Index('IDX_TicketRegimen__oid_regimenId', ['oid', 'regimenId'])
export default class TicketRegimen {
  @Column()
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Column({ type: 'bigint' })
  @Expose()
  ticketId: string

  @Column()
  @Expose()
  customerId: number

  @Column()
  @Expose()
  regimenId: number

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  isPaymentEachSession: number

  @Column({ type: 'smallint', default: TicketRegimenStatus.Pending })
  @Expose()
  status: TicketRegimenStatus

  @Column({ default: 0 })
  @Expose()
  costAmount: number // Tiền hoa hồng'

  @Column({ default: 0 })
  @Expose()
  commissionAmount: number // Tiền hoa hồng

  @Column({ default: 0 })
  @Expose()
  expectedPrice: number // Giá dự kiến

  @Column({ type: 'varchar', length: 25, default: DiscountType.VND })
  @Expose()
  discountType: DiscountType // Loại giảm giá

  @Column({
    type: 'decimal',
    default: 0,
    precision: 7,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  discountPercent: number // % giảm giá

  @Column({ default: 0 })
  @Expose()
  discountMoney: number // tiền giảm giá

  @Column({ default: 0 })
  @Expose()
  actualPrice: number // Giá thực tế

  @Column({
    type: 'bigint',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  createdAt: number

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
  ticketUserRequestList: TicketUser[]

  @Expose()
  ticketRegimenItemList: TicketRegimenItem[]

  @Expose()
  ticketProcedureList: TicketProcedure[]

  static fromRaw(raw: { [P in keyof TicketRegimen]: any }) {
    if (!raw) return null
    const entity = new TicketRegimen()
    Object.assign(entity, raw)

    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    entity.createdAt = Number(raw.createdAt)
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
    | 'regimen'
    | 'customer'
    | 'ticketRegimenItemList'
    | 'ticketProcedureList'
    | 'ticketUserRequestList'
  >]?: boolean
}

export type TicketRegimenInsertType = Omit<TicketRegimen, keyof TicketRegimenRelationType>

export type TicketRegimenUpdateType = {
  [K in Exclude<
    keyof TicketRegimen,
    keyof TicketRegimenRelationType | keyof Pick<TicketRegimen, 'oid' | 'id'>
  >]?: TicketRegimen[K] | (() => string)
}

export type TicketRegimenSortType = {
  [P in keyof Pick<TicketRegimen, 'id' | 'customerId' | 'ticketId' | 'regimenId' | 'status'>]?:
  | 'ASC'
  | 'DESC'
}
