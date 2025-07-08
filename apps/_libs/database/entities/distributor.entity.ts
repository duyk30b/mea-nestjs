import { Expose } from 'class-transformer'
import { Column, Entity, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Payment from './payment.entity'

@Entity('Distributor')
export default class Distributor extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  @Expose()
  fullName: string

  @Column({ type: 'char', length: 10, nullable: true })
  @Expose()
  phone: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  addressProvince: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  addressWard: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  addressStreet: string

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

  @OneToMany(() => Payment, (payment) => payment.distributor)
  @Expose()
  paymentList: Payment[]

  static fromRaw(raw: { [P in keyof Distributor]: any }) {
    if (!raw) return null
    const entity = new Distributor()
    Object.assign(entity, raw)

    entity.debt = Number(raw.debt)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)
    entity.deletedAt = raw.deletedAt == null ? raw.deletedAt : Number(raw.deletedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Distributor]: any }[]) {
    return raws.map((i) => Distributor.fromRaw(i))
  }
}

export type DistributorRelationType = {
  [P in keyof Pick<Distributor, 'paymentList'>]?: boolean
}

export type DistributorInsertType = Omit<
  Distributor,
  keyof DistributorRelationType | keyof Pick<Distributor, 'id' | 'updatedAt' | 'deletedAt'>
>

export type DistributorUpdateType = {
  [K in Exclude<
    keyof Distributor,
    keyof DistributorRelationType | keyof Pick<Distributor, 'oid' | 'id' | 'updatedAt'>
  >]: Distributor[K] | (() => string)
}

export type DistributorSortType = {
  [P in keyof Pick<Distributor, 'id' | 'debt' | 'fullName'>]?: 'ASC' | 'DESC'
}
