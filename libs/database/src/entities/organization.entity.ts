import { Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity('Organization')
@Index('IDX_Organization__phone', ['phone'], { unique: true })
@Index('IDX_Organization__email', ['email'], { unique: true })
export default class Organization {
    @PrimaryGeneratedColumn()
    @Expose()
    id: number

    @Column({ type: 'char', length: 10, nullable: false })
    @Expose()
    phone: string

    @Column({ nullable: false })
    @Expose()
    email: string

    @Column({ type: 'smallint', default: 0 })
    @Expose()
    level: number

    @Column({ nullable: true })
    @Expose()
    organizationName: string

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
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => (value == null ? value : Number(value)),
        },
    })
    @Expose()
    createTime: number // Giờ vào khám
}
