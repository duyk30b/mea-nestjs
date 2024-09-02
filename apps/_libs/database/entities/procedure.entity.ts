import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { DiscountType } from '../common/variable'

export enum ProcedureType {
  Basic = 1,
  Regimen = 2, // Liệu trình
  Remedy = 3, // Bài thuốc
}

@Entity('Procedure')
export default class Procedure {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column({ type: 'character varying', length: 255 })
  @Expose()
  name: string // Tên dịch vụ

  @Column({ type: 'smallint', default: ProcedureType.Basic })
  @Expose()
  procedureType: ProcedureType

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  quantityDefault: number

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  gapHours: number

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  group: string // Nhóm dịch vụ ...

  @Column({ nullable: true })
  @Expose()
  price: number // Giá mặc định

  @Column({ default: 0 })
  @Expose()
  discountMoney: number // tiền giảm giá mặc định

  @Column({ default: 0 })
  @Expose()
  discountPercent: number // tiền giảm giá mặc định

  @Column({ type: 'varchar', length: 25, default: DiscountType.VND })
  @Expose()
  discountType: DiscountType // tiền giảm giá mặc định

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  discountStart: number

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  discountEnd: number

  @Column({ default: 0 })
  @Expose()
  saleBolusMoney: number // thưởng chốt sale

  @Column({ default: 0 })
  @Expose()
  saleBolusPercent: number // thưởng chốt sale

  @Column({ type: 'varchar', length: 25, default: DiscountType.VND })
  @Expose()
  saleBolusType: DiscountType // thưởng chốt sale

  @Column({ default: 0 })
  @Expose()
  primaryBolusMoney: number // thưởng thợ chính

  @Column({ default: 0 })
  @Expose()
  primaryBolusPercent: number // thưởng thợ chính

  @Column({ type: 'varchar', length: 25, default: DiscountType.VND })
  @Expose()
  primaryBolusType: DiscountType // thưởng thợ chính

  @Column({ default: 0 })
  @Expose()
  secondaryBolusMoney: number // thưởng thợ phụ

  @Column({ default: 0 })
  @Expose()
  secondaryBolusPercent: number // thưởng thợ phụ

  @Column({ type: 'varchar', length: 25, default: DiscountType.VND })
  @Expose()
  secondaryBolusType: DiscountType // thưởng thợ phụ

  @Column({ type: 'text', default: JSON.stringify([]) })
  @Expose()
  consumablesHint: string

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

  static fromRaw(raw: { [P in keyof Procedure]: any }) {
    if (!raw) return null
    const entity = new Procedure()
    Object.assign(entity, raw)

    entity.price = Number(raw.price)

    entity.discountStart = raw.discountStart == null ? raw.discountStart : Number(raw.discountStart)
    entity.discountEnd = raw.discountEnd == null ? raw.discountEnd : Number(raw.discountEnd)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)
    entity.deletedAt = raw.deletedAt == null ? raw.deletedAt : Number(raw.deletedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Procedure]: any }[]) {
    return raws.map((i) => Procedure.fromRaw(i))
  }
}

export type ProcedureRelationType = Pick<Procedure, never>

export type ProcedureSortType = Pick<Procedure, 'oid' | 'id' | 'name' | 'price'>

export type ProcedureInsertType = Omit<
  Procedure,
  keyof ProcedureRelationType | keyof Pick<Procedure, 'id' | 'updatedAt' | 'deletedAt'>
>

export type ProcedureUpdateType = Omit<
  Procedure,
  keyof ProcedureRelationType | keyof Pick<Procedure, 'oid' | 'id' | 'updatedAt'>
>
