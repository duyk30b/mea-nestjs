import { CustomerRepository } from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'

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
