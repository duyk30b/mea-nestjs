import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import Procedure from './procedure.entity'

@Entity('RegimenItem')
@Index('IDX_RegimenItem__oid_regimenId', ['oid', 'regimenId'])
export default class RegimenItem {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Expose()
  @Column({ default: 0 })
  regimenId: number

  @Expose()
  @Column({ default: 0 })
  procedureId: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  quantity: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  gapDay: number

  @Expose()
  procedure: Procedure

  static fromRaw(raw: { [P in keyof RegimenItem]: any }) {
    if (!raw) return null
    const entity = new RegimenItem()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof RegimenItem]: any }[]) {
    return raws.map((i) => RegimenItem.fromRaw(i))
  }
}

export type RegimenItemRelationType = {
  [P in keyof Pick<RegimenItem, 'procedure'>]?: boolean
}

export type RegimenItemInsertType = Omit<
  RegimenItem,
  keyof RegimenItemRelationType | keyof Pick<RegimenItem, 'id'>
>

export type RegimenItemUpdateType = {
  [K in Exclude<
    keyof RegimenItem,
    keyof RegimenItemRelationType | keyof Pick<RegimenItem, 'oid' | 'id'>
  >]: RegimenItem[K] | (() => string)
}

export type RegimenItemSortType = {
  [P in keyof Pick<RegimenItem, 'oid' | 'id'>]?: 'ASC' | 'DESC'
}
