import { Exclude, Expose } from 'class-transformer'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import PrintHtml from './print-html.entity'
import RadiologyGroup from './radiology-group.entity'

@Entity('Radiology')
export default class Radiology {
  @Exclude()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: 1 })
  @Expose()
  priority: number

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string

  @Expose()
  @Column({ default: 0 })
  radiologyGroupId: number

  @Expose()
  @Column({ default: 0 })
  printHtmlId: number

  @Column({ nullable: true })
  @Expose()
  price: number

  @Column({ type: 'varchar', length: 255, default: '' })
  @Expose()
  requestNoteDefault: string

  @Column({ type: 'text' })
  @Expose()
  descriptionDefault: string

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  resultDefault: string

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

  @ManyToOne((type) => RadiologyGroup, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'radiologyGroupId', referencedColumnName: 'id' })
  @Expose()
  radiologyGroup: RadiologyGroup

  @ManyToOne((type) => PrintHtml, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'printHtmlId', referencedColumnName: 'id' })
  @Expose()
  printHtml: PrintHtml

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

export type RadiologyRelationType = Pick<
  Radiology,
  'radiologyGroup' | 'printHtml'
>

export type RadiologySortType = Pick<Radiology, 'oid' | 'id' | 'name' | 'priority'>

export type RadiologyInsertType = Omit<
  Radiology,
  keyof RadiologyRelationType | keyof Pick<Radiology, 'id' | 'updatedAt' | 'deletedAt'>
>

// export type RadiologyUpdateType = Omit<
//   Radiology,
//   keyof RadiologyRelationType | keyof Pick<Radiology, 'oid' | 'id'>
// >

export type RadiologyUpdateType = {
  [K in Exclude<keyof Radiology, keyof RadiologyRelationType | 'oid' | 'id'>]:
  | Radiology[K]
  | (() => string)
}
