import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, OneToMany, PrimaryColumn, Unique } from 'typeorm'
import Payment from './payment.entity'

export enum WalletType {
  Cash = 1,
  Bank = 2,
}

@Entity('Wallet')
@Unique('UNIQUE_Wallet__oid_code', ['oid', 'code'])
export default class Wallet {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  code: string

  @Column()
  @Expose()
  name: string

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  walletType: WalletType

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isActive: 0 | 1

  @OneToMany(() => Payment, (payment) => payment.wallet)
  @Expose()
  paymentList: Payment[]

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  money: number

  static fromRaw(raw: { [P in keyof Wallet]: any }) {
    if (!raw) return null
    const entity = new Wallet()
    Object.assign(entity, raw)
    entity.money = Number(raw.money)
    return entity
  }

  static fromRaws(raws: { [P in keyof Wallet]: any }[]) {
    return raws.map((i) => Wallet.fromRaw(i))
  }
}

export type WalletRelationType = {
  [P in keyof Pick<Wallet, 'paymentList'>]?: boolean
}

export type WalletInsertType = Omit<Wallet, keyof WalletRelationType | keyof Pick<Wallet, never>>

export type WalletUpdateType = {
  [K in Exclude<keyof Wallet, keyof WalletRelationType | keyof Pick<Wallet, 'oid' | 'id'>>]:
  | Wallet[K]
  | (() => string)
}

export type WalletSortType = {
  [P in keyof Pick<Wallet, 'oid' | 'id'>]?: 'ASC' | 'DESC'
}
