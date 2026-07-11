import { Expose } from 'class-transformer'
import {
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm'

@Entity('Attribute')
export default class Attribute {
  @PrimaryColumn({ nullable: false, type: 'varchar', length: 255 })
  @Expose({})
  key: string

  @Column({ type: 'varchar', default: '' })
  @Expose({})
  description: string

  @Column({ type: 'varchar', default: '' })
  @Expose({})
  valueExample: string

  static fromRaw(raw: { [P in keyof Attribute]: any }) {
    if (!raw) return null
    const entity = new Attribute()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof Attribute]: any }[]) {
    return raws.map((i) => Attribute.fromRaw(i))
  }
}

export type AttributeRelationType = {
  [P in keyof Pick<Attribute, never>]?: boolean
}

export type AttributeInsertType = Omit<
  Attribute,
  keyof AttributeRelationType
>

export type AttributeUpdateType = {
  [K in Exclude<
    keyof Attribute,
    keyof AttributeRelationType
  >]: Attribute[K] | (() => string)
}

export type AttributeSortType = {
  [P in keyof Pick<Attribute, 'key'>]?: 'ASC' | 'DESC'
}
