import { Injectable } from '@nestjs/common'
import { ESArray } from '../../../../_libs/common/helpers'
import {
  Laboratory,
  LaboratoryGroup,
  Position,
  Procedure,
  Product,
  Radiology,
  Regimen,
  Role,
  Ticket,
  TicketUser,
  User,
} from '../../../../_libs/database/entities'
import { PositionType } from '../../../../_libs/database/entities/position.entity'
import {
  LaboratoryGroupRepository,
  LaboratoryRepository,
  PositionRepository,
  ProcedureRepository,
  ProductRepository,
  RadiologyRepository,
  RegimenRepository,
  RoleRepository,
  TicketRepository,
  TicketUserRepository,
  UserRepository,
} from '../../../../_libs/database/repositories'
import {
  TicketUserGetManyQuery,
  TicketUserPaginationQuery,
  TicketUserRelationQuery,
} from './request'

@Injectable()
export class ApiTicketUserService {
  constructor(
    private ticketUserRepository: TicketUserRepository,
    private ticketRepository: TicketRepository,
    private positionRepository: PositionRepository,
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private laboratoryRepository: LaboratoryRepository,
    private laboratoryGroupRepository: LaboratoryGroupRepository,
    private procedureRepository: ProcedureRepository,
    private productRepository: ProductRepository,
    private radiologyRepository: RadiologyRepository,
    private regimenRepository: RegimenRepository
  ) { }

  async pagination(oid: number, query: TicketUserPaginationQuery) {
    const { page, limit, filter, relation, sort } = query

    const { total, data: ticketUserList } = await this.ticketUserRepository.pagination({
      // relation,
      page,
      limit,
      condition: {
        oid,
        userId: filter?.userId,
        roleId: filter?.roleId,
        positionId: filter?.positionId,
        ticketId: filter?.ticketId,
        createdAt: filter?.createdAt,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, ticketUserList, relation: query.relation })
    }

    return { ticketUserList, page, limit, total }
  }

  async getList(oid: number, query: TicketUserGetManyQuery) {
    const { filter, limit, relation, sort } = query

    const ticketUserList = await this.ticketUserRepository.findMany({
      // relation,
      limit,
      condition: {
        oid,
        userId: filter?.userId,
        roleId: filter?.roleId,
        positionId: filter?.positionId,
        ticketId: filter?.ticketId,
        createdAt: filter?.createdAt,
      },
      relationLoadStrategy: 'query',
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, ticketUserList, relation: query.relation })
    }

