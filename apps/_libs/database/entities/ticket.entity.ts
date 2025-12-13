import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryColumn } from 'typeorm'
import { DeliveryStatus, DiscountType } from '../common/variable'
import Appointment from './appointment.entity'
import CustomerSource from './customer-source.entity'
import Customer from './customer.entity'
import Image from './image.entity'
import Payment from './payment.entity'
import TicketAttribute from './ticket-attribute.entity'
import TicketBatch from './ticket-batch.entity'
import TicketExpense from './ticket-expense.entity'
import TicketLaboratoryGroup from './ticket-laboratory-group.entity'
import TicketLaboratoryResult from './ticket-laboratory-result.entity'
import TicketLaboratory from './ticket-laboratory.entity'
import TicketProcedure from './ticket-procedure.entity'
import TicketProduct from './ticket-product.entity'
import TicketRadiology from './ticket-radiology.entity'
import TicketReception from './ticket-reception.entity'
import TicketRegimenItem from './ticket-regimen-item.entity'
import TicketRegimen from './ticket-regimen.entity'
import TicketSurcharge from './ticket-surcharge.entity'
import TicketUser from './ticket-user.entity'

export enum TicketStatus {
  Schedule = 1,
  Draft = 2,
  Deposited = 3,
  Executing = 4,
  Debt = 5,
  Completed = 6,
  Cancelled = 7,
}

export const TicketStatusText = {
  [TicketStatus.Schedule]: 'Hẹn trước',
  [TicketStatus.Draft]: 'Nháp',
  [TicketStatus.Deposited]: 'Đặt chỗ',
  [TicketStatus.Executing]: 'Đang xử lý',
  [TicketStatus.Debt]: 'Đang nợ',
  [TicketStatus.Completed]: 'Hoàn thành',
  [TicketStatus.Cancelled]: 'Đã hủy',
}

@Entity('Ticket')
@Index('IDX_Ticket__oid_createdAt', ['oid', 'createdAt'])
@Index('IDX_Ticket__oid_receptionAt', ['oid', 'receptionAt'])
@Index('IDX_Ticket__oid_roomId', ['oid', 'roomId'])
@Index('IDX_Ticket__oid_customerId', ['oid', 'customerId'])
@Index('IDX_Ticket__oid_status', ['oid', 'status'])
export default class Ticket {
  @Column()
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Column()
  @Expose()
  customerId: number

  @Column({ default: 0 })
  @Expose()
  customerSourceId: number

  @Column({ default: 0 })
  @Expose()
  roomId: number

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  isPaymentEachItem: number

  @Column({ type: 'smallint', default: TicketStatus.Draft })
  @Expose()
  status: TicketStatus

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

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  dailyIndex: number

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
  itemsCostAmount: number // tổng tiền cost = tổng cost sản phẩm

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
    default: 0,
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  commissionMoney: number // Tổng tiền hoa hồng

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
  paid: number // tiền thanh toán vào Ticket

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  paidItem: number // tiền thanh toán vào Item

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  debt: number // tiền nợ của Ticket

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  debtItem: number // tiền nợ của Item

  @Column({ type: 'varchar', length: 100, default: JSON.stringify([]) })
  @Expose()
  imageDiagnosisIds: string

  @Column({
    type: 'bigint',
    nullable: true,
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
  receptionAt: number

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

  @Column({ type: 'varchar', length: 255, default: '' })
  @Expose()
  note: string // Tên dịch vụ

  // @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
  // @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  @Expose()
  customer: Customer

  @Expose()
  paymentList: Payment[]

  @Expose()
  ticketReceptionList: TicketReception[]

  @Expose()
  ticketAttributeList: TicketAttribute[]

  @Expose()
  ticketSurchargeList: TicketSurcharge[]

  @Expose()
  ticketExpenseList: TicketExpense[]

  @Expose()
  ticketProductList: TicketProduct[]

  @Expose()
  ticketBatchList: TicketBatch[]

  @Expose()
  ticketProcedureList: TicketProcedure[]

  @Expose()
  ticketRegimenList: TicketRegimen[]

  @Expose()
  ticketRegimenItemList: TicketRegimenItem[]

  @Expose()
  ticketLaboratoryGroupList: TicketLaboratoryGroup[]

  @Expose()
  ticketLaboratoryList: TicketLaboratory[]

  @Expose()
  ticketLaboratoryResultList: TicketLaboratoryResult[]

  @Expose()
  ticketRadiologyList: TicketRadiology[]

  @Expose()
  ticketUserList: TicketUser[]

  @Expose()
  imageList: Image[]

  @Expose()
  customerSource: CustomerSource

  @Expose()
  toAppointment: Appointment

  static fromRaw(raw: { [P in keyof Ticket]: any }) {
    if (!raw) return null
    const entity = new Ticket()
    Object.assign(entity, raw)

    entity.itemsCostAmount = Number(raw.itemsCostAmount)

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
    entity.paidItem = Number(raw.paidItem)
    entity.debtItem = Number(raw.debtItem)

    entity.surcharge = Number(raw.surcharge)
    entity.expense = Number(raw.expense)
    entity.commissionMoney = Number(raw.commissionMoney)

    entity.createdAt = raw.createdAt == null ? raw.createdAt : Number(raw.createdAt)
    entity.receptionAt = raw.receptionAt == null ? raw.receptionAt : Number(raw.receptionAt)
    entity.endedAt = raw.endedAt == null ? raw.endedAt : Number(raw.endedAt)

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
    | 'customer'
    | 'toAppointment'
    | 'ticketReceptionList'
    | 'ticketAttributeList'
    | 'ticketSurchargeList'
    | 'ticketExpenseList'
    | 'ticketProductList'
    | 'ticketBatchList'
    | 'ticketProcedureList'
    | 'ticketRegimenList'
    | 'ticketRegimenItemList'
    | 'ticketLaboratoryGroupList'
    | 'ticketLaboratoryList'
    | 'ticketLaboratoryResultList'
    | 'ticketRadiologyList'
    | 'ticketUserList'
    | 'imageList'
    | 'customerSource'
    | 'paymentList'
  >]?: boolean
}

export type TicketInsertType = Omit<
  Ticket,
  keyof TicketRelationType | keyof Pick<Ticket, 'id' | 'updatedAt'>
>

export type TicketUpdateType = {
  [K in Exclude<keyof Ticket, keyof TicketRelationType | keyof Pick<Ticket, 'oid' | 'id'>>]:
  | Ticket[K]
  | (() => string)
}

export type TicketSortType = {
  [P in keyof Pick<Ticket, 'id' | 'customerId' | 'createdAt' | 'receptionAt'>]?: 'ASC' | 'DESC'
}
