import { Injectable } from '@nestjs/common'
import { CustomerRepository } from '../../../../../_libs/database/repositories'

@Injectable()
export class StatisticCustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository
  ) { }

  async sumCustomerDebt(oid: number) {
    const { dataRaws } = await this.customerRepository.findAndSelect({
      condition: { oid },
      aggregate: { sumDebt: { SUM: ['debt'] } },
    })
    return { customerSumDebt: Number(dataRaws[0].sumDebt) }
  }
}
