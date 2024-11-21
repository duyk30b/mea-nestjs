import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import {
  LaboratoryInsertType,
  LaboratoryValueType,
} from '../../../../_libs/database/entities/laboratory.entity'
import { LaboratoryRepository } from '../../../../_libs/database/repository/laboratory/laboratory.repository'
import {
  LaboratoryCreateBody,
  LaboratoryGetManyQuery,
  LaboratoryGetOneQuery,
  LaboratoryPaginationQuery,
  LaboratoryUpdateBody,
} from './request'

@Injectable()
export class ApiLaboratoryService {
  constructor(private readonly laboratoryRepository: LaboratoryRepository) { }

  async pagination(oid: number, query: LaboratoryPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { data, total } = await this.laboratoryRepository.pagination({
      relation: {
        laboratoryGroup: relation?.laboratoryGroup,
      },
      page,
      limit,
      condition: {
        oid,
        laboratoryGroupId: filter?.laboratoryGroupId,
        level: filter?.level,
        parentId: filter?.parentId,
      },
      sort,
    })
    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getMany(oid: number, query: LaboratoryGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query
    const data = await this.laboratoryRepository.findMany({
      relation: {
        laboratoryGroup: relation?.laboratoryGroup,
      },
      condition: {
        oid,
        laboratoryGroupId: filter?.laboratoryGroupId,
        level: filter?.level,
        parentId: filter?.parentId,
      },
      sort,
      limit,
    })
    return { data }
  }

  async exampleList(): Promise<BaseResponse> {
    const data = await this.laboratoryRepository.findMany({
      condition: { oid: 1 },
    })
    return { data }
  }

  async getOne(oid: number, id: number, query: LaboratoryGetOneQuery): Promise<BaseResponse> {
    const laboratory = await this.laboratoryRepository.findOne({
      relation: {
        laboratoryGroup: query?.relation?.laboratoryGroup,
      },
      condition: { oid, id },
    })
    if (!laboratory) throw new BusinessException('error.Database.NotFound')
    if (query?.relation?.children) {
      if (laboratory.valueType === LaboratoryValueType.Children) {
        laboratory.children = await this.laboratoryRepository.findMany({
          condition: {
            oid,
            parentId: laboratory.id,
            level: 2,
          },
          sort: { id: 'ASC' },
        })
      }
    }

    return { data: { laboratory } }
  }

  async create(oid: number, body: LaboratoryCreateBody): Promise<BaseResponse> {
    const { children, ...laboratoryCreateDto } = body
    const laboratoryParentId = await this.laboratoryRepository.insertOneFullField({
      ...laboratoryCreateDto,
      oid,
      level: 1,
      parentId: 0,
    })
    const [laboratoryParent] = await this.laboratoryRepository.updateAndReturnEntity(
      { oid, id: laboratoryParentId },
      { parentId: laboratoryParentId }
    )

    if (laboratoryParent.valueType === LaboratoryValueType.Children && children.length) {
      const childrenDto = children.map((i) => {
        const childDto: LaboratoryInsertType = {
          ...i,
          oid,
          laboratoryGroupId: laboratoryParent.laboratoryGroupId,
          level: 2,
          parentId: laboratoryParent.id,
        }
        return childDto
      })
      await this.laboratoryRepository.insertManyFullFieldAndReturnEntity(childrenDto)
    }

    return { data: { laboratory: laboratoryParent } }
  }

  async update(oid: number, id: number, body: LaboratoryUpdateBody): Promise<BaseResponse> {
    const { children, ...laboratoryUpdateDto } = body
    const [laboratory] = await this.laboratoryRepository.updateAndReturnEntity(
      { oid, id },
      laboratoryUpdateDto
    )
    if (!laboratory) throw new BusinessException('error.Database.UpdateFailed')

    if (laboratory.valueType === LaboratoryValueType.Children) {
      await this.laboratoryRepository.updateChildren({
        oid,
        laboratoryParent: laboratory,
        laboratoryChildrenDtoList: children,
      })
    }
    return { data: { laboratory } }
  }

  async destroy(oid: number, id: number): Promise<BaseResponse> {
    const original = await this.laboratoryRepository.findOneBy({ oid, id })
    const affected = await this.laboratoryRepository.delete({ oid, id })
    if (affected === 0) throw new BusinessException('error.Database.DeleteFailed')

    if (original.valueType === LaboratoryValueType.Children) {
      await this.laboratoryRepository.delete({ oid, parentId: id })
    }
    return { data: { laboratoryId: id } }
  }
}
