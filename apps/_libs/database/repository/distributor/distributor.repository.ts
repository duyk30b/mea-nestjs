import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Distributor } from '../../entities'
import { DistributorInsertType, DistributorRelationType, DistributorSortType, DistributorUpdateType } from '../../entities/distributor.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class DistributorRepository extends PostgreSqlRepository<
  Distributor,
  DistributorSortType,
  DistributorRelationType,
  DistributorInsertType,
  DistributorUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Distributor) private distributorRepository: Repository<Distributor>
  ) {
    super(distributorRepository)
  }

  async insertOneFullFieldAndReturnEntity<X extends DistributorInsertType>(
    data: NoExtra<DistributorInsertType, X>
  ): Promise<Distributor> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return Distributor.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<DistributorUpdateType>>(
    condition: BaseCondition<Distributor>,
    data: NoExtra<Partial<DistributorUpdateType>, X>
  ): Promise<Distributor[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Distributor.fromRaws(raws)
  }
}
