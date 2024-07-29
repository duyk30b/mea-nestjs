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

export type CustomerSourceRelationType = Pick<CustomerSource, never>

export type CustomerSourceSortType = Pick<CustomerSource, 'oid'>

export type CustomerSourceInsertType = Omit<
  CustomerSource,
  keyof CustomerSourceRelationType | keyof Pick<CustomerSource, 'id'>
>

export type CustomerSourceUpdateType = Omit<
  CustomerSource,
  keyof CustomerSourceRelationType | keyof Pick<CustomerSource, 'oid'>
>
