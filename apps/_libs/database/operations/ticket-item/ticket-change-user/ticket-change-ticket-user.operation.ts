import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { TicketUser } from '../../../entities'
import { CommissionCalculatorType, PositionType } from '../../../entities/position.entity'
import {
  TicketManager,
  TicketProcedureManager,
  TicketRegimenManager,
  TicketUserManager,
} from '../../../repositories'
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
    private ticketProcedureManager: TicketProcedureManager,
    private ticketRegimenManager: TicketRegimenManager,
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

  async destroyTicketUser(data: { oid: number; ticketId: number; ticketUserId: number }) {
    const { oid, ticketId, ticketUserId } = data
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      let ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        { updatedAt: Date.now() }
      )

      const ticketUserDestroyed = await this.ticketUserManager.deleteOneAndReturnEntity(manager, {
        oid,
        ticketId,
        id: ticketUserId,
      })

      const commissionMoneyDestroy =
        ticketUserDestroyed.quantity * ticketUserDestroyed.commissionMoney

      if (commissionMoneyDestroy != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin: ticketModified,
          itemMoney: {
            commissionMoneyAdd: -commissionMoneyDestroy,
          },
        })

        if (
          [PositionType.ProcedureRequest, PositionType.ProcedureResult].includes(
            ticketUserDestroyed.positionType
          )
        ) {
          const ticketProcedureModified =
            await this.ticketProcedureManager.updateOneAndReturnEntity(
              manager,
              { oid, ticketId, id: ticketUserDestroyed.ticketItemId },
              { commissionAmount: () => `commissionAmount - ${commissionMoneyDestroy}` }
            )
          if (ticketProcedureModified.ticketRegimenId) {
            await this.ticketRegimenManager.updateOneAndReturnEntity(
              manager,
              { oid, id: ticketProcedureModified.ticketRegimenId },
              { commissionAmount: () => `commissionAmount - ${commissionMoneyDestroy}` }
            )
          }
        }
      }

      return { ticketModified, ticketUserDestroyed }
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
