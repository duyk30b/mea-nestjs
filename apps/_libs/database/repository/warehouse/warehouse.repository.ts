import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Warehouse } from '../../entities'
import {
  WarehouseInsertType,
  WarehouseRelationType,
  WarehouseSortType,
  WarehouseUpdateType,
} from '../../entities/warehouse.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class WarehouseRepository extends PostgreSqlRepository<
  Warehouse,
  { [P in keyof WarehouseSortType]?: 'ASC' | 'DESC' },
  { [P in keyof WarehouseRelationType]?: boolean },
  WarehouseInsertType,
  WarehouseUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Warehouse) private warehouseRepository: Repository<Warehouse>
  ) {
    super(warehouseRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<WarehouseInsertType>>(
    data: NoExtra<Partial<WarehouseInsertType>, X>
  ): Promise<Warehouse> {
    const raw = await this.insertOneAndReturnRaw(data)
    return Warehouse.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends WarehouseInsertType>(
    data: NoExtra<WarehouseInsertType, X>
  ): Promise<Warehouse> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return Warehouse.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<WarehouseUpdateType>>(
    condition: BaseCondition<Warehouse>,
    data: NoExtra<Partial<WarehouseUpdateType>, X>
  ): Promise<Warehouse[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Warehouse.fromRaws(raws)
  }
}
