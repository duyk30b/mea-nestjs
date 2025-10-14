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

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  gapDay: number

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  quantityRegular: number // Tổng số buổi setup ban đầu

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  quantityActual: number // Số buổi cần phải thanh toán

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  quantityUsed: number // Số buổi đã sử dụng

  @Column({ default: 0 })
  @Expose()
  moneyAmountRegular: number // Tổng tiền gốc

  @Column({ default: 0 })
  @Expose()
  moneyAmountSale: number // Tổng tiền sau chiết khấu

  @Column({ default: 0 })
  @Expose()
  moneyAmountActual: number // Tổng tiền cần phải thanh toán

  @Column({ default: 0 })
  @Expose()
  moneyAmountUsed: number // Tổng tiền đã sử dụng

  @Column({ default: 0 })
  @Expose()
  discountMoneyAmount: number // tiền giảm giá

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

  static fromRaw(raw: { [P in keyof TicketRegimenItem]: any }) {
    if (!raw) return null
    const entity = new TicketRegimenItem()
    Object.assign(entity, raw)

    entity.discountPercent = Number(raw.discountPercent)

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
