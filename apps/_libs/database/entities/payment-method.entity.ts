import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Payment from './payment.entity'

@Entity('PaymentMethod')
export default class PaymentMethod {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column({ default: 1 })
  @Expose()
  priority: number

  @Column()
  @Expose()
  name: string

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isActive: 0 | 1

  @OneToMany(() => Payment, (payment) => payment.paymentMethod)
  @Expose()
  paymentList: Payment[]

  static fromRaw(raw: { [P in keyof PaymentMethod]: any }) {
    if (!raw) return null
    const entity = new PaymentMethod()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof PaymentMethod]: any }[]) {
    return raws.map((i) => PaymentMethod.fromRaw(i))
  }
}

export type PaymentMethodRelationType = {
  [P in keyof Pick<PaymentMethod, 'paymentList'>]?: boolean
}

export type PaymentMethodInsertType = Omit<
  PaymentMethod,
  keyof PaymentMethodRelationType | keyof Pick<PaymentMethod, 'id'>
>

export type PaymentMethodUpdateType = {
  [K in Exclude<
    keyof PaymentMethod,
    keyof PaymentMethodRelationType | keyof Pick<PaymentMethod, 'oid' | 'id'>
  >]: PaymentMethod[K] | (() => string)
}

export type PaymentMethodSortType = {
  [P in keyof Pick<PaymentMethod, 'oid' | 'id'>]?: 'ASC' | 'DESC'
}
