import { Injectable } from '@nestjs/common'
import { Warehouse } from '../entities'
import {
  WarehouseInsertType,
  WarehouseRelationType,
  WarehouseSortType,
  WarehouseUpdateType,
} from '../entities/warehouse.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class WarehouseManager extends _PostgreSqlManager<
  Warehouse,
  WarehouseRelationType,
  WarehouseInsertType,
  WarehouseUpdateType,
  WarehouseSortType
> {
  constructor() {
    super(Warehouse)
  }
}
