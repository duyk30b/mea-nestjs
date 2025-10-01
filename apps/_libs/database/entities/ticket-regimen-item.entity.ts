import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryColumn } from 'typeorm'
import { DiscountType } from '../common/variable'

@Entity('TicketRegimenItem')
@Index('IDX_TicketRegimenItem__oid_ticketId', ['oid', 'ticketId'])
export default class TicketRegimenItem {
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

  @Column()
  @Expose()
  procedureId: number

  @Column({ type: 'bigint' })
  @Expose()
  ticketRegimenId: string

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  quantityPayment: number

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  quantityExpected: number

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  quantityFinish: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  gapDay: number

  @Column({ default: 0 })
  @Expose()
  expectedMoneyAmount: number // Giá dự kiến

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
  discountMoneyAmount: number // Giá thực tế

  @Column({ default: 0 })
  @Expose()
  actualMoneyAmount: number // Giá thực tế

  @Column({ default: 0 })
  @Expose()
  paymentMoneyAmount: number // Giá thực tế

  static fromRaw(raw: { [P in keyof TicketRegimenItem]: any }) {
    if (!raw) return null
    const entity = new TicketRegimenItem()
    Object.assign(entity, raw)

    entity.expectedMoneyAmount = Number(raw.expectedMoneyAmount)
    entity.discountPercent = Number(raw.discountPercent)
    entity.actualMoneyAmount = Number(raw.actualMoneyAmount)
    entity.paymentMoneyAmount = Number(raw.paymentMoneyAmount)

    return entity
  }

  static fromRaws(raws: { [P in keyof TicketRegimenItem]: any }[]) {
    return raws.map((i) => TicketRegimenItem.fromRaw(i))
  }
}

export type TicketRegimenItemRelationType = {
  [P in keyof Pick<TicketRegimenItem, never>]?: boolean
}

export type TicketRegimenItemInsertType = Omit<
  TicketRegimenItem,
  keyof TicketRegimenItemRelationType
>

export type TicketRegimenItemUpdateType = {
  [K in Exclude<
    keyof TicketRegimenItem,
    keyof TicketRegimenItemRelationType | keyof Pick<TicketRegimenItem, 'oid' | 'id'>
  >]?: TicketRegimenItem[K] | (() => string)
}

export type TicketRegimenItemSortType = {
  [P in keyof Pick<
    TicketRegimenItem,
    'id' | 'customerId' | 'ticketId' | 'regimenId' | 'ticketRegimenId'
  >]?: 'ASC' | 'DESC'
}
