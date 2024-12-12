import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType } from '../common/variable'
import Appointment from './appointment.entity'
import CustomerPayment from './customer-payment.entity'
import CustomerSource from './customer-source.entity'
import Customer from './customer.entity'
import Image from './image.entity'
import TicketAttribute from './ticket-attribute.entity'
import TicketExpense from './ticket-expense.entity'
import TicketLaboratory from './ticket-laboratory.entity'
import TicketProcedure from './ticket-procedure.entity'
import TicketProduct from './ticket-product.entity'
import TicketRadiology from './ticket-radiology.entity'
import TicketSurcharge from './ticket-surcharge.entity'
import TicketUser from './ticket-user.entity'

export enum TicketType {
  Order = 2,
  Clinic = 3,
  Spa = 4,
  Eye = 5,
  Obstetric = 6
}

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
  customerSourceId: number

  @Column({ type: 'smallint', default: TicketType.Order })
  @Expose()
  ticketType: TicketType

  @Column({ type: 'smallint', default: TicketStatus.Draft })
  @Expose()
  ticketStatus: TicketStatus

  @Column({ type: 'smallint', nullable: true })
  @Expose()
  year: number

  @Column({ type: 'smallint', nullable: true })
  @Expose()
  month: number // 01->12

  @Column({ type: 'smallint', nullable: true })
  @Expose()
  date: number

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  dailyIndex: number

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
  procedureMoney: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  productMoney: number

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
  laboratoryMoney: number

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  itemsDiscount: number // tiền giảm giá

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  itemsActualMoney: number // tiền sản phẩm

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

  @Column({ type: 'varchar', length: 100, default: JSON.stringify([]) })
  @Expose()
  imageIds: string

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

  @ManyToOne((type) => CustomerSource, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerSourceId', referencedColumnName: 'id' })
  @Expose()
  customerSource: CustomerSource

  @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  @Expose()
  customer: Customer

  @OneToMany(() => CustomerPayment, (customerPayment) => customerPayment.ticket)
  @Expose()
  customerPaymentList: CustomerPayment[]

  // @OneToOne(() => Appointment, { createForeignKeyConstraints: false })
  // @JoinColumn({ name: 'id', referencedColumnName: 'fromTicketId' }) // không JoinColumn trên cùng cột id được, vkl
  @Expose()
  toAppointment: Appointment

  @OneToMany(() => TicketAttribute, (ticketAttribute) => ticketAttribute.ticket)
  @Expose()
  ticketAttributeList: TicketAttribute[]

  @OneToMany(() => TicketProduct, (ticketProduct) => ticketProduct.ticket)
  @Expose()
  ticketProductList: TicketProduct[]

  @OneToMany(() => TicketProduct, (ticketProductConsumable) => ticketProductConsumable.ticket)
  @Expose()
  ticketProductConsumableList: TicketProduct[]

  @OneToMany(() => TicketProduct, (ticketProductPrescription) => ticketProductPrescription.ticket)
  @Expose()
  ticketProductPrescriptionList: TicketProduct[]

  @OneToMany(() => TicketProcedure, (ticketProcedure) => ticketProcedure.ticket)
  @Expose()
  ticketProcedureList: TicketProcedure[]

  @OneToMany(() => TicketLaboratory, (ticketLaboratory) => ticketLaboratory.ticket)
  @Expose()
  ticketLaboratoryList: TicketLaboratory[]

  @OneToMany(() => TicketRadiology, (ticketRadiology) => ticketRadiology.ticket)
  @Expose()
  ticketRadiologyList: TicketRadiology[]

  @Expose()
  @OneToMany(() => TicketExpense, (ticketExpense) => ticketExpense.ticket)
  ticketExpenseList: TicketExpense[]

  @Expose()
  @OneToMany(() => TicketSurcharge, (ticketSurcharge) => ticketSurcharge.ticket)
  ticketSurchargeList: TicketSurcharge[]

  @Expose()
  @OneToMany(() => TicketUser, (ticketUser) => ticketUser.ticket)
  ticketUserList: TicketUser[]

  @Expose()
  imageList: Image[]

  static fromRaw(raw: { [P in keyof Ticket]: any }) {
    if (!raw) return null
    const entity = new Ticket()
    Object.assign(entity, raw)

    entity.totalCostAmount = Number(raw.totalCostAmount)

    entity.procedureMoney = Number(raw.procedureMoney)
    entity.productMoney = Number(raw.productMoney)
    entity.radiologyMoney = Number(raw.radiologyMoney)
    entity.laboratoryMoney = Number(raw.laboratoryMoney)
    entity.itemsActualMoney = Number(raw.itemsActualMoney)
    entity.itemsDiscount = Number(raw.itemsDiscount)

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

export type TicketRelationType = {
  [P in keyof Pick<
    Ticket,
    | 'customer'
    | 'ticketAttributeList'
    | 'ticketExpenseList'
    | 'ticketSurchargeList'
    | 'customerPaymentList'
    | 'toAppointment'
    | 'customerSource'
    | 'imageList'
  >]?: boolean
} & {
  [P in keyof Pick<
    Ticket,
    'ticketProductList' | 'ticketProductConsumableList' | 'ticketProductPrescriptionList'
  >]?: { [P in keyof Pick<TicketProduct, 'product' | 'batch'>]?: boolean } | false
} & {
  [P in keyof Pick<Ticket, 'ticketProcedureList'>]?:
  | { [P in keyof Pick<TicketProcedure, 'procedure'>]?: boolean }
  | false
} & {
  [P in keyof Pick<Ticket, 'ticketRadiologyList'>]?:
  | { [P in keyof Pick<TicketRadiology, 'radiology'>]?: boolean }
  | false
} & {
  [P in keyof Pick<Ticket, 'ticketLaboratoryList'>]?:
  | { [P in keyof Pick<TicketLaboratory, 'laboratoryList'>]?: boolean }
  | false
} & {
  [P in keyof Pick<Ticket, 'ticketUserList'>]?:
  | { [P in keyof Pick<TicketUser, 'user'>]?: boolean }
  | false
}

export type TicketInsertType = Omit<
  Ticket,
  keyof TicketRelationType | keyof Pick<Ticket, 'id' | 'updatedAt'>
>

export type TicketUpdateType = {
  [K in Exclude<
    keyof Ticket,
    keyof TicketRelationType | keyof Pick<Ticket, 'oid' | 'id'>
  >]: Ticket[K] | (() => string)
}

export type TicketSortType = {
  [P in keyof Pick<Ticket, 'id' | 'customerId' | 'registeredAt'>]?: 'ASC' | 'DESC'
}
