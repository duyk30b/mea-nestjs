import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Warehouse } from '../entities'
import {
  WarehouseInsertType,
  WarehouseRelationType,
  WarehouseSortType,
  WarehouseUpdateType,
} from '../entities/warehouse.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class WarehouseRepository extends _PostgreSqlRepository<
  Warehouse,
  WarehouseRelationType,
  WarehouseInsertType,
  WarehouseUpdateType,
  WarehouseSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Warehouse) private warehouseRepository: Repository<Warehouse>
  ) {
    super(Warehouse, warehouseRepository)
  }
}
