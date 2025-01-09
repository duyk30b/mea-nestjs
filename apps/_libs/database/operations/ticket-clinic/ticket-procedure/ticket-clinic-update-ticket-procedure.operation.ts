import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { InteractType } from '../../../entities/commission.entity'
import TicketProcedure from '../../../entities/ticket-procedure.entity'
import TicketUser from '../../../entities/ticket-user.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProcedureManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserChangeListManager } from '../../ticket-user/ticket-user-change-list.manager'

export type TicketProcedureUpdateDtoType = {
  [K in keyof Pick<TicketProcedure, 'quantity'>]: TicketProcedure[K] | (() => string)
}

@Injectable()
export class TicketClinicUpdateTicketProcedureOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketUserChangeListManager: TicketUserChangeListManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateTicketProcedure<T extends TicketProcedureUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketProcedureId: number
    ticketProcedureUpdateDto?: NoExtra<TicketProcedureUpdateDtoType, T>
    ticketUserDto?: { roleId: number; userId: number }[]
  }) {
    const { oid, ticketId, ticketProcedureId, ticketProcedureUpdateDto, ticketUserDto } = params
    const PREFIX = `ticketId=${ticketId} updateTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketProcedureOrigin = await this.ticketProcedureManager.findOneBy(manager, {
        oid,
        id: ticketProcedureId,
      })

      let ticketProcedure: TicketProcedure = ticketProcedureOrigin
      let procedureMoneyChange = 0
      if (ticketProcedureUpdateDto) {
        ticketProcedure = await this.ticketProcedureManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticketProcedureId },
          { quantity: ticketProcedureUpdateDto.quantity }
        )
        procedureMoneyChange =
          ticketProcedure.quantity * ticketProcedure.actualPrice
          - ticketProcedureOrigin.quantity * ticketProcedureOrigin.actualPrice
      }

      let commissionMoneyChange = 0
      let ticketUserChangeList: {
        ticketUserDestroyList: TicketUser[]
        ticketUserUpdateList: TicketUser[]
        ticketUserInsertList: TicketUser[]
      }
      if (ticketUserDto) {
        ticketUserChangeList = await this.ticketUserChangeListManager.changeList({
          manager,
          information: {
            oid,
            ticketId,
            interactType: InteractType.Procedure,
            interactId: ticketProcedureOrigin.procedureId,
            ticketItemId: ticketProcedureOrigin.id,
            ticketItemActualPrice: ticketProcedure.actualPrice,
            ticketItemExpectedPrice: ticketProcedure.expectedPrice,
          },
          dataChange: ticketUserDto,
        })
        const commissionMoneyDelete = ticketUserChangeList.ticketUserDestroyList.reduce(
          (acc, item) => {
            return acc + item.commissionMoney
          },
          0
        )
        const commissionMoneyAdd = ticketUserChangeList.ticketUserInsertList.reduce((acc, item) => {
          return acc + item.commissionMoney
        }, 0)

        commissionMoneyChange = commissionMoneyAdd - commissionMoneyDelete
      }

      // === 5. UPDATE TICKET: MONEY  ===
      let ticket: Ticket = ticketOrigin
      if (procedureMoneyChange != 0 || commissionMoneyChange != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            procedureMoneyAdd: procedureMoneyChange,
            commissionMoneyAdd: commissionMoneyChange,
          },
        })
      }
      return { ticket, ticketProcedure, ticketUserChangeList }
    })

    return transaction
  }
}
