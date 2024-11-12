import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { AttributeInputType } from '../common/variable'
import Paraclinical from './paraclinical.entity'

@Entity('ParaclinicalAttribute')
export default class ParaclinicalAttribute {
  @Exclude()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @Expose()
  paraclinicalId: number

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  code: string

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string

  @Expose()
  @Column({ type: 'varchar', length: 25, default: AttributeInputType.InputText })
  inputType: AttributeInputType

  @Column({ nullable: true })
  @Expose()
  default: string

  @Column({ type: 'text', default: JSON.stringify([]) })
  @Expose()
  options: string

  @ManyToOne((type) => Paraclinical, (paraclinical) => paraclinical.paraclinicalAttributeList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'paraclinicalId', referencedColumnName: 'id' })
  @Expose()
  paraclinical: Paraclinical

  static fromRaw(raw: { [P in keyof ParaclinicalAttribute]: any }) {
    if (!raw) return null
    const entity = new ParaclinicalAttribute()

    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof ParaclinicalAttribute]: any }[]) {
    return raws.map((i) => ParaclinicalAttribute.fromRaw(i))
  }
}

export type ParaclinicalAttributeRelationType = Pick<ParaclinicalAttribute, 'paraclinical'>

export type ParaclinicalAttributeSortType = Pick<ParaclinicalAttribute, 'oid' | 'id'>

export type ParaclinicalAttributeInsertType = Omit<
  ParaclinicalAttribute,
  keyof ParaclinicalAttributeRelationType | keyof Pick<ParaclinicalAttribute, 'id'>
>

export type ParaclinicalAttributeUpdateType = Omit<
  ParaclinicalAttribute,
  keyof ParaclinicalAttributeRelationType | keyof Pick<ParaclinicalAttribute, 'oid' | 'id'>
>
