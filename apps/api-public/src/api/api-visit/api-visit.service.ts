import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Image } from '../../../../_libs/database/entities'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { ImageRepository } from '../../../../_libs/database/repository/image/image.repository'
import { VisitBatchRepository } from '../../../../_libs/database/repository/visit-batch/visit-batch.repository'
import { VisitDiagnosisRepository } from '../../../../_libs/database/repository/visit-diagnosis/visit-diagnosis.repository'
import { VisitProductRepository } from '../../../../_libs/database/repository/visit-product/visit-product.repository'
import { VisitClose } from '../../../../_libs/database/repository/visit/visit-close'
import { VisitItemsMoney } from '../../../../_libs/database/repository/visit/visit-items-money'
import { VisitPayDebt } from '../../../../_libs/database/repository/visit/visit-pay-debt'
import { VisitPrepayment } from '../../../../_libs/database/repository/visit/visit-prepayment'
import { VisitRefundOverpaid } from '../../../../_libs/database/repository/visit/visit-refund-overpaid'
import { VisitReopen } from '../../../../_libs/database/repository/visit/visit-reopen'
import { VisitReplaceVisitProcedureList } from '../../../../_libs/database/repository/visit/visit-replace-visit-procedure-list'
import { VisitReplaceVisitProductList } from '../../../../_libs/database/repository/visit/visit-replace-visit-product-list'
import { VisitReplaceVisitRadiologyList } from '../../../../_libs/database/repository/visit/visit-replace-visit-radiology-list'
import { VisitReturnProduct } from '../../../../_libs/database/repository/visit/visit-return-product'
import { VisitSendProduct } from '../../../../_libs/database/repository/visit/visit-send-product'
import { VisitRepository } from '../../../../_libs/database/repository/visit/visit.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { VisitGetManyQuery, VisitGetOneQuery, VisitPaginationQuery } from './request'

@Injectable()
export class ApiVisitService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly visitRepository: VisitRepository,
    private readonly visitDiagnosisRepository: VisitDiagnosisRepository,
    private readonly visitProductRepository: VisitProductRepository,
    private readonly visitSendProduct: VisitSendProduct,
    private readonly visitReplaceVisitProcedureList: VisitReplaceVisitProcedureList,
    private readonly visitReplaceVisitRadiologyList: VisitReplaceVisitRadiologyList,
    private readonly visitReplaceVisitProductList: VisitReplaceVisitProductList,
    private readonly visitReturnProduct: VisitReturnProduct,
    private readonly visitPrepayment: VisitPrepayment,
    private readonly visitClose: VisitClose,
    private readonly visitReopen: VisitReopen,
    private readonly visitItemsMoney: VisitItemsMoney,
    private readonly visitRefundOverpaid: VisitRefundOverpaid,
    private readonly visitPayDebt: VisitPayDebt,
    private readonly customerRepository: CustomerRepository,
    private readonly visitBatchRepository: VisitBatchRepository,
    private readonly imageRepository: ImageRepository
  ) {}

  async pagination(oid: number, query: VisitPaginationQuery): Promise<BaseResponse> {
    const { page, limit, sort, relation } = query
    const { startedAt, updatedAt, registeredAt, customerId } = query.filter || {}

    const { data, total } = await this.visitRepository.pagination({
      page,
      limit,
      relation: {
        customer: relation?.customer,
        visitDiagnosis: relation?.visitDiagnosis,
      },
      condition: {
        oid,
        customerId,
        registeredAt,
        startedAt,
        updatedAt,
      },
      sort,
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: VisitGetManyQuery): Promise<BaseResponse> {
    const { relation, limit, sort } = query
    const { startedAt, updatedAt, customerId, registeredAt } = query.filter || {}

    const data = await this.visitRepository.findMany({
      condition: {
        oid,
        customerId,
        registeredAt,
        startedAt,
        updatedAt,
      },
      relation: { customer: relation?.customer },
      limit,
      sort,
    })
    return { data }
  }

  async getOne(oid: number, id: number, { relation }: VisitGetOneQuery): Promise<BaseResponse> {
    const data = await this.visitRepository.queryOne(
      { oid, id },
      {
        customer: !!relation?.customer,
        customerPaymentList: !!relation?.customerPaymentList,
        visitDiagnosis: !!relation?.visitDiagnosis,
        visitProductList: relation?.visitProductList ? { product: true } : false,
        visitProcedureList: relation?.visitProcedureList ? { procedure: true } : false,
        visitRadiologyList: relation?.visitRadiologyList
          ? { radiology: true, doctor: true }
          : false,
      }
    )
    if (!data) {
      throw new BusinessException('error.Database.NotFound')
    }
    data.visitRadiologyList = data.visitRadiologyList || []
    data.visitDiagnosis.imageList = []

    const visitDiagnosisImageIds: number[] = JSON.parse(data.visitDiagnosis.imageIds)
    const visitRadiologyImageIds: number[] = data.visitRadiologyList
      .map((i) => JSON.parse(i.imageIds))
      .flat()

    const imageIds = [...visitDiagnosisImageIds, ...visitRadiologyImageIds]

    let imageMap: Record<string, Image> = {}
    if (imageIds.length > 0) {
      const imageList = await this.imageRepository.findMany({
        condition: { id: { IN: imageIds } },
        sort: { id: 'ASC' },
      })
      imageMap = arrayToKeyValue(imageList, 'id')
    }

    // push để lấy image đúng thứ tự
    visitDiagnosisImageIds.forEach((i) => {
      data.visitDiagnosis.imageList.push(imageMap[i])
    })
    data.visitRadiologyList.forEach((visitRadiology) => {
      const visitDiagnosisImageIds: number[] = JSON.parse(visitRadiology.imageIds)
      visitRadiology.imageList = []
      visitDiagnosisImageIds.forEach((i) => {
        visitRadiology.imageList.push(imageMap[i])
      })
    })

    return { data }
  }
}
