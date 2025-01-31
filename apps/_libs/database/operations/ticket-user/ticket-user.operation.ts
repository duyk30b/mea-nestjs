import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { InteractType } from '../../entities/commission.entity'
import TicketUser from '../../entities/ticket-user.entity'
import Ticket from '../../entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../ticket-base/ticket-change-item-money.manager'
import { TicketUserChangeListManager } from './ticket-user-change-list.manager'

@Injectable()
export class TicketUserOperation {
  constructor(
    private dataSource: DataSource,
    private ticketUserChangeListManager: TicketUserChangeListManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async addTicketUserListAndReCalculatorTicketMoney(params: {
    oid: number
    ticketOrigin: Ticket
    ticketUserDto: { roleId: number; userId: number }[]
  }) {
    const { oid, ticketOrigin, ticketUserDto } = params

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      let commissionMoneyAdd = 0
      let ticketUserInsertList: TicketUser[] = []
      if (ticketUserDto.length) {
        ticketUserInsertList = await this.ticketUserChangeListManager.insertList({
          manager,
          information: {
            oid,
            ticketId: ticketOrigin.id,
            interactType: InteractType.Ticket,
            interactId: 0,
            ticketItemId: 0,
            quantity: 1,
            ticketItemActualPrice: 0,
            ticketItemExpectedPrice: 0,
          },
          dataInsert: ticketUserDto,
        })

        commissionMoneyAdd = ticketUserInsertList.reduce((acc, item) => {
          return acc + item.commissionMoney * item.quantity
        }, 0)
      }

      // === 5. UPDATE TICKET: MONEY  ===
      let ticket: Ticket = ticketOrigin
      if (commissionMoneyAdd != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            commissionMoneyAdd,
          },
        })
      }
      return { ticket, ticketUserInsertList }
    })

    return transaction
  }
}
