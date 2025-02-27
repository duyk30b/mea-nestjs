import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { TicketLaboratoryRepository } from '../../../../_libs/database/repositories'
import { StatisticTimeQuery } from './request'

@Injectable()
export class ApiStatisticLaboratoryService {
  constructor(private readonly ticketLaboratoryRepository: TicketLaboratoryRepository) { }

  async sumMoney(oid: number, query: StatisticTimeQuery): Promise<BaseResponse> {
    const { fromTime, toTime } = query

    const data = await this.ticketLaboratoryRepository.sumMoney({
      oid,
      fromTime,
      toTime,
    })

    return { data }
  }
}
