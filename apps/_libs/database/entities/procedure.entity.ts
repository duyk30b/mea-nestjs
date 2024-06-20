import { Expose } from 'class-transformer'
import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../common/base.entity'

@Entity('Procedure')
export default class Procedure extends BaseEntity {
  @Column({ type: 'character varying', length: 255 })
  @Expose()
  name: string // Tên dịch vụ

  @Column({ type: 'character varying', length: 255, nullable: true })
  @Expose()
  group: string // Nhóm dịch vụ ...

  @Column({ nullable: true })
  @Expose()
  price: number // Giá dự kiến

  @Column({ type: 'text', nullable: true })
  @Expose()
  consumableHint: string // Gợi ý vậy tư tiêu hao

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

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)
    entity.deletedAt = raw.deletedAt == null ? raw.deletedAt : Number(raw.deletedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Procedure]: any }[]) {
    return raws.map((i) => Procedure.fromRaw(i))
  }
}

export type ProcedureInsertType = Omit<Procedure, 'id' | 'updatedAt' | 'deletedAt'>

export type ProcedureUpdateType = Omit<Procedure, 'oid' | 'id' | 'updatedAt'>
