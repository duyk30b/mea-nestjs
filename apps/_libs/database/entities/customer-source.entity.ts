import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('CustomerSource')
export default class CustomerSource {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string

  static fromRaw(raw: { [P in keyof CustomerSource]: any }) {
    if (!raw) return null
    const entity = new CustomerSource()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof CustomerSource]: any }[]) {
    return raws.map((i) => CustomerSource.fromRaw(i))
  }
}

export type CustomerSourceRelationType = {
  [P in keyof Pick<CustomerSource, never>]?: boolean
}

export type CustomerSourceInsertType = Omit<
  CustomerSource,
  keyof CustomerSourceRelationType | keyof Pick<CustomerSource, 'id'>
>

export type CustomerSourceUpdateType = {
  [K in Exclude<
    keyof CustomerSource,
    keyof CustomerSourceRelationType | keyof Pick<CustomerSource, 'oid' | 'id'>
  >]: CustomerSource[K] | (() => string)
}

export type CustomerSourceSortType = {
  [P in keyof Pick<CustomerSource, 'id'>]?: 'ASC' | 'DESC'
}
