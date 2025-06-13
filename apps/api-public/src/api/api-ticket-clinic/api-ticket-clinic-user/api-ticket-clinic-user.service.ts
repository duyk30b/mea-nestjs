import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { CommissionCalculatorType } from '../../../../../_libs/database/entities/position.entity'
import TicketUser, {
    TicketUserInsertType,
} from '../../../../../_libs/database/entities/ticket-user.entity'
import {
    PositionRepository,
    TicketUserManager,
    TicketUserRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketClinicUpdateTicketUserBody } from './request'
import { TicketClinicUpdateTicketUserListBody } from './request/ticket-clinic-update-user-list.body'

@Injectable()
export class ApiTicketClinicUserService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly positionRepository: PositionRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly ticketUserManager: TicketUserManager
  ) { }

  async destroyTicketUser(options: { oid: number; ticketId: number; ticketUserId: number }) {
    const { oid, ticketId, ticketUserId } = options
    const ticketUserDestroyList = await this.ticketUserRepository.deleteAndReturnEntity({
      oid,
      ticketId,
      id: ticketUserId,
    })
    this.socketEmitService.socketTicketUserListChange(oid, {
      ticketId,
      ticketUserDestroyList,
    })

    return { data: true }
  }

  async updateTicketUser(options: {
    oid: number
    ticketId: number
    ticketUserId: number
    body: TicketClinicUpdateTicketUserBody
  }) {
    const { oid, ticketId, ticketUserId, body } = options
    const ticketUserUpdateList = await this.ticketUserRepository.updateAndReturnEntity(
      { oid, ticketId, id: ticketUserId },
      {
        commissionCalculatorType: body.commissionCalculatorType,
        commissionMoney: body.commissionMoney,
        commissionPercentActual: body.commissionPercentActual,
        commissionPercentExpected: body.commissionPercentExpected,
      }
    )
    this.socketEmitService.socketTicketUserListChange(oid, {
      ticketId,
      ticketUserUpsertList: ticketUserUpdateList,
    })
    return { data: true }
  }

  async changeTicketUserList(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateTicketUserListBody
  }) {
    const { oid, ticketId, body } = options

    const tuDestroyBodyList = body.ticketUserList.filter((i) => i.id !== 0 && i.userId === 0) // userId = 0 coi như xóa
    let ticketUserDestroyList: TicketUser[] = []
    if (tuDestroyBodyList.length) {
      ticketUserDestroyList = await this.ticketUserRepository.deleteAndReturnEntity({
        oid,
        id: { IN: tuDestroyBodyList.map((i) => i.id) },
      })
    }

    const tuInsertBodyList = body.ticketUserList.filter((i) => i.id === 0 && i.userId !== 0)
    let ticketUserCreatedList: TicketUser[] = []
    if (tuInsertBodyList.length) {
      const positionList = await this.positionRepository.findManyBy({
        oid,
        positionType: body.positionType,
        positionInteractId: body.positionInteractId,
      })
      const ticketUserInsertList: TicketUserInsertType[] = tuInsertBodyList.map((i) => {
        const position = positionList.find((c) => c.roleId === i.roleId)
        if (!position) {
          throw new BusinessException('error.Conflict')
        }
        const insertDto: TicketUserInsertType = {
          oid,
          ticketId,
          roleId: i.roleId,
          userId: i.userId,
          positionType: body.positionType,
          positionInteractId: body.positionInteractId,
          ticketItemId: body.ticketItemId,
          ticketItemExpectedPrice: 0,
          ticketItemActualPrice: 0,
          quantity: body.quantity,
          createdAt: Date.now(),
          commissionCalculatorType: position.commissionCalculatorType,
          commissionMoney:
            position.commissionCalculatorType === CommissionCalculatorType.VND
              ? position.commissionValue
              : 0,
          commissionPercentActual:
            position.commissionCalculatorType === CommissionCalculatorType.PercentActual
              ? position.commissionValue
              : 0,
          commissionPercentExpected:
            position.commissionCalculatorType === CommissionCalculatorType.PercentExpected
              ? position.commissionValue
              : 0,
        }
        return insertDto
      })
      ticketUserCreatedList =
        await this.ticketUserRepository.insertManyAndReturnEntity(ticketUserInsertList)
    }

    const tuUpdateBodyList = body.ticketUserList.filter((i) => i.id !== 0 && i.userId !== 0)
    let ticketUserModifiedList: TicketUser[] = []
    if (tuUpdateBodyList) {
      const ticketUserUpdateList = tuUpdateBodyList.map((i) => {
        const updateDto: Partial<TicketUser> = {
          oid,
          id: i.id,
          ticketId,
          roleId: i.roleId,
          userId: i.userId,
          quantity: body.quantity,
        }
        return updateDto
      })
      ticketUserModifiedList = await this.ticketUserManager.bulkUpdate({
        manager: this.ticketUserRepository.getManager(),
        condition: { oid },
        compare: ['id', 'ticketId'],
        tempList: ticketUserUpdateList,
        update: ['userId', 'quantity'],
        options: { requireEqualLength: false },
      })
    }

    this.socketEmitService.socketTicketUserListChange(oid, {
      ticketId,
      ticketUserDestroyList,
      ticketUserUpsertList: [...ticketUserCreatedList, ...ticketUserModifiedList],
    })
    return { data: true }
  }
}
