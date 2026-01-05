import { Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity('OrganizationPayment')
@Index('IDX_OrganizationPayment__oid', ['oid'])
export default class OrganizationPayment {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @Expose()
  oid: number

  @Column({ default: 0 })
  @Expose()
  money: number // tổng tiền thanh toán

  @Column({
    type: 'bigint',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  createdAt: number

  @Column({
    type: 'bigint',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  expiryAt: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

  static fromRaw(raw: { [P in keyof OrganizationPayment]: any }) {
    if (!raw) return null
    const entity = new OrganizationPayment()
    entity.createdAt = Number(raw.createdAt)
    entity.expiryAt = Number(raw.expiryAt)
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof OrganizationPayment]: any }[]) {
    return raws.map((i) => OrganizationPayment.fromRaw(i))
  }
}

export type OrganizationPaymentRelationType = {
  [P in keyof Pick<OrganizationPayment, never>]?: boolean
}

export type OrganizationPaymentInsertType = Omit<
  OrganizationPayment,
  keyof OrganizationPaymentRelationType | keyof Pick<OrganizationPayment, 'id'>
>

export type OrganizationPaymentUpdateType = {
  [K in Exclude<
    keyof OrganizationPayment,
    keyof OrganizationPaymentRelationType | keyof Pick<OrganizationPayment, 'oid' | 'id'>
  >]: OrganizationPayment[K] | (() => string)
}

export type OrganizationPaymentSortType = {
  [P in keyof Pick<OrganizationPayment, 'oid' | 'id' | 'createdAt'>]?: 'ASC' | 'DESC'
}
