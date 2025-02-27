import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { TicketRadiologyRepository } from '../../../../_libs/database/repositories'
import { StatisticTimeQuery } from './request'

@Injectable()
export class ApiStatisticRadiologyService {
  constructor(private readonly ticketRadiologyRepository: TicketRadiologyRepository) { }

  async sumMoney(oid: number, query: StatisticTimeQuery): Promise<BaseResponse> {
    const { fromTime, toTime } = query

    const data = await this.ticketRadiologyRepository.sumMoney({
      oid,
      fromTime,
      toTime,
    })

    return { data }
  }
}
