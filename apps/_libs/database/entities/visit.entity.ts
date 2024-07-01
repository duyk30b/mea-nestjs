import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType } from '../common/variable'
import CustomerPayment from './customer-payment.entity'
import Customer from './customer.entity'
import VisitDiagnosis from './visit-diagnosis.entity'
import VisitExpense from './visit-expense.entity'
import VisitProcedure from './visit-procedure.entity'
import VisitProduct from './visit-product.entity'
import VisitRadiology from './visit-radiology.entity'
import VisitSurcharge from './visit-surcharge.entity'

export enum VisitType {
  Store = 1, // Bán hàng
  Clinic = 2, // Phòng khám
}

export enum VisitStatus {
  Draft = 1, // Hẹn khám
  Waiting = 2, // Đợi khám
  InProgress = 3, // Đang khám,
  Debt = 4, // Nợ
  Completed = 5,
  Cancel = 6,
}

@Entity('Visit')
@Index('IDX_Visit__oid_registeredAt', ['oid', 'registeredAt'])
@Index('IDX_Visit__oid_customerId', ['oid', 'customerId'])
@Index('IDX_Visit__oid_visitStatus', ['oid', 'visitStatus'])
export default class Visit extends BaseEntity {
  @Column()
  @Expose()
  customerId: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  visitType: VisitType

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  visitStatus: VisitStatus

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
  isSent: number

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
    precision: 5,
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
    type: 'bigint',
    default: 0,
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
  @Expose()
  customer: Customer

  @OneToMany(() => CustomerPayment, (customerPayment) => customerPayment.visit)
  @Expose()
  customerPaymentList: CustomerPayment[]

  @OneToOne(() => VisitDiagnosis, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'id', referencedColumnName: 'visitId' })
  @Expose()
  visitDiagnosis: VisitDiagnosis

  @OneToMany(() => VisitProduct, (visitProduct) => visitProduct.visit)
  @Expose()
  visitProductList: VisitProduct[]

  @OneToMany(() => VisitProcedure, (visitProcedure) => visitProcedure.visit)
  @Expose()
  visitProcedureList: VisitProcedure[]

  @OneToMany(() => VisitRadiology, (visitRadiology) => visitRadiology.visit)
  @Expose()
  visitRadiologyList: VisitRadiology[]

  @Expose()
  @OneToMany(() => VisitExpense, (visitExpense) => visitExpense.visit)
  visitExpenseList: VisitExpense[]

  @Expose()
  @OneToMany(() => VisitSurcharge, (visitSurcharge) => visitSurcharge.visit)
  visitSurchargeList: VisitSurcharge[]

  static fromRaw(raw: { [P in keyof Visit]: any }) {
    if (!raw) return null
    const entity = new Visit()
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

  static fromRaws(raws: { [P in keyof Visit]: any }[]) {
    return raws.map((i) => Visit.fromRaw(i))
  }
}

export type VisitRelationType = Pick<
  Visit,
  | 'customer'
  | 'visitDiagnosis'
  | 'visitProductList'
  | 'visitProcedureList'
  | 'visitRadiologyList'
  | 'visitExpenseList'
  | 'visitSurchargeList'
  | 'customerPaymentList'
>

export type VisitSortType = Pick<Visit, 'id' | 'customerId' | 'registeredAt'>

export type VisitInsertType = Omit<
  Visit,
  keyof VisitRelationType | keyof Pick<Visit, 'id' | 'updatedAt'>
>

export type VisitUpdateType = Omit<Visit, keyof VisitRelationType | keyof Pick<Visit, 'oid' | 'id'>>
