import { ESArray } from '@libs/common/helpers'
import { GenerateId } from '@libs/database/common/generate-id'
import { CustomerGroupInsertType } from '@libs/database/entities/customer_group.entity'
import { CustomerGroupRepository } from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { CustomerGroupGetManyQuery, CustomerGroupReplaceAllBody } from './request'

@Injectable()
export class CustomerGroupService {
  constructor(private readonly customerGroupRepository: CustomerGroupRepository) { }

  async getMany(oid: number, query: CustomerGroupGetManyQuery) {
    const { limit, filter, relation } = query

    const customerGroupList = await this.customerGroupRepository.findMany({
      relation,
      condition: {
        oid,
      },
      limit,
    })
    return { customerGroupList }
  }

  async replaceAll(oid: number, body: CustomerGroupReplaceAllBody) {
    await this.customerGroupRepository.replaceAll(oid, body.customerGroupReplaceAll)
    return true
  }

  async createByGroupName(oid: number, groupName: string[]) {
    const customerGroupExistAll = await this.customerGroupRepository.findManyBy({ oid })
    const groupNameList = customerGroupExistAll.map((i) => i.name)

    const groupNameClean = ESArray.uniqueArray(groupName).filter((i) => !!i)
    const groupNameNoExist = groupNameClean.filter((i) => {
      return !groupNameList.includes(i)
    })
    const customerGroupCreateList = groupNameNoExist.map((i) => {
      const dto: CustomerGroupInsertType = {
        oid,
        name: i,
        id: GenerateId.nextId(),
      }
      return dto
    })
    const customerGroupInsertedList =
      await this.customerGroupRepository.insertMany(customerGroupCreateList)

    return [...customerGroupExistAll, ...customerGroupInsertedList]
  }
}
