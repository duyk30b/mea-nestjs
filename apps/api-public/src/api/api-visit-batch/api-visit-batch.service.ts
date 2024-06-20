import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { VisitBatchRepository } from '../../../../_libs/database/repository/visit-batch/visit-batch.repository'
import { VisitBatchGetManyQuery } from './request'

@Injectable()
export class ApiVisitBatchService {
  constructor(private readonly visitBatchRepository: VisitBatchRepository) {}

  async getMany(oid: number, query: VisitBatchGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query

    const data = await this.visitBatchRepository.findMany({
      relation: {
        visitProduct: relation?.visitProduct,
        batch: relation?.batch,
      },
      limit,
      condition: {
        oid,
        visitId: filter?.visitId,
        batchId: filter?.batchId,
        visitProductId: filter?.visitProductId,
      },
    })
    return { data }
  }
}
