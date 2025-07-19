import { Expose } from 'class-transformer'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import Image from './image.entity'
import User from './user.entity'

export enum OrganizationStatus {
  Inactive = 0,
  Active = 1,
  Frequent = 2,
}

@Entity('Organization')
@Index('IDX_Organization__organization_code', ['organizationCode'], { unique: true })
export default class Organization {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  organizationCode: string

  @Expose()
  @Column({ type: 'char', length: 10, nullable: false })
  phone: string

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string

  @Expose()
  @Column({ type: 'varchar', length: 255, default: '' })
  facebook: string

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  emailVerify: 0 | 1

  @Expose()
  @Column({ type: 'varchar', default: JSON.stringify({}) })
  dataVersion: string

  @Expose()
  @Column({ type: 'smallint', default: 0 })
  level: number

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string

  @Expose()
  @Column({ default: 0 })
  logoImageId: number

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  addressProvince: string

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  addressWard: string

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  addressStreet: string

  @Column({ type: 'text', default: '[]' })
  @Expose()
  permissionIds: string

  @Column({ type: 'text', default: '' })
  @Expose({})
  note: string

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  expiryDate: number

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
  status: OrganizationStatus

  @OneToOne(() => Image, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'logoImageId', referencedColumnName: 'id' })
  @Expose()
  logoImage: Image

  @Expose()
  @OneToMany(() => User, (user) => user.organization)
  userList: User[]

  @Expose()
  dataVersionParse: { product: number; batch: number; customer: number }

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

export type OrganizationRelationType = {
  [P in keyof Pick<Organization, 'userList' | 'logoImage'>]?: boolean
}

export type OrganizationInsertType = Omit<
  Organization,
  | keyof OrganizationRelationType
  | keyof Pick<Organization, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'dataVersionParse'>
>

export type OrganizationUpdateType = {
  [K in Exclude<
    keyof Organization,
    | keyof OrganizationRelationType
    | keyof Pick<Organization, 'id' | 'createdAt' | 'dataVersionParse'>
  >]: Organization[K] | (() => string)
}

export type OrganizationSortType = {
  [P in keyof Pick<Organization, 'id'>]?: 'ASC' | 'DESC'
}
