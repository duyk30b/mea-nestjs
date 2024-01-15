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

    @Column({ type: 'character varying', length: 255 })
    @Expose()
    username: string

    @Column({ type: 'character varying', length: 255 })
    @Exclude()
    password: string

    @Column({ type: 'character varying', length: 255, nullable: true })
    @Exclude()
    secret: string

    @Column({ type: 'smallint', default: ERole.User })
    @Expose()
    role: ERole

    @Column({ type: 'character varying', length: 255, nullable: true })
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

    @Column({ type: 'smallint', default: 1 })
    @Expose()
    isActive: 0 | 1

    @Column({
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => (value == null ? value : Number(value)),
        },
    })
    @Expose()
    createdAt: number

    @Column({
        type: 'bigint',
        nullable: true,
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

    @ManyToOne((type) => Organization, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'oid', referencedColumnName: 'id' })
    @Expose()
    organization: Organization
}
