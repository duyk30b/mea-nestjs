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

    @Column({ type: 'character varying', length: 255, nullable: false })
    @Expose()
    email: string

    @Column({ type: 'smallint', default: 0 })
    @Expose()
    level: number

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Expose()
    organizationName: string

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
