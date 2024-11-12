import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { ParaclinicalAttributeRepository } from '../../../../_libs/database/repository/paraclinical-attribute/paraclinical-attribute.repository'
import { ParaclinicalRepository } from '../../../../_libs/database/repository/paraclinical/paraclinical.repository'
import { PrintHtmlRepository } from '../../../../_libs/database/repository/print-html/print-html.repository'
import {
  ParaclinicalGetManyQuery,
  ParaclinicalGetOneQuery,
  ParaclinicalPaginationQuery,
  ParaclinicalUpdateInfoBody,
  ParaclinicalUpsertBody,
} from './request'

@Injectable()
export class ApiParaclinicalService {
  constructor(
    private readonly paraclinicalRepository: ParaclinicalRepository,
    private readonly printHtmlRepository: PrintHtmlRepository,
    private readonly paraclinicalAttributeRepository: ParaclinicalAttributeRepository
  ) { }

  async pagination(oid: number, query: ParaclinicalPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { data, total } = await this.paraclinicalRepository.pagination({
      relation,
      page,
      limit,
      condition: {
        oid,
        paraclinicalGroupId: filter?.paraclinicalGroupId,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })
    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getMany(oid: number, query: ParaclinicalGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query
    const data = await this.paraclinicalRepository.findMany({
      relation,
      condition: {
        oid,
        paraclinicalGroupId: filter?.paraclinicalGroupId,
        updatedAt: filter?.updatedAt,
      },
      sort,
      limit,
    })
    return { data }
  }

  async exampleList(): Promise<BaseResponse> {
    const data = await this.paraclinicalRepository.findMany({
      relation: {
        paraclinicalAttributeList: true,
        printHtml: true,
      },
      condition: { oid: 1 },
    })
    return { data }
  }

  async getOne(oid: number, id: number, query: ParaclinicalGetOneQuery): Promise<BaseResponse> {
    const paraclinical = await this.paraclinicalRepository.findOne({
      relation: query?.relation,
      condition: { oid, id },
    })
    if (!paraclinical) throw new BusinessException('error.Database.NotFound')
    return { data: { paraclinical } }
  }

  async createOne(oid: number, body: ParaclinicalUpsertBody): Promise<BaseResponse> {
    const { printHtml, paraclinicalAttributeList, ...paraclinicalBody } = body
    const paraclinical = await this.paraclinicalRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...paraclinicalBody,
    })

    paraclinical.printHtml = await this.printHtmlRepository.insertOneFullFieldAndReturnEntity({
      ...printHtml,
      oid,
      paraclinicalId: paraclinical.id,
      type: 'PARACLINICAL',
    })

    if (paraclinicalAttributeList?.length) {
      paraclinical.paraclinicalAttributeList =
        await this.paraclinicalAttributeRepository.insertManyFullFieldAndReturnEntity(
          paraclinicalAttributeList.map((i) => {
            return {
              ...i,
              oid,
              paraclinicalId: paraclinical.id,
            }
          })
        )
    }

    return { data: { paraclinical } }
  }

  async updateOne(oid: number, id: number, body: ParaclinicalUpsertBody): Promise<BaseResponse> {
    const { printHtml, paraclinicalAttributeList, ...paraclinicalBody } = body

    const [paraclinical] = await this.paraclinicalRepository.updateAndReturnEntity(
      { oid, id },
      paraclinicalBody
    )
    if (!paraclinical) {
      throw new BusinessException('error.Database.UpdateFailed')
    }

    const oldPrintHtml = await this.printHtmlRepository.findOneBy({
      oid,
      paraclinicalId: paraclinical.id,
      type: 'PARACLINICAL',
    })
    if (!oldPrintHtml) {
      paraclinical.printHtml = await this.printHtmlRepository.insertOneFullFieldAndReturnEntity({
        ...printHtml,
        oid,
        paraclinicalId: paraclinical.id,
        type: 'PARACLINICAL',
      })
    } else {
      const printHtmlList = await this.printHtmlRepository.updateAndReturnEntity(
        {
          oid,
          paraclinicalId: paraclinical.id,
          type: 'PARACLINICAL',
        },
        printHtml
      )
      paraclinical.printHtml = printHtmlList[0]
    }

    await this.paraclinicalAttributeRepository.delete({ oid, paraclinicalId: paraclinical.id })

    if (paraclinicalAttributeList?.length) {
      paraclinical.paraclinicalAttributeList =
        await this.paraclinicalAttributeRepository.insertManyFullFieldAndReturnEntity(
          paraclinicalAttributeList.map((i) => {
            return {
              ...i,
              oid,
              paraclinicalId: paraclinical.id,
            }
          })
        )
    }

    return { data: { paraclinical } }
  }

  async updateInfo(
    oid: number,
    id: number,
    body: ParaclinicalUpdateInfoBody
  ): Promise<BaseResponse> {
    const [paraclinical] = await this.paraclinicalRepository.updateAndReturnEntity(
      { oid, id },
      body
    )
    if (!paraclinical) {
      throw new BusinessException('error.Database.UpdateFailed')
    }

    return { data: { paraclinical } }
  }

  async deleteOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.paraclinicalRepository.update(
      { oid, id },
      { deletedAt: Date.now() }
    )
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    const paraclinical = await this.paraclinicalRepository.findOneById(id)
    return { data: { paraclinical } }
  }
}
