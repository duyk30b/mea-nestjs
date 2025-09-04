import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { BaseCondition } from '../../../../common/dto'
import { TicketUser } from '../../../entities'
import { CommissionCalculatorType, PositionType } from '../../../entities/position.entity'
import { TicketManager, TicketUserManager } from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserAddType, TicketUserCommon } from './ticket-user.common'

@Injectable()
export class TicketChangeTicketUserOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketUserCommon: TicketUserCommon,
    private ticketManager: TicketManager,
    private ticketUserManager: TicketUserManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async changeTicketUserList(data: {
    oid: number
    ticketId: number
    createdAt: number
    ticketUserDtoList: TicketUserAddType[]
    destroy?: {
      positionType: PositionType
      ticketItemId: number
      ticketItemChildId: number
    }
  }) {
    const { oid, ticketId, createdAt, ticketUserDtoList } = data
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      let ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        { updatedAt: Date.now() }
      )

      let ticketUserDestroyedList: TicketUser[] = []
      if (data.destroy) {
        ticketUserDestroyedList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
          oid,
          ticketId,
          positionType: data.destroy.positionType,
          ticketItemId: data.destroy.ticketItemId,
          ticketItemChildId: data.destroy.ticketItemChildId,
        })
      }

      const ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
        manager,
        createdAt,
        oid,
        ticketId,
        ticketUserDtoList,
      })

      const commissionMoneyAdd = ticketUserCreatedList.reduce((acc, item) => {
        return acc + item.quantity * item.commissionMoney
      }, 0)
      const commissionMoneyDestroy = ticketUserDestroyedList.reduce((acc, item) => {
        return acc + item.quantity * item.commissionMoney
      }, 0)

      if (commissionMoneyAdd - commissionMoneyDestroy != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin: ticketModified,
          itemMoney: {
            commissionMoneyAdd: commissionMoneyAdd - commissionMoneyDestroy,
          },
        })
      }

      return { ticketModified, ticketUserDestroyedList, ticketUserCreatedList }
    })

    return transaction
  }

  async destroyTicketUserList(data: {
    oid: number
    ticketId: number
    condition: BaseCondition<TicketUser>
  }) {
    const { oid, ticketId, condition } = data
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      let ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        { updatedAt: Date.now() }
      )

      const ticketUserDestroyedList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
        ...condition,
        oid,
        ticketId,
      })

      const commissionMoneyDestroy = ticketUserDestroyedList.reduce((acc, item) => {
        return acc + item.quantity * item.commissionMoney
      }, 0)

      if (commissionMoneyDestroy != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin: ticketModified,
          itemMoney: {
            commissionMoneyAdd: -commissionMoneyDestroy,
          },
        })
      }

      return { ticketModified, ticketUserDestroyedList }
    })

    return transaction
  }

  async updateTicketUserCommission(data: {
    oid: number
    ticketId: number
    ticketUserId: number
    body: {
      commissionCalculatorType: CommissionCalculatorType
      commissionMoney: number
      commissionPercentActual: number
      commissionPercentExpected: number
    }
  }) {
    const { oid, ticketId, ticketUserId, body } = data
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      let ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        { updatedAt: Date.now() }
      )

      const ticketUserOrigin = await this.ticketUserManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketUserId },
        { ticketId } // update lấy transaction
      )

      const ticketUserModified = await this.ticketUserManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketUserId },
        body
      )

      const commissionMoneyAdd =
        ticketUserModified.quantity * ticketUserModified.commissionMoney
        - ticketUserOrigin.quantity * ticketUserOrigin.commissionMoney

      if (commissionMoneyAdd != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin: ticketModified,
          itemMoney: {
            commissionMoneyAdd,
          },
        })
      }

      return { ticketModified, ticketUserModified }
    })

    return transaction
  }
}
