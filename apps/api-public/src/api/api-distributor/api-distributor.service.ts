import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { PaymentPersonType } from '../../../../_libs/database/entities/payment.entity'
import { PaymentRepository } from '../../../../_libs/database/repositories'
import { DistributorRepository } from '../../../../_libs/database/repositories/distributor.repository'
import { PurchaseOrderRepository } from '../../../../_libs/database/repositories/purchase-order.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  DistributorCreateBody,
  DistributorGetManyQuery,
  DistributorPaginationQuery,
  DistributorUpdateBody,
} from './request'

@Injectable()
export class ApiDistributorService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly distributorRepository: DistributorRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository
  ) { }

  async pagination(oid: number, query: DistributorPaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.distributorRepository.pagination({
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
    return { distributorList: data, total, page, limit }
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

  async createOne(oid: number, body: DistributorCreateBody) {
    const distributor = await this.distributorRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      oid,
      debt: 0,
    })
    this.socketEmitService.distributorUpsert(oid, { distributor })
    return { distributor }
  }

  async updateOne(oid: number, id: number, body: DistributorUpdateBody) {
    const distributor = await this.distributorRepository.updateOneAndReturnEntity({ oid, id }, body)

    this.socketEmitService.distributorUpsert(oid, { distributor })
    return { distributor }
  }

  async destroyOne(oid: number, distributorId: number) {
    const purchaseOrderList = await this.purchaseOrderRepository.findMany({
      condition: { oid, distributorId },
      limit: 10,
    })

    if (!purchaseOrderList.length) {
      await Promise.allSettled([
        this.distributorRepository.delete({ oid, id: distributorId }),
        this.paymentRepository.delete({
          oid,
          personId: distributorId,
          personType: PaymentPersonType.Distributor,
        }),
      ])
    }

    return { purchaseOrderList, distributorId, success: purchaseOrderList.length === 0 }
  }
}
