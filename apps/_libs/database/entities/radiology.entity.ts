import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export enum RadiologyHost {
  GoogleDriver = 'GoogleDriver',
}

@Entity('Radiology')
export default class Radiology {
  @Exclude()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  name: string

  @Column({ nullable: true })
  @Expose()
  price: number

  @Column({ type: 'text', default: '' })
  @Expose({})
  descriptionDefault: string // Mô tả mặc định

  @Column({ type: 'text', default: '' })
  @Expose({})
  resultDefault: string // Mô tả mặc định

  @Column({
    type: 'bigint',
    default: () => '(EXTRACT(epoch FROM now()) * (1000))',
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

  static fromRaw(raw: { [P in keyof Radiology]: any }) {
    if (!raw) return null
    const entity = new Radiology()

    entity.price = Number(raw.price)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)
    entity.deletedAt = raw.deletedAt == null ? raw.deletedAt : Number(raw.deletedAt)

    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof Radiology]: any }[]) {
    return raws.map((i) => Radiology.fromRaw(i))
  }
}

export type RadiologyRelationType = Pick<Radiology, never>

export type RadiologySortType = Pick<Radiology, 'oid' | 'id' | 'name' | 'price'>

export type RadiologyInsertType = Omit<
  Radiology,
  keyof RadiologyRelationType | keyof Pick<Radiology, 'id' | 'updatedAt' | 'deletedAt'>
>

export type RadiologyUpdateType = Omit<
  Radiology,
  keyof RadiologyRelationType | keyof Pick<Radiology, 'oid' | 'id'>
>
