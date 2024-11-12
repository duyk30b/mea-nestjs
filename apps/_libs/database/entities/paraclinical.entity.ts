import { Exclude, Expose } from 'class-transformer'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AttributeLayoutType } from '../common/variable'
import ParaclinicalAttribute from './paraclinical-attribute.entity'
import ParaclinicalGroup from './paraclinical-group.entity'
import PrintHtml from './print-html.entity'

@Entity('Paraclinical')
export default class Paraclinical {
  @Exclude()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  conclusionDefault: string

  @Expose()
  @Column({ default: 0 })
  paraclinicalGroupId: number

  @Column({ nullable: true })
  @Expose()
  price: number

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  attributeLayout: keyof typeof AttributeLayoutType

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

  @ManyToOne((type) => ParaclinicalGroup, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'paraclinicalGroupId', referencedColumnName: 'id' })
  @Expose()
  paraclinicalGroup: ParaclinicalGroup

  @OneToOne((type) => PrintHtml, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'id', referencedColumnName: 'paraclinicalId' })
  @Expose()
  printHtml: PrintHtml

  @Expose()
  @OneToMany(
    () => ParaclinicalAttribute,
    (ParaclinicalAttribute) => ParaclinicalAttribute.paraclinical
  )
  paraclinicalAttributeList: ParaclinicalAttribute[]

  static fromRaw(raw: { [P in keyof Paraclinical]: any }) {
    if (!raw) return null
    const entity = new Paraclinical()

    entity.price = Number(raw.price)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)
    entity.deletedAt = raw.deletedAt == null ? raw.deletedAt : Number(raw.deletedAt)

    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof Paraclinical]: any }[]) {
    return raws.map((i) => Paraclinical.fromRaw(i))
  }
}

export type ParaclinicalRelationType = Pick<
  Paraclinical,
  'paraclinicalGroup' | 'paraclinicalAttributeList' | 'printHtml'
>

export type ParaclinicalSortType = Pick<Paraclinical, 'oid' | 'id' | 'name' | 'price'>

export type ParaclinicalInsertType = Omit<
  Paraclinical,
  keyof ParaclinicalRelationType | keyof Pick<Paraclinical, 'id' | 'updatedAt' | 'deletedAt'>
>

export type ParaclinicalUpdateType = Omit<
  Paraclinical,
  keyof ParaclinicalRelationType | keyof Pick<Paraclinical, 'oid' | 'id'>
>
