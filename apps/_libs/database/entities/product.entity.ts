import { Expose } from 'class-transformer'
import { Column, Entity, Index, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import ProductBatch from './product-batch.entity'

@Entity('Product')
@Index('IDX_Product__oid_brandName', ['oid', 'brandName'])
@Index('IDX_Product__oid_substance', ['oid', 'substance'])
@Index('IDX_Product__oid_group', ['oid', 'group'])
export default class Product extends BaseEntity {
    @Column({ type: 'character varying', length: 255 })
    @Expose()
    brandName: string // Tên biệt dược

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Expose()
    substance: string // Hoạt chất

    @Column({ default: 0 })
    @Expose()
    quantity: number

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Expose()
    group: string // Nhóm thuốc: kháng sinh, dinh dưỡng ...

    @Column({ type: 'text', default: '[]' })
    @Expose()
    unit: string

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Expose()
    route: string // Đường dùng: uống, tiêm, ...

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Expose()
    source: string // Nguồn gốc: ... Ấn Độ, Ý, Pháp, ...

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Expose()
    image: string

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Expose()
    hintUsage: string // Gợi ý cách sử dụng

    @Column({ type: 'smallint', default: 1 })
    @Expose()
    isActive: 0 | 1

    @Expose()
    @OneToMany(() => ProductBatch, (productBatch) => productBatch.product)
    productBatches: ProductBatch[]
}
