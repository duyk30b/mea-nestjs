import { Expose } from 'class-transformer'
import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../common/base.entity'

@Entity('Distributor')
export default class Distributor extends BaseEntity {
    @Column()
    @Expose()
    fullName: string

    @Column({ type: 'char', length: 10, nullable: true })
    @Expose()
    phone: string

    @Column({ nullable: true })
    @Expose()
    addressProvince: string

    @Column({ nullable: true })
    @Expose()
    addressDistrict: string

    @Column({ nullable: true })
    @Expose()
    addressWard: string

    @Column({ nullable: true })
    @Expose()
    addressStreet: string

    @Column({
        type: 'bigint',
        default: 0,
        transformer: { to: (value) => value, from: (value) => Number(value) },
    })
    @Expose()
    debt: number // tiền nợ

    @Column({ nullable: true })
    @Expose()
    note: string // Ghi chú

    @Column({ type: 'boolean', default: true })
    @Expose()
    isActive: boolean
}
