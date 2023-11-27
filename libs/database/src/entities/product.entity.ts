import { Expose } from 'class-transformer'
import { Column, Entity, Index, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { UnitType } from '../common/variable'
import ProductBatch from './product-batch.entity'

@Entity('Product')
@Index('IDX_Product__oid_brandName', ['oid', 'brandName'])
@Index('IDX_Product__oid_substance', ['oid', 'substance'])
@Index('IDX_Product__oid_group', ['oid', 'group'])
@Index('IDX_Product__oid_isActive', ['oid', 'isActive'])
export default class Product extends BaseEntity {
    @Column()
    @Expose()
    brandName: string // Tên biệt dược

    @Column({ nullable: true })
    @Expose()
    substance: string // Hoạt chất

    @Column({ default: 0 })
    @Expose()
    quantity: number

    @Column({ nullable: true })
    @Expose()
    group: string // Nhóm thuốc: kháng sinh, dinh dưỡng ...

    @Column({ type: 'simple-json', default: '[]' })
    @Expose()
    unit: UnitType[] // Đơn vị tính: lọ, ống, vỉ

    @Column({ nullable: true })
    @Expose()
    route: string // Đường dùng: uống, tiêm, ...

    @Column({ nullable: true })
    @Expose()
    source: string // Nguồn gốc: ... Ấn Độ, Ý, Pháp, ...

    @Column({ nullable: true })
    @Expose()
    image: string

    @Column({ nullable: true })
    @Expose()
    hintUsage: string // Gợi ý cách sử dụng

    @Column({ type: 'boolean', default: true })
    @Expose()
    isActive: boolean

    @Expose()
    @OneToMany(() => ProductBatch, (productBatch) => productBatch.product)
    productBatches: ProductBatch[]
}
