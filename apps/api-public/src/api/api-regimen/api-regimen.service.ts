import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { BusinessError } from '../../../../_libs/database/common/error'
import { Discount, Regimen, RegimenItem } from '../../../../_libs/database/entities'
import {
  DiscountInsertType,
  DiscountInteractType,
} from '../../../../_libs/database/entities/discount.entity'
import Position, {
  PositionInsertType,
  PositionInteractType,
} from '../../../../_libs/database/entities/position.entity'
import { RegimenItemInsertType } from '../../../../_libs/database/entities/regimen-item.entity'
import {
  DiscountRepository,
  PositionRepository,
  RegimenItemRepository,
  RegimenRepository,
} from '../../../../_libs/database/repositories'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  RegimenCreateBody,
  RegimenGetManyQuery,
  RegimenGetOneQuery,
  RegimenPaginationQuery,
  RegimenRelationQuery,
  RegimenUpdateBody,
} from './request'

@Injectable()
export class ApiRegimenService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly regimenRepository: RegimenRepository,
    private readonly regimenItemRepository: RegimenItemRepository,
    private readonly positionRepository: PositionRepository,
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
        code: filter?.code,
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
    const data = await this.regimenRepository.findMany({
      // relation,
      condition: {
        oid,
        code: filter?.code,
        isActive: filter?.isActive,
      },
      sort: { id: 'ASC' },
      limit,
    })

    if (query.relation) {
      await this.generateRelation({ oid, regimenList: data, relation: query.relation })
    }
    return { regimenList: data }
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

  async createOne(oid: number, body: RegimenCreateBody) {
    const { positionList, discountList, regimen: regimenBody, regimenItemList } = body

    let code = regimenBody.code
    if (!code) {
      const maxId = await this.regimenRepository.getMaxId()
      code = (maxId + 1).toString()
    }
    const existRegimen = await this.regimenRepository.findOneBy({
      oid,
      code,
    })
    if (existRegimen) {
      throw new BusinessError(`Trùng mã liệu trình với ${existRegimen.name}`)
    }

    const regimen = await this.regimenRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...regimenBody,
      code,
    })

    if (regimenItemList.length) {
      const regimenItemDtoList = regimenItemList.map((i) => {
        const dto: RegimenItemInsertType = {
          oid,
          regimenId: regimen.id,
          procedureId: i.procedureId,
          quantity: i.quantity,
          gapHours: i.gapHours,
          gapHoursType: i.gapHoursType,
        }
        return dto
      })
      const regimenItemUpsertedList =
        await this.regimenItemRepository.insertManyFullFieldAndReturnEntity(regimenItemDtoList)
      regimen.regimenItemList = regimenItemUpsertedList
    }

    if (positionList?.length) {
      const positionDtoList: PositionInsertType[] = positionList.map((i) => {
        const dto: PositionInsertType = {
          oid,
          roleId: i.roleId,
          commissionCalculatorType: i.commissionCalculatorType,
          commissionValue: i.commissionValue,
          positionInteractId: regimen.id,
          positionType: PositionInteractType.Regimen,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      regimen.positionList = positionUpsertedList
      this.socketEmitService.positionListChange(oid, { positionUpsertedList })
    }

    if (discountList?.length) {
      const discountListDto = discountList.map((i) => {
        const dto: DiscountInsertType = {
          ...i,
          discountInteractId: regimen.id,
          discountInteractType: DiscountInteractType.Regimen,
          oid,
        }
        return dto
      })
      const discountUpsertedList =
        await this.discountRepository.insertManyFullFieldAndReturnEntity(discountListDto)
      regimen.discountList = discountUpsertedList
      this.socketEmitService.discountListChange(oid, { discountUpsertedList })
    }

    return { regimen }
  }

  async updateOne(oid: number, regimenId: number, body: RegimenUpdateBody) {
    const { regimenItemList, positionList, discountList, regimen: regimenBody } = body

    if (regimenBody.code != null) {
      const existRegimen = await this.regimenRepository.findOneBy({
        oid,
        code: regimenBody.code,
        id: { NOT: regimenId },
      })
      if (existRegimen) {
        throw new BusinessError(`Trùng mã liệu trình với ${existRegimen.name}`)
      }
    }

    const regimen = await this.regimenRepository.updateOneAndReturnEntity(
      { oid, id: regimenId },
      regimenBody
    )

    if (regimenItemList) {
      const regimenItemDestroyedList = await this.regimenItemRepository.deleteAndReturnEntity({
        oid,
        regimenId: regimen.id,
      })
      const regimenItemDtoList: RegimenItemInsertType[] = regimenItemList.map((i) => {
        const dto: RegimenItemInsertType = {
          oid,
          regimenId: regimen.id,
          procedureId: i.procedureId,
          quantity: i.quantity,
          gapHours: i.gapHours,
          gapHoursType: i.gapHoursType,
        }
        return dto
      })
      const regimenItemUpsertedList =
        await this.regimenItemRepository.insertManyFullFieldAndReturnEntity(regimenItemDtoList)
      regimen.regimenItemList = regimenItemUpsertedList
    }
    if (positionList) {
      const positionDestroyedList = await this.positionRepository.deleteAndReturnEntity({
        oid,
        positionInteractId: regimen.id,
        positionType: PositionInteractType.Regimen,
      })
      const positionDtoList: PositionInsertType[] = positionList.map((i) => {
        const dto: PositionInsertType = {
          oid,
          roleId: i.roleId,
          commissionCalculatorType: i.commissionCalculatorType,
          commissionValue: i.commissionValue,
          positionInteractId: regimen.id,
          positionType: PositionInteractType.Regimen,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      regimen.positionList = positionUpsertedList
      this.socketEmitService.positionListChange(oid, {
        positionUpsertedList,
        positionDestroyedList,
      })
    }

    if (discountList) {
      const discountDestroyedList = await this.discountRepository.deleteAndReturnEntity({
        oid,
        discountInteractId: regimen.id,
        discountInteractType: DiscountInteractType.Regimen,
      })
      const discountListDto = discountList.map((i) => {
        const dto: DiscountInsertType = {
          ...i,
          discountInteractId: regimen.id,
          discountInteractType: DiscountInteractType.Regimen,
          oid,
        }
        return dto
      })
      const discountUpsertedList =
        await this.discountRepository.insertManyFullFieldAndReturnEntity(discountListDto)
      regimen.discountList = discountUpsertedList
      this.socketEmitService.discountListChange(oid, {
        discountUpsertedList,
        discountDestroyedList,
      })
    }

    return { regimen }
  }

  async destroyOne(oid: number, regimenId: number): Promise<BaseResponse> {
    const ticketRegimenList = await this.ticketRegimenRepository.findMany({
      condition: { oid, regimenId },
      limit: 10,
    })
    if (ticketRegimenList.length > 0) {
      return {
        data: { ticketRegimenList, regimenId },
        success: false,
      }
    }

    const [regimenItemDestroyedList, positionDestroyedList, discountDestroyedList] =
      await Promise.all([
        this.regimenItemRepository.deleteAndReturnEntity({
          oid,
          regimenId,
        }),
        this.positionRepository.deleteAndReturnEntity({
          oid,
          positionInteractId: regimenId,
          positionType: PositionInteractType.Regimen,
        }),
        this.discountRepository.deleteAndReturnEntity({
          oid,
          discountInteractId: regimenId,
          discountInteractType: DiscountInteractType.Regimen,
        }),
      ])

    if (positionDestroyedList.length) {
      this.socketEmitService.positionListChange(oid, { positionDestroyedList })
    }

    if (discountDestroyedList.length) {
      this.socketEmitService.discountListChange(oid, { discountDestroyedList })
    }

    const regimen = await this.regimenRepository.deleteOneAndReturnEntity({
      oid,
      id: regimenId,
    })

    return { data: { ticketRegimenList: [], regimenId } }
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
          positionType: PositionInteractType.Regimen,
          positionInteractId: { IN: regimenIdList },
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

    regimenList.forEach((regimen: Regimen) => {
      if (relation?.positionList) {
        regimen.positionList = positionList.filter((i) => i.positionInteractId === regimen.id)
      }
      if (relation?.discountList) {
        regimen.discountList = discountList.filter((i) => i.discountInteractId === regimen.id)
        regimen.discountListExtra = discountList.filter((i) => i.discountInteractId === 0)
      }
      if (relation?.regimenItemList) {
        regimen.regimenItemList = regimenItemList.filter((i) => i.regimenId === regimen.id)
      }
    })

    return regimenList
  }
}
