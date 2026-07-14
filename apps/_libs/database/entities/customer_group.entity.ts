import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm'

@Entity('CustomerGroup')
export default class CustomerGroup {
  @Expose()
  @Column()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string

  static fromRaw(raw: { [P in keyof CustomerGroup]: any }) {
    if (!raw) return null
    const entity = new CustomerGroup()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof CustomerGroup]: any }[]) {
    return raws.map((i) => CustomerGroup.fromRaw(i))
  }
}

export type CustomerGroupRelationType = {
  [P in keyof Pick<CustomerGroup, never>]?: boolean
}

export type CustomerGroupInsertType = Omit<
  CustomerGroup,
  keyof CustomerGroupRelationType | keyof Pick<CustomerGroup, never>
>

export type CustomerGroupUpdateType = {
  [K in Exclude<
    keyof CustomerGroup,
    keyof CustomerGroupRelationType | keyof Pick<CustomerGroup, 'oid' | 'id'>
  >]: CustomerGroup[K] | (() => string)
}

export type CustomerGroupSortType = {
  [P in keyof Pick<CustomerGroup, 'oid' | 'id' | 'name'>]?: 'ASC' | 'DESC'
}
