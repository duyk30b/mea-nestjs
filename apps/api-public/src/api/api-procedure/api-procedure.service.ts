import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { BusinessError } from '../../../../_libs/database/common/error'
import { Discount, Procedure, ProcedureGroup } from '../../../../_libs/database/entities'
import {
  DiscountInsertType,
  DiscountInteractType,
} from '../../../../_libs/database/entities/discount.entity'
import Position, {
  PositionInsertType,
  PositionType,
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

  async pagination(oid: number, query: ProcedurePaginationQuery) {
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
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, procedureList: data, relation: query.relation })
    }

    return { procedureList: data, page, limit, total }
  }

  async getMany(oid: number, query: ProcedureGetManyQuery) {
    const { limit, filter, relation } = query
    const procedureList = await this.procedureRepository.findMany({
      // relation,
      condition: {
        oid,
        name: filter?.searchText ? { LIKE: filter.searchText } : undefined,
        procedureGroupId: filter?.procedureGroupId,
        isActive: filter?.isActive,
      },
      sort: { id: 'ASC' },
      limit,
    })

    if (query.relation) {
      await this.generateRelation({ oid, procedureList, relation: query.relation })
    }
    return { procedureList }
  }

  async getOne(oid: number, id: number, query: ProcedureGetOneQuery) {
    const procedure = await this.procedureRepository.findOne({
      relation: { procedureGroup: query?.relation?.procedureGroup },
      condition: { oid, id },
    })
    if (!procedure) throw new BusinessException('error.Database.NotFound')

    if (query.relation) {
      await this.generateRelation({ oid, procedureList: [procedure], relation: query.relation })
    }

    return { procedure }
  }

  async createOne(oid: number, body: ProcedureUpsertBody) {
    const { positionRequestList, positionResultList, discountList, procedure: procedureBody } = body
    let code = procedureBody.code
    if (!code) {
      const count = await this.procedureRepository.getMaxId()
      code = (count + 1).toString()
    }

    const existProcedure = await this.procedureRepository.findOneBy({ oid, code })
    if (existProcedure) {
      throw new BusinessError(`Trùng mã dịch vụ với ${existProcedure.name}`)
    }

    const procedure = await this.procedureRepository.insertOneFullFieldAndReturnEntity({
      ...procedureBody,
      oid,
      code,
    })

    this.socketEmitService.procedureListChange(oid, { procedureUpsertedList: [procedure] })

    if (positionRequestList?.length) {
      const positionDtoList: PositionInsertType[] = positionRequestList.map((i) => {
        const dto: PositionInsertType = {
          ...i,
          oid,
          positionInteractId: procedure.id,
          positionType: PositionType.ProcedureRequest,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      procedure.positionRequestList = positionUpsertedList
      this.socketEmitService.positionListChange(oid, { positionUpsertedList })
    }

    if (positionResultList?.length) {
      const positionDtoList: PositionInsertType[] = positionResultList.map((i) => {
        const dto: PositionInsertType = {
          ...i,
          oid,
          positionInteractId: procedure.id,
          positionType: PositionType.ProcedureResult,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      procedure.positionResultList = positionUpsertedList
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

    return { procedure }
  }

  async updateOne(oid: number, procedureId: number, body: ProcedureUpsertBody) {
    const { positionRequestList, positionResultList, discountList, procedure: procedureBody } = body

    if (procedureBody.code != null) {
      const existProcedure = await this.procedureRepository.findOneBy({
        oid,
        code: procedureBody.code,
        id: { NOT: procedureId },
      })
      if (existProcedure) {
        throw new BusinessError(`Trùng mã dịch vụ với ${existProcedure.name}`)
      }
    }

    const procedure = await this.procedureRepository.updateOneAndReturnEntity(
      { oid, id: procedureId },
      procedureBody
    )

    this.socketEmitService.procedureListChange(oid, { procedureUpsertedList: [procedure] })

    if (positionRequestList) {
      const positionDestroyedList = await this.positionRepository.deleteAndReturnEntity({
        oid,
        positionInteractId: procedure.id,
        positionType: PositionType.ProcedureRequest,
      })
      const positionDtoList: PositionInsertType[] = positionRequestList.map((i) => {
        const dto: PositionInsertType = {
          ...i,
          oid,
          positionInteractId: procedure.id,
          positionType: PositionType.ProcedureRequest,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      procedure.positionRequestList = positionUpsertedList
      this.socketEmitService.positionListChange(oid, {
        positionUpsertedList,
        positionDestroyedList,
      })
    }

    if (positionResultList) {
      const positionDestroyedList = await this.positionRepository.deleteAndReturnEntity({
        oid,
        positionInteractId: procedure.id,
        positionType: PositionType.ProcedureResult,
      })
      const positionDtoList: PositionInsertType[] = positionResultList.map((i) => {
        const dto: PositionInsertType = {
          ...i,
          oid,
          positionInteractId: procedure.id,
          positionType: PositionType.ProcedureResult,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      procedure.positionRequestList = positionUpsertedList
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

    return { procedure }
  }

  async destroyOne(oid: number, procedureId: number) {
    const ticketProcedureList = await this.ticketProcedureRepository.findMany({
      condition: { oid, procedureId },
      limit: 10,
    })

    if (!ticketProcedureList.length) {
      const [positionDestroyedList, discountDestroyedList] = await Promise.all([
        this.positionRepository.deleteAndReturnEntity({
          oid,
          positionInteractId: procedureId,
          positionType: { IN: [PositionType.ProcedureRequest, PositionType.ProcedureResult] },
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
    }

    return { ticketProcedureList: [], procedureId, success: !ticketProcedureList.length }
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
          positionType: { IN: [PositionType.ProcedureRequest, PositionType.ProcedureResult] },
          positionInteractId: { IN: [...procedureIdList, 0] },
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
      if (relation?.procedureGroup) {
        procedure.procedureGroup = procedureGroupMap[procedure.procedureGroupId]
      }
      if (relation?.discountList) {
        procedure.discountList = discountList.filter((i) => i.discountInteractId === procedure.id)
        procedure.discountListExtra = discountList.filter((i) => i.discountInteractId === 0)
      }
      if (relation?.positionList) {
        procedure.positionRequestListCommon = positionList.filter((i) => {
          return i.positionType === PositionType.ProcedureRequest && i.positionInteractId === 0
        })
        procedure.positionRequestList = positionList.filter((i) => {
          return (
            i.positionType === PositionType.ProcedureRequest
            && i.positionInteractId === procedure.id
          )
        })
        procedure.positionResultListCommon = positionList.filter((i) => {
          return i.positionType === PositionType.ProcedureResult && i.positionInteractId === 0
        })
        procedure.positionResultList = positionList.filter((i) => {
          return (
            i.positionType === PositionType.ProcedureResult && i.positionInteractId === procedure.id
          )
        })
      }
    })

    return procedureList
  }
}
