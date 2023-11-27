import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { EGender, ERole } from '../common/variable'
import Organization from './organization.entity'

@Entity('User')
@Index('IDX_EMPLOYEE__OID_USERNAME', ['oid', 'username'], { unique: true })
export default class User extends BaseEntity {
    @Column({ type: 'char', length: 10, nullable: true })
    @Expose()
    phone: string

    @Column()
    @Expose()
    username: string

    @Column()
    @Exclude()
    password: string

    @Column({ nullable: true })
    @Exclude()
    secret: string

    @Column({ type: 'smallint', default: ERole.User })
    @Expose()
    role: ERole

    @Column({ nullable: true })
    @Expose()
    fullName: string

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

    @Column({ type: 'boolean', default: true })
    @Expose()
    isActive: boolean

    @ManyToOne((type) => Organization, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'oid', referencedColumnName: 'id' })
    @Expose()
    organization: Organization
}
