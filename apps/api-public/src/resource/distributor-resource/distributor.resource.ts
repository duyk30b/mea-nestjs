import {
  DistributorGetManyQuery,
  DistributorPaginationQuery,
} from '@api-public/resource/distributor-resource/distributor-get.query'
import { BusinessException } from '@libs/common/exception-filter/exception-filter'
import { DistributorRepository } from '@libs/database/repositories/distributor.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class DistributorResource {
  constructor(private readonly distributorRepository: DistributorRepository) {}

  async pagination(oid: number, query: DistributorPaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data: distributorList, total } = await this.distributorRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
        isActive: filter?.isActive,
        $OR: filter?.searchText
          ? [{ fullName: { LIKE: filter.searchText } }, { phone: { LIKE: filter.searchText } }]
          : undefined,
        debt: filter?.debt,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })
    return { distributorList, total, page, limit }
  }

  async getMany(oid: number, query: DistributorGetManyQuery) {
    const { limit, filter, relation } = query

    const distributorList = await this.distributorRepository.findMany({
      relation,
      condition: {
        oid,
        isActive: filter?.isActive,
        $OR: filter?.searchText
          ? [{ fullName: { LIKE: filter.searchText } }, { phone: { LIKE: filter.searchText } }]
          : undefined,
        debt: filter?.debt,
        updatedAt: filter?.updatedAt,
      },
      limit,
    })
    return { distributorList }
  }

  async getOne(oid: number, id: number) {
    const distributor = await this.distributorRepository.findOneBy({ oid, id })
    if (!distributor) throw new BusinessException('error.Database.NotFound')
    return { distributor }
  }
}
