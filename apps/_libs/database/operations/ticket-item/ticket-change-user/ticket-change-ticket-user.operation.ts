import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { TicketUser } from '../../../entities'
import { CommissionCalculatorType, PositionType } from '../../../entities/position.entity'
import { TicketProcedureType } from '../../../entities/ticket-procedure.entity'
import {
  TicketProcedureRepository,
  TicketRegimenRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserAddType, TicketUserCommon } from './ticket-user.common'

@Injectable()
export class TicketChangeTicketUserOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketRepository: TicketRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketUserCommon: TicketUserCommon,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async changeTicketUserList(data: {
    oid: number
    ticketId: string
    createdAt: number
    ticketUserDtoList: TicketUserAddType[]
    destroy?: {
      positionType: PositionType
      ticketItemId: string
    }
  }) {
    const { oid, ticketId, createdAt, ticketUserDtoList } = data
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      let ticketModified = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId },
        { updatedAt: Date.now() }
      )

      let ticketUserDestroyedList: TicketUser[] = []
      if (data.destroy) {
        ticketUserDestroyedList = await this.ticketUserRepository.managerDelete(manager, {
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

  async destroyTicketUser(data: { oid: number; ticketId: string; ticketUserId: string }) {
    const { oid, ticketId, ticketUserId } = data
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      let ticketModified = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId },
        { updatedAt: Date.now() }
      )

      const ticketUserDestroyed = await this.ticketUserRepository.managerDeleteOne(manager, {
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
      }

      if (
        commissionMoneyDestroy != 0
        && [PositionType.ProcedureRequest, PositionType.ProcedureResult].includes(
          ticketUserDestroyed.positionType
        )
      ) {
        const ticketProcedureModified = await this.ticketProcedureRepository.managerUpdateOne(
          manager,
          { oid, ticketId, id: ticketUserDestroyed.ticketItemId },
          { commissionAmount: () => `commissionAmount - ${commissionMoneyDestroy}` }
        )
        if (ticketProcedureModified.ticketProcedureType === TicketProcedureType.InRegimen) {
          await this.ticketRegimenRepository.managerUpdateOne(
            manager,
            { oid, id: ticketProcedureModified.ticketRegimenId },
            { commissionAmount: () => `commissionAmount - ${commissionMoneyDestroy}` }
          )
        }
      }

      if (
        commissionMoneyDestroy != 0
        && [PositionType.RegimenRequest].includes(ticketUserDestroyed.positionType)
      ) {
        await this.ticketRegimenRepository.managerUpdateOne(
          manager,
          { oid, id: ticketUserDestroyed.ticketItemId },
          { commissionAmount: () => `commissionAmount - ${commissionMoneyDestroy}` }
        )
      }

      return { ticketModified, ticketUserDestroyed }
    })

    return transaction
  }

  async updateTicketUserCommission(data: {
    oid: number
    ticketId: string
    ticketUserId: string
    body: {
      commissionCalculatorType: CommissionCalculatorType
      commissionMoney: number
      commissionPercentActual: number
      commissionPercentExpected: number
    }
  }) {
    const { oid, ticketId, ticketUserId, body } = data
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      let ticketModified = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId },
        { updatedAt: Date.now() }
      )

      const ticketUserOrigin = await this.ticketUserRepository.managerUpdateOne(
        manager,
        { oid, id: ticketUserId },
        { ticketId } // update lấy transaction
      )

      const ticketUserModified = await this.ticketUserRepository.managerUpdateOne(
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
