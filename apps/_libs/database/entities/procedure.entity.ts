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
  createdAt: number

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
}
