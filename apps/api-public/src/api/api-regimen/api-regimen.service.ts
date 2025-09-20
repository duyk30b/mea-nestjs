import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { BusinessError } from '../../../../_libs/database/common/error'
import { Discount, Procedure, Regimen, RegimenItem } from '../../../../_libs/database/entities'
import {
  DiscountInsertType,
  DiscountInteractType,
} from '../../../../_libs/database/entities/discount.entity'
import Position, {
  PositionInsertType,
  PositionType,
} from '../../../../_libs/database/entities/position.entity'
import { RegimenItemInsertType } from '../../../../_libs/database/entities/regimen-item.entity'
import {
  DiscountRepository,
  PositionRepository,
  ProcedureRepository,
  RegimenItemRepository,
} from '../../../../_libs/database/repositories'
import { RegimenRepository } from '../../../../_libs/database/repositories/regimen.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { DiscountUpdateBody } from '../api-discount/request'
import { PositionBasicBody } from '../api-position/request'
import {
  RegimenGetManyQuery,
  RegimenGetOneQuery,
  RegimenItemBody,
  RegimenPaginationQuery,
  RegimenRelationQuery,
  RegimenUpsertWrapBody,
} from './request'

@Injectable()
export class ApiRegimenService {
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
    const {
      positionRequestList,
      discountList,
      regimen: regimenBody,
      regimenItemList: regimenItemListBody,
    } = body
    let code = regimenBody.code
    if (!code) {
      const count = await this.regimenRepository.getMaxId()
      code = (count + 1).toString()
    }

    const existRegimen = await this.regimenRepository.findOneBy({ oid, code })
    if (existRegimen) {
      throw new BusinessError(`Trùng mã dịch vụ với ${existRegimen.name}`)
    }

    const regimen = await this.regimenRepository.insertOneFullFieldAndReturnEntity({
      ...regimenBody,
      oid,
      code,
    })

    await this.insertRelation({
      oid,
      regimen,
      regimenItemListBody,
      discountList,
      positionRequestList,
    })

    this.socketEmitService.masterDataChange(oid, {
      Regimen: true,
      Position: true,
      Discount: true,
    })

    return { regimen }
  }

  async updateOne(oid: number, regimenId: number, body: RegimenUpsertWrapBody) {
    const {
      positionRequestList,
      discountList,
      regimen: regimenBody,
      regimenItemList: regimenItemListBody,
    } = body

    if (regimenBody.code != null) {
      const existRegimen = await this.regimenRepository.findOneBy({
        oid,
        code: regimenBody.code,
        id: { NOT: regimenId },
      })
      if (existRegimen) {
        throw new BusinessError(`Trùng mã dịch vụ với ${existRegimen.name}`)
      }
    }

    const regimen = await this.regimenRepository.updateOneAndReturnEntity(
      { oid, id: regimenId },
      regimenBody
    )

    await Promise.all([
      this.regimenItemRepository.delete({ oid, regimenId }),
      positionRequestList
        ? this.positionRepository.deleteAndReturnEntity({
          oid,
          positionInteractId: regimen.id,
          positionType: PositionType.RegimenRequest,
        })
        : undefined,
      discountList
        ? await this.discountRepository.deleteAndReturnEntity({
          oid,
          discountInteractId: regimen.id,
          discountInteractType: DiscountInteractType.Regimen,
        })
        : undefined,
    ])

    await this.insertRelation({
      oid,
      regimen,
      regimenItemListBody,
      discountList,
      positionRequestList,
    })

    this.socketEmitService.masterDataChange(oid, {
      Regimen: true,
      Position: true,
      Discount: true,
    })
    return { regimen }
  }

  async insertRelation(data: {
    oid: number
    regimen: Regimen
    regimenItemListBody: RegimenItemBody[]
    positionRequestList: PositionBasicBody[]
    discountList: DiscountUpdateBody[]
  }) {
    const { regimen, oid } = data
    const regimenItemInsertList = data.regimenItemListBody.map((i) => {
      const insert: RegimenItemInsertType = {
        ...i,
        oid,
        regimenId: regimen.id,
      }
      return insert
    })
    regimen.regimenItemList =
      await this.regimenItemRepository.insertManyAndReturnEntity(regimenItemInsertList)

    if (data.positionRequestList) {
      const positionDtoList = data.positionRequestList.map((i) => {
        const dto: PositionInsertType = {
          ...i,
          oid,
          positionInteractId: regimen.id,
          positionType: PositionType.RegimenRequest,
        }
        return dto
      })
      regimen.positionRequestList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
    }

    if (data.discountList) {
      const discountListDto = data.discountList.map((i) => {
        const dto: DiscountInsertType = {
          ...i,
          discountInteractId: regimen.id,
          discountInteractType: DiscountInteractType.Regimen,
          oid,
        }
        return dto
      })
      regimen.discountList =
        await this.discountRepository.insertManyFullFieldAndReturnEntity(discountListDto)
    }

    return { regimen }
  }

  async destroyOne(oid: number, regimenId: number) {
    // const ticketRegimenList = await this.ticketRegimenRepository.findMany({
    //   condition: { oid, regimenId },
    //   limit: 10,
    // })
    const ticketRegimenList = []

    if (!ticketRegimenList.length) {
      await Promise.all([
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

      await this.regimenRepository.deleteOneAndReturnEntity({
        oid,
        id: regimenId,
      })

      this.socketEmitService.masterDataChange(oid, {
        Regimen: true,
        Position: true,
        Discount: true,
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
