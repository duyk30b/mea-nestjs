import { Expose } from 'class-transformer'
import { Column, Entity, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { EGender } from '../common/variable'
import Payment from './payment.entity'

@Entity('Customer')
export default class Customer extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  @Expose()
  fullName: string

  @Column({ default: 0 })
  @Expose()
  customerSourceId: number

  @Column({ type: 'char', length: 10, nullable: true })
  @Expose()
  phone: string

  @Expose()
  @Column({ type: 'varchar', length: 255, default: '' })
  facebook: string

  @Expose()
  @Column({ type: 'varchar', length: 255, default: '' })
  zalo: string

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  birthday: number

  @Column({ type: 'smallint', nullable: true })
  @Expose()
  yearOfBirth: number

  @Column({ type: 'smallint', nullable: true })
  @Expose()
  gender: EGender

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  addressProvince: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  addressDistrict: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  addressWard: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  addressStreet: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose() // người thân
  relative: string

  @Column({ type: 'text', nullable: true })
  @Expose()
  healthHistory: string // Tiền sử bệnh

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  debt: number // tiền nợ

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isActive: 0 | 1

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
  deletedAt: number

  @OneToMany(() => Payment, (payment) => payment.customer)
  @Expose()
  paymentList: Payment[]

  static fromRaw(raw: { [P in keyof Customer]: any }) {
    if (!raw) return null
    const entity = new Customer()
    Object.assign(entity, raw)

    entity.birthday = raw.birthday == null ? raw.birthday : Number(raw.birthday)
    entity.debt = Number(raw.debt)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)
    entity.deletedAt = raw.deletedAt == null ? raw.deletedAt : Number(raw.deletedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Customer]: any }[]) {
    return raws.map((i) => Customer.fromRaw(i))
  }
}

export type CustomerRelationType = {
  [P in keyof Pick<Customer, 'paymentList'>]?: boolean
}

export type CustomerInsertType = Omit<
  Customer,
  keyof CustomerRelationType | keyof Pick<Customer, 'id' | 'updatedAt' | 'deletedAt'>
>

export type CustomerUpdateType = {
  [K in Exclude<
    keyof Customer,
    keyof CustomerRelationType | keyof Pick<Customer, 'oid' | 'id' | 'updatedAt'>
  >]: Customer[K] | (() => string)
}

export type CustomerSortType = {
  [P in keyof Pick<Customer, 'id' | 'debt' | 'fullName'>]?: 'ASC' | 'DESC'
}
