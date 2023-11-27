import { Expose } from 'class-transformer'
import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../common/base.entity'

@Entity('Procedure')
export default class Procedure extends BaseEntity {
    @Column()
    @Expose()
    name: string // Tên dịch vụ

    @Column({ nullable: true })
    @Expose()
    group: string // Nhóm dịch vụ ...

    @Column({ nullable: true })
    @Expose()
    price: number // Giá dự kiến

    @Column({ type: 'text', nullable: true })
    @Expose()
    consumableHint: string // Gợi ý vậy tư tiêu hao

    @Column({ type: 'boolean', default: true })
    @Expose()
    isActive: boolean
}
