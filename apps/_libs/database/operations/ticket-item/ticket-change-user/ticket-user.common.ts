import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { ESArray, NoExtra } from '../../../../common/helpers'
import { BusinessError } from '../../../common/error'
import Position, { CommissionCalculatorType } from '../../../entities/position.entity'
import TicketUser, { TicketUserInsertType } from '../../../entities/ticket-user.entity'
import {
  PositionRepository,
  TicketUserRepository,
} from '../../../repositories'

export type TicketUserAddType = Pick<
  TicketUser,
  | 'positionId'
  | 'userId'
  | 'ticketItemId'
  | 'positionInteractId' // không lấy theo position được vì nó có thể bằng 0 trong trường hợp tất cả,
  | 'ticketItemExpectedPrice'
  | 'ticketItemActualPrice'
  | 'quantity'
>

@Injectable()
export class TicketUserCommon {
  constructor(
    private ticketUserRepository: TicketUserRepository,
    private positionRepository: PositionRepository
  ) { }

  async addTicketUserList<T extends TicketUserAddType>(data: {
    manager: EntityManager
    oid: number
    ticketId: string
    createdAt: number
    ticketUserDtoList: NoExtra<TicketUserAddType, T>[]
  }) {
    const { manager, oid, ticketId, createdAt, ticketUserDtoList } = data

    let positionMap: Record<string, Position> = {}

    if (ticketUserDtoList.length) {
      const positionList = await this.positionRepository.managerFindManyBy(manager, {
        oid,
        id: { IN: ticketUserDtoList.map((i) => i.positionId) },
      })
      positionMap = ESArray.arrayToKeyValue(positionList, 'id')
    }

    const ticketUserInsertList = ticketUserDtoList.map((i) => {
      const position = positionMap[i.positionId]
      if (!position) {
        throw new BusinessError(`Không tồn tại Position tương ứng ${i.positionId}`)
      }
      const ticketUserInsert: TicketUserInsertType = {
        oid,
        ticketId,
        roleId: position.roleId,
        userId: i.userId,
        positionId: i.positionId,
        positionType: position.positionType,
        positionInteractId: i.positionInteractId, // không lấy theo position được vì nó có thể bằng 0 trong trường hợp tất cả,
        ticketItemId: i.ticketItemId,
        ticketItemExpectedPrice: i.ticketItemExpectedPrice,
        ticketItemActualPrice: i.ticketItemActualPrice,
        quantity: i.quantity,
        createdAt,
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
      TicketUser.reCalculatorCommission(ticketUserInsert as TicketUser)
      return ticketUserInsert
    })

    const ticketUserCreatedList = await this.ticketUserRepository.managerInsertMany(
      manager,
      ticketUserInsertList
    )

    return ticketUserCreatedList
  }
}
