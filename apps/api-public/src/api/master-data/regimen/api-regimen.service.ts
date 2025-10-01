import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { ESArray, ESTimer } from '../../../../../_libs/common/helpers'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { Discount, Procedure, Regimen, RegimenItem } from '../../../../../_libs/database/entities'
import {
  DiscountInsertType,
  DiscountInteractType,
} from '../../../../../_libs/database/entities/discount.entity'
import Position, {
  PositionInsertType,
  PositionType,
} from '../../../../../_libs/database/entities/position.entity'
import { RegimenItemInsertType } from '../../../../../_libs/database/entities/regimen-item.entity'
import {
  DiscountRepository,
  PositionRepository,
  ProcedureRepository,
  RegimenItemRepository,
} from '../../../../../_libs/database/repositories'
import { RegimenRepository } from '../../../../../_libs/database/repositories/regimen.repository'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  RegimenGetManyQuery,
  RegimenGetOneQuery,
  RegimenPaginationQuery,
  RegimenRelationQuery,
  RegimenUpsertWrapBody,
} from './request'

@Injectable()
export class RegimenService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly regimenRepository: RegimenRepository,
    private readonly regimenItemRepository: RegimenItemRepository,
    private readonly positionRepository: PositionRepository,
    private readonly procedureRepository: ProcedureRepository,
    private readonly discountRepository: DiscountRepository
  ) { }

  async pagination(oid: number, query: RegimenPaginationQuery) {
    const { page, limit, filter, relation, sort } = query
    const { data, total } = await this.regimenRepository.pagination({
      // relation,
      page,
      limit,
      condition: {
        oid,
        isActive: filter?.isActive,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, regimenList: data, relation: query.relation })
    }

    return { regimenList: data, page, limit, total }
  }

  async getMany(oid: number, query: RegimenGetManyQuery) {
    const { limit, filter, relation } = query
    const regimenList = await this.regimenRepository.findMany({
      // relation,
      condition: {
        oid,
        isActive: filter?.isActive,
      },
      sort: { id: 'ASC' },
      limit,
    })

    if (query.relation) {
      await this.generateRelation({ oid, regimenList, relation: query.relation })
    }
    return { regimenList }
  }

  async getOne(oid: number, id: number, query: RegimenGetOneQuery) {
    const regimen = await this.regimenRepository.findOne({
      condition: { oid, id },
    })
    if (!regimen) throw new BusinessException('error.Database.NotFound')

    if (query.relation) {
      await this.generateRelation({ oid, regimenList: [regimen], relation: query.relation })
    }

    return { regimen }
  }

  async createOne(oid: number, body: RegimenUpsertWrapBody) {
    const { regimen: regimenBody } = body
    const code = regimenBody.code || ESTimer.timeToText(new Date(), 'YYMMDDhhmmss')

    const existRegimen = await this.regimenRepository.findOneBy({ oid, code })
    if (existRegimen) {
      throw new BusinessError(`Trùng mã dịch vụ với ${existRegimen.name}`)
    }

    const regimen = await this.regimenRepository.insertOneFullFieldAndReturnEntity({
      ...regimenBody,
      oid,
      code,
    })

    if (body.regimenItemList?.length) {
      await this.regimenItemRepository.insertManyAndReturnEntity(
        body.regimenItemList.map((i) => {
          const insert: RegimenItemInsertType = {
            ...i,
            oid,
            regimenId: regimen.id,
          }
          return insert
        })
      )
    }

    if (body.positionRequestList?.length) {
      await this.positionRepository.insertManyFullFieldAndReturnEntity(
        body.positionRequestList.map((i) => {
          const dto: PositionInsertType = {
            ...i,
            oid,
            positionInteractId: regimen.id,
            positionType: PositionType.RegimenRequest,
          }
          return dto
        })
      )
    }

    if (body.discountList?.length) {
      await this.discountRepository.insertManyFullFieldAndReturnEntity(
        body.discountList.map((i) => {
          const dto: DiscountInsertType = {
            ...i,
            discountInteractId: regimen.id,
            discountInteractType: DiscountInteractType.Regimen,
            oid,
          }
          return dto
        })
      )
    }

    this.socketEmitService.socketMasterDataChange(oid, {
      regimen: true,
      position: !!body.positionRequestList?.length,
      discount: !!body.discountList?.length,
    })

    return { regimen }
  }

  async updateOne(oid: number, regimenId: number, body: RegimenUpsertWrapBody) {
    const { regimen: regimenBody } = body
    const code = regimenBody.code || ESTimer.timeToText(new Date(), 'YYMMDDhhmmss')

    const existRegimen = await this.regimenRepository.findOneBy({
      oid,
      code,
      id: { NOT: regimenId },
    })
    if (existRegimen) {
      throw new BusinessError(`Trùng mã dịch vụ với ${existRegimen.name}`)
    }

    const regimen = await this.regimenRepository.updateOneAndReturnEntity(
      { oid, id: regimenId },
      regimenBody
    )

    await Promise.all([
      this.regimenItemRepository.delete({ oid, regimenId }),
      body.positionRequestList
        ? this.positionRepository.deleteAndReturnEntity({
          oid,
          positionInteractId: regimen.id,
          positionType: PositionType.RegimenRequest,
        })
        : undefined,
      body.discountList
        ? await this.discountRepository.deleteAndReturnEntity({
          oid,
          discountInteractId: regimen.id,
          discountInteractType: DiscountInteractType.Regimen,
        })
        : undefined,
    ])

    if (body.regimenItemList?.length) {
      await this.regimenItemRepository.insertManyAndReturnEntity(
        body.regimenItemList.map((i) => {
          const insert: RegimenItemInsertType = {
            ...i,
            oid,
            regimenId: regimen.id,
          }
          return insert
        })
      )
    }

    if (body.positionRequestList?.length) {
      await this.positionRepository.insertManyFullFieldAndReturnEntity(
        body.positionRequestList.map((i) => {
          const dto: PositionInsertType = {
            ...i,
            oid,
            positionInteractId: regimen.id,
            positionType: PositionType.RegimenRequest,
          }
          return dto
        })
      )
    }

    if (body.discountList?.length) {
      await this.discountRepository.insertManyFullFieldAndReturnEntity(
        body.discountList.map((i) => {
          const dto: DiscountInsertType = {
            ...i,
            discountInteractId: regimen.id,
            discountInteractType: DiscountInteractType.Regimen,
            oid,
          }
          return dto
        })
      )
    }

    this.socketEmitService.socketMasterDataChange(oid, {
      regimen: true,
      position: !!body.positionRequestList,
      discount: !!body.discountList,
    })
    return { regimen }
  }

  async destroyOne(oid: number, regimenId: number) {
    // const ticketRegimenList = await this.ticketRegimenRepository.findMany({
    //   condition: { oid, regimenId },
    //   limit: 10,
    // })
    const ticketRegimenList = []

    if (!ticketRegimenList.length) {
      const [
        regimenDestroyed,
        regimenItemDestroyedList,
        positionDestroyedList,
        discountDestroyedList,
      ] = await Promise.all([
        this.regimenRepository.deleteOneAndReturnEntity({
          oid,
          id: regimenId,
        }),
        this.regimenItemRepository.findManyBy({ oid, regimenId }),
        this.positionRepository.deleteAndReturnEntity({
          oid,
          positionInteractId: regimenId,
          positionType: { IN: [PositionType.RegimenRequest] },
        }),
        this.discountRepository.deleteAndReturnEntity({
          oid,
          discountInteractId: regimenId,
          discountInteractType: DiscountInteractType.Regimen,
        }),
      ])

      this.socketEmitService.socketMasterDataChange(oid, {
        regimen: true,
        position: !!positionDestroyedList?.length,
        discount: !!discountDestroyedList?.length,
      })
    }

    return { ticketRegimenList: [], regimenId, success: !ticketRegimenList.length }
  }

  async generateRelation(options: {
    oid: number
    regimenList: Regimen[]
    relation: RegimenRelationQuery
  }) {
    const { oid, regimenList, relation } = options
    const regimenIdList = ESArray.uniqueArray(regimenList.map((i) => i.id))

    const [positionList, discountList, regimenItemList] = await Promise.all([
      relation?.positionList && regimenIdList.length
        ? this.positionRepository.findManyBy({
          oid,
          positionType: {
            IN: [PositionType.RegimenRequest],
          },
          positionInteractId: { IN: [...regimenIdList, 0] },
        })
        : <Position[]>[],
      relation?.discountList && regimenIdList.length
        ? this.discountRepository.findManyBy({
          oid,
          discountInteractType: DiscountInteractType.Regimen,
          discountInteractId: { IN: [...regimenIdList, 0] }, // discountInteractId=0 là áp dụng cho tất cả
        })
        : <Discount[]>[],
      relation?.regimenItemList && regimenIdList.length
        ? this.regimenItemRepository.findManyBy({
          oid,
          regimenId: { IN: regimenIdList },
        })
        : <RegimenItem[]>[],
    ])

    const procedureIdList = (regimenItemList || []).map((k) => {
      return k.procedureId
    })
    let procedureMap: Record<string, Procedure> = {}
    if (relation?.regimenItemList?.procedure && procedureIdList.length) {
      const procedureList = await this.procedureRepository.findManyBy({
        oid,
        id: { IN: procedureIdList },
      })
      procedureMap = ESArray.arrayToKeyValue(procedureList, 'id')
    }

    regimenList.forEach((regimen: Regimen) => {
      if (relation?.regimenItemList) {
        regimen.regimenItemList = regimenItemList.filter((i) => {
          return i.regimenId === regimen.id
        })
        if (relation?.regimenItemList?.procedure) {
          regimen.regimenItemList.forEach((regimenItem) => {
            regimenItem.procedure = procedureMap[regimenItem.procedureId]
          })
        }
      }
      if (relation?.discountList) {
        regimen.discountList = discountList.filter((i) => i.discountInteractId === regimen.id)
        regimen.discountListExtra = discountList.filter((i) => i.discountInteractId === 0)
      }
      if (relation?.positionList) {
        regimen.positionRequestListCommon = positionList.filter((i) => {
          return i.positionType === PositionType.RegimenRequest && i.positionInteractId === 0
        })
        regimen.positionRequestList = positionList.filter((i) => {
          return (
            i.positionType === PositionType.RegimenRequest && i.positionInteractId === regimen.id
          )
        })
      }
    })

    return regimenList
  }
}
