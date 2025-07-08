import { Expose } from 'class-transformer'
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('Address')
export default class Address {
  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column({ length: 100, default: '' })
  @Expose()
  province: string

  @Column({ length: 100, default: '' })
  @Expose()
  ward: string

  static fromRaw(raw: { [P in keyof Address]: any }) {
    if (!raw) return null
    const entity = new Address()
    Object.assign(entity, raw)
    return entity
  }

  static fromRaws(raws: { [P in keyof Address]: any }[]) {
    return raws.map((i) => Address.fromRaw(i))
  }
}

export type AddressRelationType = {
  [P in keyof Pick<Address, never>]?: boolean
}

export type AddressInsertType = Omit<Address, keyof AddressRelationType | keyof Pick<Address, 'id'>>

export type AddressUpdateType = {
  [K in Exclude<keyof Address, keyof AddressRelationType | keyof Pick<Address, 'id'>>]:
  | Address[K]
  | (() => string)
}

export type AddressSortType = {
  [P in keyof Pick<Address, 'id'>]?: 'ASC' | 'DESC'
}