    return { ticketUserList }
  }

  async sumCommissionMoney(oid: number, query: TicketUserGetManyQuery) {
    const { filter, limit, relation, sort } = query

    const { dataRaws } = await this.ticketUserRepository.findAndSelect({
      condition: {
        oid,
        userId: filter?.userId,
        roleId: filter?.roleId,
        positionId: filter?.positionId,
        ticketId: filter?.ticketId,
        createdAt: filter?.createdAt,
      },
      aggregate: {
        sumCommissionMoney: { SUM: [{ MUL: ['commissionMoney', 'quantity'] }] },
      },
    })

    return { sumCommissionMoney: Number(dataRaws[0]?.sumCommissionMoney) || 0 }
  }

  async generateRelation(options: {
    oid: number
    ticketUserList: TicketUser[]
    relation: TicketUserRelationQuery
  }) {
    const { oid, ticketUserList, relation } = options
    const ticketIdList = ESArray.uniqueArray(ticketUserList.map((i) => i.ticketId))
    const userIdList = ESArray.uniqueArray(ticketUserList.map((i) => i.userId))
    const roleIdList = ESArray.uniqueArray(ticketUserList.map((i) => i.roleId))
    const positionIdList = ESArray.uniqueArray(ticketUserList.map((i) => i.positionId))

    const productIdList = ESArray.uniqueArray(
      ticketUserList
        .filter((i) => i.positionType === PositionType.ProductRequest)
        .map((i) => i.positionInteractId)
    )
    const procedureIdList = ESArray.uniqueArray(
      ticketUserList
        .filter((i) =>
          [PositionType.ProcedureRequest, PositionType.ProcedureResult].includes(i.positionType))
        .map((i) => i.positionInteractId)
    )
    const regimenIdList = ESArray.uniqueArray(
      ticketUserList
        .filter((i) => i.positionType === PositionType.RegimenRequest)
        .map((i) => i.positionInteractId)
    )
    const laboratoryIdList = ESArray.uniqueArray(
      ticketUserList
        .filter((i) => [PositionType.LaboratoryRequest].includes(i.positionType))
        .map((i) => i.positionInteractId)
    )
    const laboratoryGroupIdList = ESArray.uniqueArray(
      ticketUserList
        .filter((i) =>
          [PositionType.LaboratoryGroupRequest, PositionType.LaboratoryGroupResult].includes(
            i.positionType
          ))
        .map((i) => i.positionInteractId)
    )
    const radiologyIdList = ESArray.uniqueArray(
      ticketUserList
        .filter((i) =>
          [PositionType.RadiologyRequest, PositionType.RadiologyResult].includes(i.positionType))
        .map((i) => i.positionInteractId)
    )

    const [
      ticketList,
      userList,
      roleList,
      positionList,
      productList,
      procedureList,
      regimenList,
      laboratoryList,
      laboratoryGroupList,
      radiologyList,
    ] = await Promise.all([
      relation?.ticket && ticketIdList.length
        ? this.ticketRepository.findManyBy({
          oid,
          id: { IN: ticketIdList },
        })
        : <Ticket[]>[],
      relation?.user && userIdList.length
        ? this.userRepository.findManyBy({
          oid,
          id: { IN: userIdList },
        })
        : <User[]>[],
      relation?.role && roleIdList.length
        ? this.roleRepository.findManyBy({
          oid,
          id: { IN: roleIdList },
        })
        : <Role[]>[],
      relation?.position && positionIdList.length
        ? this.positionRepository.findMany({
          condition: {
            oid,
            id: { IN: positionIdList },
          },
        })
        : <Position[]>[],
      relation?.product && productIdList.length
        ? this.productRepository.findManyBy({
          oid,
          id: { IN: productIdList },
        })
        : <Product[]>[],
      relation?.procedure && procedureIdList.length
        ? this.procedureRepository.findManyBy({
          oid,
          id: { IN: procedureIdList },
        })
        : <Procedure[]>[],
      relation?.regimen && regimenIdList.length
        ? this.regimenRepository.findManyBy({
          oid,
          id: { IN: regimenIdList },
        })
        : <Regimen[]>[],
      relation?.laboratory && laboratoryIdList.length
        ? this.laboratoryRepository.findManyBy({
          oid,
          id: { IN: laboratoryIdList },
        })
        : <Laboratory[]>[],
      relation?.laboratoryGroup && laboratoryGroupIdList.length
        ? this.laboratoryGroupRepository.findManyBy({
          oid,
          id: { IN: laboratoryGroupIdList },
        })
        : <LaboratoryGroup[]>[],
      relation?.radiology && radiologyIdList.length
        ? this.radiologyRepository.findManyBy({
          oid,
          id: { IN: radiologyIdList },
        })
        : <Radiology[]>[],
    ])

    const ticketMap = ESArray.arrayToKeyValue(ticketList, 'id')
    const userMap = ESArray.arrayToKeyValue(userList, 'id')
    const roleMap = ESArray.arrayToKeyValue(roleList, 'id')
    const positionMap = ESArray.arrayToKeyValue(positionList, 'id')

    const productMap = ESArray.arrayToKeyValue(productList, 'id')
    const procedureMap = ESArray.arrayToKeyValue(procedureList, 'id')
    const regimenMap = ESArray.arrayToKeyValue(regimenList, 'id')
    const laboratoryMap = ESArray.arrayToKeyValue(laboratoryList, 'id')
    const laboratoryGroupMap = ESArray.arrayToKeyValue(laboratoryGroupList, 'id')
    const radiologyMap = ESArray.arrayToKeyValue(radiologyList, 'id')

    ticketUserList.forEach((ticketUser: TicketUser) => {
      if (relation?.ticket) {
        ticketUser.ticket = ticketMap[ticketUser.ticketId]
      }
      if (relation?.user) {
        ticketUser.user = userMap[ticketUser.userId]
      }
      if (relation?.role) {
        ticketUser.role = roleMap[ticketUser.roleId]
      }
      if (relation?.position) {
        ticketUser.position = positionMap[ticketUser.positionId]
      }
      if (relation?.product && ticketUser.positionType === PositionType.ProductRequest) {
        ticketUser.product = productMap[ticketUser.positionInteractId]
      }
      if (
        relation?.procedure
        && [PositionType.ProcedureRequest, PositionType.ProcedureResult].includes(
          ticketUser.positionType
        )
      ) {
        ticketUser.procedure = procedureMap[ticketUser.positionInteractId]
      }
      if (relation?.regimen && ticketUser.positionType === PositionType.RegimenRequest) {
        ticketUser.regimen = regimenMap[ticketUser.positionInteractId]
      }
      if (relation?.laboratory && ticketUser.positionType === PositionType.LaboratoryRequest) {
        ticketUser.laboratory = laboratoryMap[ticketUser.positionInteractId]
      }
      if (
        relation?.laboratoryGroup
        && [PositionType.LaboratoryGroupRequest, PositionType.LaboratoryGroupResult].includes(
          ticketUser.positionType
        )
      ) {
        ticketUser.laboratoryGroup = laboratoryGroupMap[ticketUser.positionInteractId]
      }
      if (
        relation?.radiology
        && [PositionType.RadiologyRequest, PositionType.RadiologyResult].includes(
          ticketUser.positionType
        )
      ) {
        ticketUser.radiology = radiologyMap[ticketUser.positionInteractId]
      }
    })

    return ticketUserList
  }
}
