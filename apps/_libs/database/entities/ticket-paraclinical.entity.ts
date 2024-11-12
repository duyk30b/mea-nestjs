import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType } from '../common/variable'
import Customer from './customer.entity'
import Image from './image.entity'
import Paraclinical from './paraclinical.entity'
import TicketUser from './ticket-user.entity'
import Ticket from './ticket.entity'

export enum TicketParaclinicalStatus {
  Empty = 1,
  Pending = 2,
  Completed = 3,
}
@Entity('TicketParaclinical')
@Index('IDX_TicketParaclinical__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketParaclinical__oid_paraclinicalId', ['oid', 'paraclinicalId'])
export default class TicketParaclinical extends BaseEntity {
  @Column()
  @Expose()
  ticketId: number

  @Column()
  @Expose()
  customerId: number

  @Column()
  @Expose()
  paraclinicalId: number

  @Column({ type: 'smallint', default: TicketParaclinicalStatus.Pending })
  @Expose()
  status: TicketParaclinicalStatus

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  expectedPrice: number // Giá dự kiến

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  discountMoney: number // tiền giảm giá

  @Column({
    type: 'decimal',
    default: 0,
    precision: 7,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  discountPercent: number // % giảm giá

  @Column({ type: 'varchar', length: 25, default: DiscountType.VND })
  @Expose()
  discountType: DiscountType // Loại giảm giá

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  actualPrice: number // Giá thực tế

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  startedAt: number

  @Column({ type: 'text', default: '' })
  @Expose({})
  description: string // Mô tả

  @Column({ type: 'text', default: '' })
  @Expose({})
  result: string // Kết luận

  @Column({ type: 'varchar', length: 100, default: JSON.stringify([]) })
  @Expose()
  imageIds: string

  @Expose()
  @ManyToOne((type) => Ticket, (ticket) => ticket.ticketParaclinicalList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ticketId', referencedColumnName: 'id' })
  ticket: Ticket

  @Expose()
  @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  customer: Customer

  @Expose()
  @ManyToOne((type) => Paraclinical, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'paraclinicalId', referencedColumnName: 'id' })
  paraclinical: Paraclinical

  @Expose()
  imageList: Image[]

  @Expose()
  ticketUserList: TicketUser[]

  static fromRaw(raw: { [P in keyof TicketParaclinical]: any }) {
    if (!raw) return null
    const entity = new TicketParaclinical()
    Object.assign(entity, raw)

    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    entity.startedAt = raw.startedAt == null ? raw.startedAt : Number(raw.startedAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketParaclinical]: any }[]) {
    return raws.map((i) => TicketParaclinical.fromRaw(i))
  }
}

export type TicketParaclinicalRelationType = {
  [P in keyof Pick<
    TicketParaclinical,
    'ticket' | 'customer' | 'imageList' | 'ticketUserList'
  >]?: boolean
} & {
  [P in keyof Pick<TicketParaclinical, 'paraclinical'>]?:
  | {
    [P in keyof Pick<
      Paraclinical,
      'paraclinicalAttributeList' | 'paraclinicalGroup' | 'printHtml'
    >]?: boolean
  }
  | false
}

export type TicketParaclinicalSortType = Pick<
  TicketParaclinical,
  'id' | 'ticketId' | 'paraclinicalId'
>

export type TicketParaclinicalInsertType = Omit<
  TicketParaclinical,
  keyof TicketParaclinicalRelationType | keyof Pick<TicketParaclinical, 'id'>
>

export type TicketParaclinicalInsertBasicType = Omit<
  TicketParaclinical,
  | keyof TicketParaclinicalRelationType
  | keyof Pick<TicketParaclinical, 'id' | 'startedAt' | 'description' | 'result' | 'imageIds'>
>

export type TicketParaclinicalUpdateType = Omit<
  TicketParaclinical,
  keyof TicketParaclinicalRelationType | keyof Pick<TicketParaclinical, 'oid' | 'id'>
>
