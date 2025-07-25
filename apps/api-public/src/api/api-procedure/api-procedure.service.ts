import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { BusinessError } from '../../../../_libs/database/common/error'
import { Discount, Procedure, ProcedureGroup } from '../../../../_libs/database/entities'
import {
  DiscountInsertType,
  DiscountInteractType,
} from '../../../../_libs/database/entities/discount.entity'
import Position, {
  CommissionCalculatorType,
  PositionInsertType,
  PositionInteractType,
} from '../../../../_libs/database/entities/position.entity'
import {
  DiscountRepository,
  PositionRepository,
  ProcedureGroupRepository,
} from '../../../../_libs/database/repositories'
import { ProcedureRepository } from '../../../../_libs/database/repositories/procedure.repository'
import { TicketProcedureRepository } from '../../../../_libs/database/repositories/ticket-procedure.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  ProcedureGetManyQuery,
  ProcedureGetOneQuery,
  ProcedurePaginationQuery,
  ProcedureRelationQuery,
  ProcedureUpsertBody,
} from './request'

@Injectable()
export class ApiProcedureService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly procedureRepository: ProcedureRepository,
    private readonly procedureGroupRepository: ProcedureGroupRepository,
    private readonly positionRepository: PositionRepository,
    private readonly discountRepository: DiscountRepository,
    private readonly ticketProcedureRepository: TicketProcedureRepository
  ) { }

  async pagination(oid: number, query: ProcedurePaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { data, total } = await this.procedureRepository.pagination({
      // relation,
      page,
      limit,
      condition: {
        oid,
        name: filter?.searchText ? { LIKE: filter.searchText } : undefined,
        procedureGroupId: filter?.procedureGroupId,
        isActive: filter?.isActive,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, procedureList: data, relation: query.relation })
    }

    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getMany(oid: number, query: ProcedureGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query
    const data = await this.procedureRepository.findMany({
      // relation,
      condition: {
        oid,
        name: filter?.searchText ? { LIKE: filter.searchText } : undefined,
        procedureGroupId: filter?.procedureGroupId,
        isActive: filter?.isActive,
        updatedAt: filter?.updatedAt,
      },
      sort: { id: 'ASC' },
      limit,
    })

    if (query.relation) {
      await this.generateRelation({ oid, procedureList: data, relation: query.relation })
    }
    return { data }
  }

  async getOne(oid: number, id: number, query: ProcedureGetOneQuery): Promise<BaseResponse> {
    const procedure = await this.procedureRepository.findOne({
      relation: { procedureGroup: query?.relation?.procedureGroup },
      condition: { oid, id },
    })
    if (!procedure) throw new BusinessException('error.Database.NotFound')

    if (query.relation) {
      await this.generateRelation({ oid, procedureList: [procedure], relation: query.relation })
    }

    return { data: { procedure } }
  }

  async createOne(oid: number, body: ProcedureUpsertBody): Promise<BaseResponse> {
    const { positionList, discountList, procedure: procedureBody } = body
    positionList?.forEach((i) => {
      if (
        i.commissionCalculatorType === CommissionCalculatorType.PercentExpected
        || i.commissionCalculatorType === CommissionCalculatorType.PercentActual
      ) {
        if (i.commissionValue >= 1000) {
          throw new BusinessException('error.ValidateFailed')
        }
      }
    })

    let procedureCode = procedureBody.procedureCode
    if (!procedureCode) {
      const count = await this.procedureRepository.getMaxId()
      procedureCode = (count + 1).toString()
    }

    const existProcedure = await this.procedureRepository.findOneBy({
      oid,
      procedureCode,
    })
    if (existProcedure) {
      throw new BusinessError(`Trùng mã dịch vụ với ${existProcedure.name}`)
    }

    const procedure = await this.procedureRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...procedureBody,
      procedureCode,
    })

    this.socketEmitService.procedureListChange(oid, { procedureUpsertedList: [procedure] })

    if (positionList?.length) {
      const positionDtoList: PositionInsertType[] = positionList.map((i) => {
        const dto: PositionInsertType = {
          oid,
          roleId: i.roleId,
          commissionCalculatorType: i.commissionCalculatorType,
          commissionValue: i.commissionValue,
          positionInteractId: procedure.id,
          positionType: PositionInteractType.Procedure,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      procedure.positionList = positionUpsertedList
      this.socketEmitService.positionListChange(oid, { positionUpsertedList })
    }

    if (discountList?.length) {
      const discountListDto = discountList.map((i) => {
        const dto: DiscountInsertType = {
          ...i,
          discountInteractId: procedure.id,
          discountInteractType: DiscountInteractType.Procedure,
          oid,
        }
        return dto
      })
      const discountUpsertedList =
        await this.discountRepository.insertManyFullFieldAndReturnEntity(discountListDto)
      procedure.discountList = discountUpsertedList
      this.socketEmitService.discountListChange(oid, { discountUpsertedList })
    }

    return { data: { procedure } }
  }

  async updateOne(
    oid: number,
    procedureId: number,
    body: ProcedureUpsertBody
  ): Promise<BaseResponse> {
    const { positionList, discountList, procedure: procedureBody } = body
    positionList?.forEach((i) => {
      if (
        i.commissionCalculatorType === CommissionCalculatorType.PercentExpected
        || i.commissionCalculatorType === CommissionCalculatorType.PercentActual
      ) {
        if (i.commissionValue >= 1000) {
          throw new BusinessException('error.ValidateFailed')
        }
      }
    })

    const existProcedure = await this.procedureRepository.findOneBy({
      oid,
      procedureCode: procedureBody.procedureCode,
      id: { NOT: procedureId },
    })
    if (existProcedure) {
      throw new BusinessError(`Trùng mã dịch vụ với ${existProcedure.name}`)
    }
    const procedure = await this.procedureRepository.updateOneAndReturnEntity(
      { oid, id: procedureId },
      procedureBody
    )

    this.socketEmitService.procedureListChange(oid, { procedureUpsertedList: [procedure] })

    if (positionList) {
      const positionDestroyedList = await this.positionRepository.deleteAndReturnEntity({
        oid,
        positionInteractId: procedure.id,
        positionType: PositionInteractType.Procedure,
      })
      const positionDtoList: PositionInsertType[] = positionList.map((i) => {
        const dto: PositionInsertType = {
          oid,
          roleId: i.roleId,
          commissionCalculatorType: i.commissionCalculatorType,
          commissionValue: i.commissionValue,
          positionInteractId: procedure.id,
          positionType: PositionInteractType.Procedure,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      procedure.positionList = positionUpsertedList
      this.socketEmitService.positionListChange(oid, {
        positionUpsertedList,
        positionDestroyedList,
      })
    }

    if (discountList) {
      const discountDestroyedList = await this.discountRepository.deleteAndReturnEntity({
        oid,
        discountInteractId: procedure.id,
        discountInteractType: DiscountInteractType.Procedure,
      })
      const discountListDto = discountList.map((i) => {
        const dto: DiscountInsertType = {
          ...i,
          discountInteractId: procedure.id,
          discountInteractType: DiscountInteractType.Procedure,
          oid,
        }
        return dto
      })
      const discountUpsertedList =
        await this.discountRepository.insertManyFullFieldAndReturnEntity(discountListDto)
      procedure.discountList = discountUpsertedList
      this.socketEmitService.discountListChange(oid, {
        discountUpsertedList,
        discountDestroyedList,
      })
    }

    return { data: { procedure } }
  }

  async destroyOne(oid: number, procedureId: number): Promise<BaseResponse> {
    const ticketProcedureList = await this.ticketProcedureRepository.findMany({
      condition: { oid, procedureId },
      limit: 10,
    })
    if (ticketProcedureList.length > 0) {
      return {
        data: { ticketProcedureList },
        success: false,
      }
    }

    const [positionDestroyedList, discountDestroyedList] = await Promise.all([
      this.positionRepository.deleteAndReturnEntity({
        oid,
        positionInteractId: procedureId,
        positionType: PositionInteractType.Procedure,
      }),
      this.discountRepository.deleteAndReturnEntity({
        oid,
        discountInteractId: procedureId,
        discountInteractType: DiscountInteractType.Procedure,
      }),
    ])

    if (positionDestroyedList.length) {
      this.socketEmitService.positionListChange(oid, { positionDestroyedList })
    }

    if (discountDestroyedList.length) {
      this.socketEmitService.discountListChange(oid, { discountDestroyedList })
    }

    const procedure = await this.procedureRepository.deleteOneAndReturnEntity({
      oid,
      id: procedureId,
    })

    this.socketEmitService.procedureListChange(oid, { procedureDestroyedList: [procedure] })

    return { data: { ticketProcedureList: [], procedureId } }
  }

  async generateRelation(options: {
    oid: number
    procedureList: Procedure[]
    relation: ProcedureRelationQuery
  }) {
    const { oid, procedureList, relation } = options
    const procedureIdList = ESArray.uniqueArray(procedureList.map((i) => i.id))
    const procedureGroupIdList = ESArray.uniqueArray(procedureList.map((i) => i.procedureGroupId))

    const [positionList, discountList, procedureGroupList] = await Promise.all([
      relation?.positionList && procedureIdList.length
        ? this.positionRepository.findManyBy({
          oid,
          positionType: PositionInteractType.Procedure,
          positionInteractId: { IN: procedureIdList },
        })
        : <Position[]>[],
      relation?.discountList && procedureIdList.length
        ? this.discountRepository.findManyBy({
          oid,
          discountInteractType: DiscountInteractType.Procedure,
          discountInteractId: { IN: [...procedureIdList, 0] }, // discountInteractId=0 là áp dụng cho tất cả
        })
        : <Discount[]>[],
      relation?.procedureGroup && procedureGroupIdList.length
        ? this.procedureGroupRepository.findManyBy({
          oid,
          id: { IN: procedureGroupIdList },
        })
        : <ProcedureGroup[]>[],
    ])

    const procedureGroupMap = ESArray.arrayToKeyValue(procedureGroupList, 'id')

    procedureList.forEach((procedure: Procedure) => {
      if (relation?.positionList) {
        procedure.positionList = positionList.filter((i) => i.positionInteractId === procedure.id)
      }
      if (relation?.discountList) {
        procedure.discountList = discountList.filter((i) => i.discountInteractId === procedure.id)
        procedure.discountListExtra = discountList.filter((i) => i.discountInteractId === 0)
      }
      if (relation?.procedureGroup) {
        procedure.procedureGroup = procedureGroupMap[procedure.procedureGroupId]
      }
    })

    return procedureList
  }
}
