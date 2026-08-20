import { ESArray } from '@libs/common/helpers'
import { CustomerGroupRepository, CustomerRepository } from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'

@Injectable()
export class StatisticCustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerGroupRepository: CustomerGroupRepository
  ) {}

  async customerSumDebt(oid: number) {
    const { dataRaws } = await this.customerRepository.findAndSelect({
      condition: { oid },
      aggregate: { sumDebt: { SUM: ['debt'] } },
    })
    return { customerSumDebt: Number(dataRaws[0].sumDebt) }
  }

  async customerGroupByCustomerGroup(oid: number) {
    const customerGroupList = await this.customerGroupRepository.findMany({
      condition: { oid },
    })
    const customerGroupMap = ESArray.arrayToKeyValue(customerGroupList, 'id')

    const { dataRaws } = await this.customerRepository.findAndSelect({
      condition: { oid },
      groupBy: ['customerGroupId'],
      select: ['customerGroupId'],
      aggregate: {
        countCustomer: { COUNT: '*' },
        sumDebt: { SUM: ['debt'] },
      },
    })
    const statisticData = dataRaws.map((i) => {
      return {
        customerGroupId: i.customerGroupId,
        countCustomer: Number(i.countCustomer),
        sumDebt: Number(i.sumDebt),
        customerGroup: customerGroupMap[i.customerGroupId] ?? null,
      }
    })
    return { statisticData }
  }
}
