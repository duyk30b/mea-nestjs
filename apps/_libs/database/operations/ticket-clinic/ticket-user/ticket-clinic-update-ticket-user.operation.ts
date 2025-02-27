import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import TicketUser from '../../../entities/ticket-user.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketUserManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

export type TicketUserUpdateDtoType = {
  [K in keyof Pick<
    TicketUser,
    | 'commissionCalculatorType'
    | 'commissionMoney'
    | 'commissionPercentActual'
    | 'commissionPercentExpected'
  >]: TicketUser[K] | (() => string)
}

@Injectable()
export class TicketClinicUpdateTicketUserOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketUserManager: TicketUserManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateTicketUser<T extends TicketUserUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketUserId: number
    ticketUserUpdateDto?: NoExtra<TicketUserUpdateDtoType, T>
  }) {
    const { oid, ticketId, ticketUserId, ticketUserUpdateDto } = params
    const PREFIX = `ticketId=${ticketId} updateTicketUser failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET USER ===
      const ticketUserOrigin = await this.ticketUserManager.findOneBy(manager, {
        oid,
        id: ticketUserId,
      })

      const ticketUser = await this.ticketUserManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketUserId },
        {
          commissionCalculatorType: ticketUserUpdateDto.commissionCalculatorType,
          commissionMoney: ticketUserUpdateDto.commissionMoney,
          commissionPercentActual: ticketUserUpdateDto.commissionPercentActual,
          commissionPercentExpected: ticketUserUpdateDto.commissionPercentExpected,
        }
      )
      const commissionMoneyChange =
        ticketUser.commissionMoney * ticketUser.quantity
        - ticketUserOrigin.commissionMoney * ticketUserOrigin.quantity

      // === 5. UPDATE TICKET: MONEY  ===
      let ticket: Ticket = ticketOrigin
      if (commissionMoneyChange != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            commissionMoneyAdd: commissionMoneyChange,
          },
        })
      }
      return { ticket, ticketUser }
    })

    return transaction
  }
}
