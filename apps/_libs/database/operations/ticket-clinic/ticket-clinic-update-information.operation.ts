import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DTimer } from '../../../common/helpers/time.helper'
import { Ticket, TicketUser } from '../../entities'
import { InteractType } from '../../entities/commission.entity'
import { TicketManager } from '../../managers'
import { TicketChangeItemMoneyManager } from '../ticket-base/ticket-change-item-money.manager'
import { TicketUserChangeListManager } from '../ticket-user/ticket-user-change-list.manager'

@Injectable()
export class TicketClinicUpdateInformationOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketUserChangeListManager: TicketUserChangeListManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async startUpdate(params: {
    oid: number
    ticketId: number
    information?: {
      registeredAt: number
      customerSourceId: number
      customType: number
    }
    ticketUser: {
      interactType: InteractType
      interactId: number
      ticketItemId: number
      ticketItemActualPrice: number
      ticketItemExpectedPrice: number
      dataChange?: { roleId: number; userId: number }[]
    }
  }) {
    const { oid, ticketId, information } = params
    const PREFIX = `ticketId=${ticketId} TicketClinicUpdateInformationOperation failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        {
          registeredAt: information ? information.registeredAt : undefined,
          customerSourceId: information ? information.customerSourceId : undefined,
          customType: information ? information.customType : undefined,

          year: information ? DTimer.info(information.registeredAt, 7).year : undefined,
          month: information ? DTimer.info(information.registeredAt, 7).month + 1 : undefined,
          date: information ? DTimer.info(information.registeredAt, 7).date : undefined,
          updatedAt: Date.now(),
        }
      )

      let commissionMoneyChange = 0
      let ticketUserChangeList: {
        ticketUserDestroyList: TicketUser[]
        ticketUserInsertList: TicketUser[]
      }

      if (params.ticketUser) {
        ticketUserChangeList = await this.ticketUserChangeListManager.replaceList({
          manager,
          information: {
            oid,
            ticketId,
            interactType: params.ticketUser.interactType,
            interactId: params.ticketUser.interactId,
            ticketItemId: params.ticketUser.ticketItemId,
            quantity: 1,
            ticketItemActualPrice: params.ticketUser.ticketItemActualPrice,
            ticketItemExpectedPrice: params.ticketUser.ticketItemExpectedPrice,
          },
          dataChange: params.ticketUser.dataChange,
        })
        const commissionMoneyDelete = ticketUserChangeList.ticketUserDestroyList.reduce(
          (acc, item) => {
            return acc + item.commissionMoney * item.quantity
          },
          0
        )
        const commissionMoneyAdd = ticketUserChangeList.ticketUserInsertList.reduce((acc, item) => {
          return acc + item.commissionMoney * item.quantity
        }, 0)

        commissionMoneyChange = commissionMoneyAdd - commissionMoneyDelete
      }

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

      return { ticket, ticketUserChangeList }
    })

    return transaction
  }
}
