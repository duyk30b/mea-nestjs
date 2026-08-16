import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryColumn } from 'typeorm'
import { PurchaseOrderActionType } from '../common/variable'
import Payment from './payment.entity'
import PurchaseOrder from './purchase-order.entity'

@Entity('PaymentPurchaseOrder')
@Index('IDX_PaymentPurchaseOrder__oid_paymentId', ['oid', 'paymentId'])
@Index('IDX_PaymentPurchaseOrder__oid_purchaseOrderId', ['oid', 'purchaseOrderId'])
export default class PaymentPurchaseOrder {
  @Column()
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Column({ type: 'bigint' })
  @Expose()
  paymentId: string

  @Column({ type: 'bigint', default: 0 })
  @Expose()
  purchaseOrderId: string

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  purchaseOrderActionType: PurchaseOrderActionType

  @Column({ default: 0 })
  @Expose()
  paidMoney: number

  @Column({ default: 0 })
  @Expose()
  debtMoney: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  createdAt: number

  @Expose()
  payment: Payment

  @Expose()
  purchaseOrder: PurchaseOrder

  static fromRaw(raw: { [P in keyof PaymentPurchaseOrder]: any }) {
    if (!raw) return null
    const entity = new PaymentPurchaseOrder()
    Object.assign(entity, raw)

    entity.paidMoney = Number(raw.paidMoney)
    entity.debtMoney = Number(raw.debtMoney)

    entity.createdAt = Number(raw.createdAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof PaymentPurchaseOrder]: any }[]) {
    return raws.map((i) => PaymentPurchaseOrder.fromRaw(i))
  }
}

export type PaymentPurchaseOrderRelationType = {
  [P in keyof Pick<PaymentPurchaseOrder, 'payment' | 'purchaseOrder'>]?: boolean
}

export type PaymentPurchaseOrderInsertType = Omit<
  PaymentPurchaseOrder,
  keyof PaymentPurchaseOrderRelationType | keyof Pick<PaymentPurchaseOrder, 'id'>
>

export type PaymentPurchaseOrderUpdateType = {
  [K in Exclude<
    keyof PaymentPurchaseOrder,
    keyof PaymentPurchaseOrderRelationType | keyof Pick<PaymentPurchaseOrder, 'oid' | 'id'>
  >]: PaymentPurchaseOrder[K] | (() => string)
}

export type PaymentPurchaseOrderSortType = {
  [P in keyof Pick<PaymentPurchaseOrder, 'oid' | 'id'>]?: 'ASC' | 'DESC'
}
