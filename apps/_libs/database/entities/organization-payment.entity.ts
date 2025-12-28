import { Expose } from 'class-transformer'
import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('OrganizationPayment')
@Index('IDX_OrganizationPayment__oid', ['oid'])
export default class OrganizationPayment {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @Expose()
  oid: string

  @Column({ default: 0 })
  @Expose()
  payment: number // tổng tiền thanh toán

  @Column({ type: 'bigint' })
  @Expose()
  createdAt: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

  static fromRaw(raw: { [P in keyof OrganizationPayment]: any }) {
    if (!raw) return null
    const entity = new OrganizationPayment()
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

export type OrganizationPaymentInsertType = Omit<OrganizationPayment, keyof OrganizationPaymentRelationType | keyof Pick<OrganizationPayment, 'id'>>

export type OrganizationPaymentUpdateType = {
  [K in Exclude<keyof OrganizationPayment, keyof OrganizationPaymentRelationType | keyof Pick<OrganizationPayment, 'oid' | 'id'>>]:
  | OrganizationPayment[K]
  | (() => string)
}

export type OrganizationPaymentSortType = {
  [P in keyof Pick<OrganizationPayment, 'oid' | 'id' | 'createdAt'>]?: 'ASC' | 'DESC'
}
