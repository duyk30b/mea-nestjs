import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DeliveryStatus, DiscountType, VoucherType } from '../common/variable'
import CustomerPayment from './customer-payment.entity'
import Customer from './customer.entity'
import TicketDiagnosis from './ticket-diagnosis.entity'
import TicketExpense from './ticket-expense.entity'
import TicketProcedure from './ticket-procedure.entity'
import TicketProduct from './ticket-product.entity'
import TicketRadiology from './ticket-radiology.entity'
import TicketSurcharge from './ticket-surcharge.entity'
import User from './user.entity'

export enum TicketStatus {
  Schedule = 1,
  Draft = 2,
  Approved = 3, // Prepayment
  Executing = 4,
  Debt = 5,
  Completed = 6,
  Cancelled = 7,
}

@Entity('Ticket')
@Index('IDX_Ticket__oid_registeredAt', ['oid', 'registeredAt'])
@Index('IDX_Ticket__oid_customerId', ['oid', 'customerId'])
@Index('IDX_Ticket__oid_ticketStatus', ['oid', 'ticketStatus'])
export default class Ticket extends BaseEntity {
  @Column()
  @Expose()
  customerId: number

  @Column({ default: 0 })
  @Expose()
  userId: number

  @Column({ type: 'smallint', default: VoucherType.Order })
  @Expose()
  voucherType: VoucherType

  @Column({ type: 'smallint', default: TicketStatus.Draft })
  @Expose()
  ticketStatus: TicketStatus

  @Column({ type: 'smallint', default: DeliveryStatus.NoStock })
  @Expose()
  deliveryStatus: DeliveryStatus

  @Column({ type: 'smallint', nullable: true })
  @Expose()
  year: number

  @Column({ type: 'smallint', nullable: true })
  @Expose()
  month: number // 01->12

  @Column({ type: 'smallint', nullable: true })
  @Expose()
  date: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  totalCostAmount: number // tổng tiền cost = tổng cost sản phẩm

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  proceduresMoney: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  productsMoney: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  radiologyMoney: number

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
    default: 0,
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  surcharge: number // Phụ phí

  @Column({
    default: 0,
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  totalMoney: number // Tổng tiền = itemsActualMoney + phụ phí - tiền giảm giá

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  }) // Chi phí (người bán trả): Ví dụ: chi phí ship người bán trả, chi phí thuê người trông, tiền vé xe ...
  @Expose() // Mục này sinh ra để tính lãi cho chính xác, nghĩa là để trừ cả các chi phí sinh ra khi tạo đơn
  expense: number // Mục này sẽ không hiện trong đơn hàng, khách hàng ko nhìn thấy

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  profit: number // tiền lãi = Tổng tiền - Tiền cost - Chi phí

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  paid: number // tiền đã thanh toán

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  debt: number // tiền nợ

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

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
  startedAt: number

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  endedAt: number

  @Column({
    type: 'bigint',
    default: () => '(EXTRACT(epoch FROM now()) * (1000))',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  updatedAt: number

  @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  @Expose()
  customer: Customer

  @ManyToOne((type) => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  @Expose()
  user: User

  @OneToMany(() => CustomerPayment, (customerPayment) => customerPayment.ticket)
  @Expose()
  customerPaymentList: CustomerPayment[]

  @OneToOne(() => TicketDiagnosis, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'id', referencedColumnName: 'ticketId' })
  @Expose()
  ticketDiagnosis: TicketDiagnosis

  @OneToMany(() => TicketProduct, (ticketProduct) => ticketProduct.ticket)
  @Expose()
  ticketProductList: TicketProduct[]

  @OneToMany(() => TicketProcedure, (ticketProcedure) => ticketProcedure.ticket)
  @Expose()
  ticketProcedureList: TicketProcedure[]

  @OneToMany(() => TicketRadiology, (ticketRadiology) => ticketRadiology.ticket)
  @Expose()
  ticketRadiologyList: TicketRadiology[]

  @Expose()
  @OneToMany(() => TicketExpense, (ticketExpense) => ticketExpense.ticket)
  ticketExpenseList: TicketExpense[]

  @Expose()
  @OneToMany(() => TicketSurcharge, (ticketSurcharge) => ticketSurcharge.ticket)
  ticketSurchargeList: TicketSurcharge[]

  static fromRaw(raw: { [P in keyof Ticket]: any }) {
    if (!raw) return null
    const entity = new Ticket()
    Object.assign(entity, raw)

    entity.totalCostAmount = Number(raw.totalCostAmount)

    entity.proceduresMoney = Number(raw.proceduresMoney)
    entity.productsMoney = Number(raw.productsMoney)
    entity.radiologyMoney = Number(raw.radiologyMoney)

    entity.discountMoney = Number(raw.discountMoney)
    entity.discountPercent = Number(raw.discountPercent)

    entity.totalMoney = Number(raw.totalMoney)
    entity.profit = Number(raw.profit)
    entity.paid = Number(raw.paid)
    entity.debt = Number(raw.debt)

    entity.surcharge = Number(raw.surcharge)
    entity.expense = Number(raw.expense)

    entity.registeredAt = raw.registeredAt == null ? raw.registeredAt : Number(raw.registeredAt)
    entity.startedAt = raw.startedAt == null ? raw.startedAt : Number(raw.startedAt)
    entity.endedAt = raw.endedAt == null ? raw.endedAt : Number(raw.endedAt)
    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Ticket]: any }[]) {
    return raws.map((i) => Ticket.fromRaw(i))
  }
}

export type TicketRelationType = Pick<
  Ticket,
  | 'customer'
  | 'user'
  | 'ticketDiagnosis'
  | 'ticketProductList'
  | 'ticketProcedureList'
  | 'ticketRadiologyList'
  | 'ticketExpenseList'
  | 'ticketSurchargeList'
  | 'customerPaymentList'
>

export type TicketSortType = Pick<Ticket, 'id' | 'customerId' | 'registeredAt'>

export type TicketInsertType = Omit<
  Ticket,
  keyof TicketRelationType | keyof Pick<Ticket, 'id' | 'updatedAt'>
>

export type TicketUpdateType = Omit<
  Ticket,
  keyof TicketRelationType | keyof Pick<Ticket, 'oid' | 'id'>
>
