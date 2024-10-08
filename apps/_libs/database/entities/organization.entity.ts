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
  @Column({ type: 'character varying', length: 255, nullable: true })
  email: string

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  emailVerify: 0 | 1

  @Expose()
  @Column({ type: 'smallint', default: 1 })
  dataVersion: number

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
  userList: User[]

  static fromRaw(raw: { [P in keyof Organization]: any }) {
    if (!raw) return null
    const entity = new Organization()
    Object.assign(entity, raw)

    entity.createdAt = raw.createdAt == null ? raw.createdAt : Number(raw.createdAt)
    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)
    entity.deletedAt = raw.deletedAt == null ? raw.deletedAt : Number(raw.deletedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Organization]: any }[]) {
    return raws.map((i) => Organization.fromRaw(i))
  }
}

export type OrganizationRelationType = Pick<Organization, 'userList'>

export type OrganizationSortType = Pick<Organization, 'id'>

export type OrganizationInsertType = Omit<
  Organization,
  | keyof OrganizationRelationType
  | keyof Pick<Organization, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
>

export type OrganizationUpdateType = Omit<
  Organization,
  keyof OrganizationRelationType | keyof Pick<Organization, 'id' | 'createdAt'>
>
