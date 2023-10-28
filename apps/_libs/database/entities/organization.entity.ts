import { Expose } from 'class-transformer'
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import User from './user.entity'

@Entity('Organization')
@Index('IDX_Organization__phone', ['phone'], { unique: true })
@Index('IDX_Organization__email', ['email'], { unique: true })
export default class Organization {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column({ type: 'char', length: 10, nullable: false })
  phone: string

  @Expose()
  @Column({ type: 'character varying', length: 255, nullable: false })
  email: string

  @Expose()
  @Column({ type: 'smallint', default: 0 })
  level: number

  @Expose()
  @Column({ type: 'character varying', length: 255, nullable: true })
  name: string

  @Expose()
  @Column({ type: 'character varying', length: 255, nullable: true })
  addressProvince: string

  @Expose()
  @Column({ type: 'character varying', length: 255, nullable: true })
  addressDistrict: string

  @Expose()
  @Column({ type: 'character varying', length: 255, nullable: true })
  addressWard: string

  @Expose()
  @Column({ type: 'character varying', length: 255, nullable: true })
  addressStreet: string

  @Column({ type: 'text', default: '[]' })
  @Expose()
  permissionIds: string

  @Expose()
  @Column({
    type: 'bigint',
    default: () => '(EXTRACT(epoch FROM now()) * (1000))',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  createdAt: number

  @Expose()
  @Column({
    type: 'bigint',
    default: () => '(EXTRACT(epoch FROM now()) * (1000))',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  updatedAt: number

  @Expose()
  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  deletedAt: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isActive: 0 | 1

  @Expose()
  @OneToMany(() => User, (user) => user.organization)
  users: User[]
}

export type OrganizationInsertType = Omit<
  Organization,
  'id' | 'users' | 'createdAt' | 'updatedAt' | 'deletedAt'
>
export type OrganizationUpdateType = Omit<Organization, 'id' | 'users' | 'createdAt' | 'updatedAt'>
