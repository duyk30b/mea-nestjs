import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity('TicketPaymentDetail')
@Index('IDX_TicketPaymentDetail__oid_ticketId', ['oid', 'ticketId'])
export default class TicketPaymentDetail {
  @Column()
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  ticketId: string

  @Column({ default: 0 })
  @Expose()
  paidWait: number // tiền thanh toán vào tiền chờ (ví)

  @Column({ default: 0 })
  @Expose()
  paidItem: number // tiền thanh toán vào Ticket

  @Column({ default: 0 })
  @Expose()
  paidSurcharge: number // tiền thanh toán vào phụ phí

  @Column({ default: 0 })
  @Expose()
  paidDiscount: number // tiền thanh toán vào chiết khấu // là số âm nhé

  @Column({ default: 0 })
  @Expose()
  debtItem: number // tiền nợ của Item

  @Column({ default: 0 })
  @Expose()
  debtSurcharge: number // tiền thanh toán vào phụ phí

  @Column({ default: 0 })
  @Expose()
  debtDiscount: number // tiền thanh toán vào chiết khấu // là số âm nhé

  static fromRaw(raw: { [P in keyof TicketPaymentDetail]: any }) {
    if (!raw) return null
    const entity = new TicketPaymentDetail()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof TicketPaymentDetail]: any }[]) {
    return raws.map((i) => TicketPaymentDetail.fromRaw(i))
  }
}

export type TicketPaymentDetailRelationType = {
  [P in keyof Pick<TicketPaymentDetail, never>]?: boolean
}

export type TicketPaymentDetailInsertType = Omit<TicketPaymentDetail, keyof TicketPaymentDetailRelationType>

export type TicketPaymentDetailUpdateType = {
  [K in Exclude<
    keyof TicketPaymentDetail,
    keyof TicketPaymentDetailRelationType | keyof Pick<TicketPaymentDetail, 'oid' | 'id'>
  >]: TicketPaymentDetail[K] | (() => string)
}

export type TicketPaymentDetailSortType = {
  [P in keyof Pick<TicketPaymentDetail, 'id' | 'ticketId'>]?:
  | 'ASC'
  | 'DESC'
}
