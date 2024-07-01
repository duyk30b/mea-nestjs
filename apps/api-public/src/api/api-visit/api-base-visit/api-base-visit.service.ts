import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../../_libs/common/interceptor/transform-response.interceptor'
import { Image } from '../../../../../_libs/database/entities'
import { ImageRepository } from '../../../../../_libs/database/repository/image/image.repository'
import { VisitRepository } from '../../../../../_libs/database/repository/visit/visit.repository'
import {
  VisitGetManyQuery,
  VisitGetOneQuery,
  VisitPaginationQuery,
} from './request/visit-get.query'

@Injectable()
export class ApiBaseVisitService {
  constructor(
    private readonly visitRepository: VisitRepository,
    private readonly imageRepository: ImageRepository
  ) {}

  async pagination(oid: number, query: VisitPaginationQuery): Promise<BaseResponse> {
    const { page, limit, sort, relation, filter } = query

    const { data, total } = await this.visitRepository.pagination({
      page,
      limit,
      relation: {
        customer: relation?.customer,
        visitDiagnosis: relation?.visitDiagnosis,
      },
      condition: {
        oid,
        visitStatus: filter?.visitStatus,
        visitType: filter?.visitType,
        customerId: filter?.customerId,
        registeredAt: filter?.registeredAt,
        startedAt: filter?.startedAt,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: VisitGetManyQuery): Promise<BaseResponse> {
    const { relation, limit, sort, filter } = query

    const data = await this.visitRepository.findMany({
      condition: {
        oid,
        visitStatus: filter?.visitStatus,
        visitType: filter?.visitType,
        customerId: filter?.customerId,
        registeredAt: filter?.registeredAt,
        startedAt: filter?.startedAt,
        updatedAt: filter?.updatedAt,
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
        visitSurchargeList: !!relation?.visitSurchargeList,
        visitExpenseList: !!relation?.visitExpenseList,
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

    if (data.visitRadiologyList || data.visitDiagnosis?.imageList) {
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
    }
    return { data }
  }
}
