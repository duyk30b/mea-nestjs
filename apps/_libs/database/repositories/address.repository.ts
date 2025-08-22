import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Address } from '../entities'
import {
  AddressInsertType,
  AddressRelationType,
  AddressSortType,
  AddressUpdateType,
} from '../entities/address.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class AddressManager extends _PostgreSqlManager<
  Address,
  AddressRelationType,
  AddressInsertType,
  AddressUpdateType,
  AddressSortType
> {
  constructor() {
    super(Address)
  }
}

@Injectable()
export class AddressRepository extends _PostgreSqlRepository<
  Address,
  AddressRelationType,
  AddressInsertType,
  AddressUpdateType,
  AddressSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Address) private addressRepository: Repository<Address>
  ) {
    super(Address, addressRepository)
  }
}
