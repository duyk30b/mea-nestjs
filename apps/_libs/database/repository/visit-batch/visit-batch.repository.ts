import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { VisitBatch } from '../../entities'
import { VisitBatchInsertType, VisitBatchUpdateType } from '../../entities/visit-batch.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class VisitBatchRepository extends PostgreSqlRepository<
  VisitBatch,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in 'visitProduct' | 'batch']?: boolean },
  VisitBatchInsertType,
  VisitBatchUpdateType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(VisitBatch) private visitProductRepository: Repository<VisitBatch>
  ) {
    super(visitProductRepository)
  }

  async insertManyAndReturnEntity<X extends Partial<VisitBatchInsertType>>(
    data: NoExtra<Partial<VisitBatchInsertType>, X>[]
  ): Promise<VisitBatch[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return VisitBatch.fromRaws(raws)
  }
}
