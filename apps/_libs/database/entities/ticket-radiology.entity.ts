import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType } from '../common/variable'
import Customer from './customer.entity'
import Image from './image.entity'
import Radiology from './radiology.entity'
import TicketUser from './ticket-user.entity'
import Ticket from './ticket.entity'

export enum TicketRadiologyStatus {
  Empty = 1,
  Pending = 2,
  Completed = 3,
}
@Entity('TicketRadiology')
@Index('IDX_TicketRadiology__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketRadiology__oid_radiologyId', ['oid', 'radiologyId'])
export default class TicketRadiology extends BaseEntity {
  @Column()
  @Expose()
  ticketId: number

  @Column()
  @Expose()
  customerId: number

  @Column()
  @Expose()
  radiologyId: number

  @Column({ type: 'smallint', default: TicketRadiologyStatus.Pending })
  @Expose()
  status: TicketRadiologyStatus

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
  @ManyToOne((type) => Ticket, (ticket) => ticket.ticketRadiologyList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ticketId', referencedColumnName: 'id' })
  ticket: Ticket

  @Expose()
  @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  customer: Customer

  @Expose()
  @ManyToOne((type) => Radiology, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'radiologyId', referencedColumnName: 'id' })
  radiology: Radiology

  @Expose()
  imageList: Image[]

  @Expose()
  ticketUserList: TicketUser[]

  static fromRaw(raw: { [P in keyof TicketRadiology]: any }) {
    if (!raw) return null
    const entity = new TicketRadiology()
    Object.assign(entity, raw)

    entity.expectedPrice = Number(raw.expectedPrice)
    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualPrice = Number(raw.actualPrice)

    entity.startedAt = raw.startedAt == null ? raw.startedAt : Number(raw.startedAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketRadiology]: any }[]) {
    return raws.map((i) => TicketRadiology.fromRaw(i))
  }
}

export type TicketRadiologyRelationType = {
  [P in keyof Pick<
    TicketRadiology,
    'ticket' | 'customer' | 'imageList' | 'ticketUserList'
  >]?: boolean
} & {
  [P in keyof Pick<TicketRadiology, 'radiology'>]?:
  | {
    [P in keyof Pick<Radiology, 'radiologyGroup' | 'printHtml'>]?: boolean
  }
  | false
}

export type TicketRadiologySortType = Pick<TicketRadiology, 'id' | 'ticketId' | 'radiologyId'>

export type TicketRadiologyInsertType = Omit<
  TicketRadiology,
  keyof TicketRadiologyRelationType | keyof Pick<TicketRadiology, 'id'>
>

export type TicketRadiologyInsertBasicType = Omit<
  TicketRadiology,
  | keyof TicketRadiologyRelationType
  | keyof Pick<TicketRadiology, 'id' | 'startedAt' | 'description' | 'result' | 'imageIds'>
>

export type TicketRadiologyUpdateType = Omit<
  TicketRadiology,
  keyof TicketRadiologyRelationType | keyof Pick<TicketRadiology, 'oid' | 'id'>
>
