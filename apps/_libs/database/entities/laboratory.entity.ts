import { Exclude, Expose } from 'class-transformer'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import LaboratoryGroup from './laboratory-group.entity'

@Entity('Laboratory')
export default class Laboratory {
  @Exclude()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string

  @Expose()
  @Column({ default: 0 })
  laboratoryGroupId: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  level: number

  @Column({ nullable: true })
  @Expose()
  price: number

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 7,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  minValue: number

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 7,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  maxValue: number

  @Column({ type: 'varchar', length: 25 })
  @Expose()
  unit: string

  @ManyToOne((type) => LaboratoryGroup, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'laboratoryGroupId', referencedColumnName: 'id' })
  @Expose()
  laboratoryGroup: LaboratoryGroup

  static fromRaw(raw: { [P in keyof Laboratory]: any }) {
    if (!raw) return null
    const entity = new Laboratory()

    entity.price = Number(raw.price)
    entity.minValue = Number(raw.minValue)
    entity.maxValue = Number(raw.maxValue)

    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof Laboratory]: any }[]) {
    return raws.map((i) => Laboratory.fromRaw(i))
  }
}

export type LaboratoryRelationType = Pick<
  Laboratory,
  'laboratoryGroup'
>

export type LaboratorySortType = Pick<Laboratory, 'oid' | 'id' | 'name' | 'laboratoryGroupId'>

export type LaboratoryInsertType = Omit<
  Laboratory,
  keyof LaboratoryRelationType | keyof Pick<Laboratory, 'id'>
>

export type LaboratoryUpdateType = Omit<
  Laboratory,
  keyof LaboratoryRelationType | keyof Pick<Laboratory, 'oid' | 'id'>
>
