import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'
import Discount from './discount.entity'
import Position from './position.entity'
import RegimenItem from './regimen-item.entity'

@Entity('Regimen')
@Unique('UNIQUE_Regimen__oid_code', ['oid', 'code'])
export default class Regimen {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  code: string // Mã liệu trình

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string

  @Column({ nullable: true })
  @Expose()
  price: number // Giá mặc định

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isActive: 0 | 1

  @Expose()
  regimenItemList: RegimenItem[]

  @Expose()
  positionList: Position[]

  @Expose()
  discountList: Discount[]

  @Expose()
  discountListExtra: Discount[]

  static fromRaw(raw: { [P in keyof Regimen]: any }) {
    if (!raw) return null
    const entity = new Regimen()
    Object.assign(entity, raw)

    entity.price = Number(raw.price)

    return entity
  }

  static fromRaws(raws: { [P in keyof Regimen]: any }[]) {
    return raws.map((i) => Regimen.fromRaw(i))
  }
}

export type RegimenRelationType = {
  [P in keyof Pick<
    Regimen,
    'regimenItemList' | 'positionList' | 'discountList' | 'discountListExtra'
  >]?: boolean
}

export type RegimenInsertType = Omit<Regimen, keyof RegimenRelationType | keyof Pick<Regimen, 'id'>>

export type RegimenUpdateType = {
  [K in Exclude<keyof Regimen, keyof RegimenRelationType | keyof Pick<Regimen, 'oid' | 'id'>>]:
  | Regimen[K]
  | (() => string)
}

export type RegimenSortType = {
  [P in keyof Pick<Regimen, 'oid' | 'id' | 'code' | 'name' | 'price'>]?: 'ASC' | 'DESC'
}
