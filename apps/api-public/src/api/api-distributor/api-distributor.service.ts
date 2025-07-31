import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { PaymentPersonType } from '../../../../_libs/database/entities/payment.entity'
import { PaymentRepository } from '../../../../_libs/database/repositories'
import { DistributorRepository } from '../../../../_libs/database/repositories/distributor.repository'
import { ReceiptRepository } from '../../../../_libs/database/repositories/receipt.repository'
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
    private readonly receiptRepository: ReceiptRepository
  ) { }

  async pagination(oid: number, query: DistributorPaginationQuery): Promise<BaseResponse> {
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
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: DistributorGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query

    const data = await this.distributorRepository.findMany({
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
    return { data }
  }

  async getOne(oid: number, id: number): Promise<BaseResponse> {
    const distributor = await this.distributorRepository.findOneBy({ oid, id })
    if (!distributor) throw new BusinessException('error.Database.NotFound')
    return { data: { distributor } }
  }

  async createOne(oid: number, body: DistributorCreateBody): Promise<BaseResponse> {
    const distributor = await this.distributorRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      oid,
      debt: 0,
    })
    this.socketEmitService.distributorUpsert(oid, { distributor })
    return { data: { distributor } }
  }

  async updateOne(oid: number, id: number, body: DistributorUpdateBody): Promise<BaseResponse> {
    const [distributor] = await this.distributorRepository.updateAndReturnEntity({ oid, id }, body)
    if (!distributor) {
      throw BusinessException.create({
        message: 'error.Database.UpdateFailed',
        details: 'Distributor',
      })
    }
    this.socketEmitService.distributorUpsert(oid, { distributor })
    return { data: { distributor } }
  }

  async destroyOne(oid: number, distributorId: number): Promise<BaseResponse> {
    const receiptList = await this.receiptRepository.findMany({
      condition: { oid, distributorId },
      limit: 10,
    })
    if (receiptList.length > 0) {
      return {
        data: { receiptList },
        success: false,
      }
    }

    await Promise.allSettled([
      this.distributorRepository.delete({ oid, id: distributorId }),
      this.paymentRepository.delete({
        oid,
        personId: distributorId,
        personType: PaymentPersonType.Distributor,
      }),
    ])

    return { data: { receiptList: [], distributorId } }
  }
}
