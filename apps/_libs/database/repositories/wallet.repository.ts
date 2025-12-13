import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Wallet } from '../entities'
import {
  WalletInsertType,
  WalletRelationType,
  WalletSortType,
  WalletUpdateType,
} from '../entities/wallet.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class WalletManager extends _PostgreSqlManager<
  Wallet,
  WalletRelationType,
  WalletInsertType,
  WalletUpdateType,
  WalletSortType
> {
  constructor() {
    super(Wallet)
  }
}

@Injectable()
export class WalletRepository extends _PostgreSqlRepository<
  Wallet,
  WalletRelationType,
  WalletInsertType,
  WalletUpdateType,
  WalletSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Wallet) private walletRepository: Repository<Wallet>
  ) {
    super(Wallet, walletRepository)
  }
}
