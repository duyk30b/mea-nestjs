import { Expose } from 'class-transformer'
import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { EGender } from '../common/variable'

@Entity('Customer')
export default class Customer extends BaseEntity {
    @Column({ type: 'character varying', length: 255 })
    @Expose()
    fullName: string

    @Column({ type: 'char', length: 10, nullable: true })
    @Expose()
    phone: string

    @Column({
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => (value == null ? value : Number(value)),
        },
    })
    @Expose()
    birthday: number

    @Column({ type: 'smallint', nullable: true })
    @Expose()
    gender: EGender

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Expose() // số căn cước
    identityCard: string

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Expose()
    addressProvince: string

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Expose()
    addressDistrict: string

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Expose()
    addressWard: string

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Expose()
    addressStreet: string

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Expose() // người thân
    relative: string

    @Column({ type: 'text', nullable: true })
    @Expose()
    healthHistory: string // Tiền sử bệnh

    @Column({
        type: 'bigint',
        default: 0,
        transformer: { to: (value) => value, from: (value) => Number(value) },
    })
    @Expose()
    debt: number // tiền nợ

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Expose()
    note: string // Ghi chú

    @Column({ type: 'smallint', default: 1 })
    @Expose()
    isActive: 0 | 1
}