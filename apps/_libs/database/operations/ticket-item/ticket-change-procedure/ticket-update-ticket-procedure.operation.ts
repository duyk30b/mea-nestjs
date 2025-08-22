import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { PaymentMoneyStatus, TicketProcedureStatus } from '../../../common/variable'
import { TicketProcedureItem } from '../../../entities'
import { TicketProcedureItemInsertType } from '../../../entities/ticket-procedure-item.entity'
import TicketProcedure from '../../../entities/ticket-procedure.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import {
  TicketManager,
  TicketProcedureItemManager,
  TicketProcedureManager,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

export type TIcketProcedureItemUpdateType = Pick<TicketProcedureItem, 'id' | 'completedAt'>

export type TicketProcedureUpdateDtoType = {
  [K in keyof Pick<
    TicketProcedure,
    | 'quantity'
    | 'totalSessions'
    | 'expectedPrice'
    | 'discountType'
    | 'discountMoney'
    | 'discountPercent'
    | 'actualPrice'
  >]: TicketProcedure[K] | (() => string)
}

@Injectable()
export class TicketUpdateTicketProcedureOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketProcedureItemManager: TicketProcedureItemManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateTicketProcedure<T extends TicketProcedureUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketProcedureId: number
    ticketProcedureUpdateDto?: NoExtra<TicketProcedureUpdateDtoType, T>
    ticketProcedureItemUpdateList?: TIcketProcedureItemUpdateType[]
  }) {
    const {
      oid,
      ticketId,
      ticketProcedureId,
      ticketProcedureUpdateDto,
      ticketProcedureItemUpdateList,
    } = params
    const PREFIX = `ticketId=${ticketId} updateTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketProcedureOrigin = await this.ticketProcedureManager.findOneBy(manager, {
        oid,
        ticketId,
        id: ticketProcedureId,
      })

      let ticketProcedure: TicketProcedure = ticketProcedureOrigin
      let procedureMoneyChange = 0
      let itemsDiscountChange = 0
      if (ticketProcedureUpdateDto) {
        if (ticketProcedureOrigin.paymentMoneyStatus !== PaymentMoneyStatus.Paid) {
          ticketProcedure = await this.ticketProcedureManager.updateOneAndReturnEntity(
            manager,
            { oid, id: ticketProcedureId },
            {
              quantity: ticketProcedureUpdateDto.quantity,
              totalSessions: ticketProcedureUpdateDto.totalSessions,
              expectedPrice: ticketProcedureUpdateDto.expectedPrice,
              discountType: ticketProcedureUpdateDto.discountType,
              discountMoney: ticketProcedureUpdateDto.discountMoney,
              discountPercent: ticketProcedureUpdateDto.discountPercent,
              actualPrice: ticketProcedureUpdateDto.actualPrice,
            }
          )
        } else {
          ticketProcedure = await this.ticketProcedureManager.updateOneAndReturnEntity(
            manager,
            { oid, id: ticketProcedureId },
            { totalSessions: ticketProcedureUpdateDto.totalSessions }
          )
        }

        procedureMoneyChange =
          ticketProcedure.quantity * ticketProcedure.actualPrice
          - ticketProcedureOrigin.quantity * ticketProcedureOrigin.actualPrice
        itemsDiscountChange =
          ticketProcedure.quantity * ticketProcedure.discountMoney
          - ticketProcedureOrigin.quantity * ticketProcedureOrigin.discountMoney
      }

      if (ticketProcedureUpdateDto.totalSessions && ticketProcedureItemUpdateList) {
        await this.ticketProcedureItemManager.delete(manager, {
          oid,
          ticketId,
          ticketProcedureId,
          status: { NOT: TicketProcedureStatus.Completed },
          id: { NOT_IN: [0, ...ticketProcedureItemUpdateList.map((i) => i.id)] },
        })

        const tpiInsertList = ticketProcedureItemUpdateList
          .filter((i) => !i.id)
          .map((i) => {
            const insert: TicketProcedureItemInsertType = {
              ...i,
              status: TicketProcedureStatus.Pending,
              imageIds: '[]',
              oid,
              ticketId,
              ticketProcedureId,
              result: '',
            }
            return insert
          })
        if (tpiInsertList.length) {
          await this.ticketProcedureItemManager.insertMany(manager, tpiInsertList)
        }

        const tpiUpdateList = ticketProcedureItemUpdateList.filter((i) => i.id)
        if (tpiUpdateList.length) {
          await this.ticketProcedureItemManager.bulkUpdate({
            manager,
            condition: { oid, ticketId, ticketProcedureId },
            compare: ['id'],
            tempList: tpiUpdateList,
            update: ['completedAt'],
            options: { requireEqualLength: true },
          })
        }

        ticketProcedure.ticketProcedureItemList = await this.ticketProcedureItemManager.findMany(
          manager,
          {
            condition: { oid, ticketId, ticketProcedureId },
            sort: { id: 'ASC' },
          }
        )
      }

      // === 5. UPDATE TICKET: MONEY  ===
      let ticket: Ticket = ticketOrigin
      if (procedureMoneyChange != 0 || itemsDiscountChange != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            procedureMoneyAdd: procedureMoneyChange,
            itemsDiscountAdd: itemsDiscountChange,
          },
        })
      }
      return { ticket, ticketProcedure }
    })

    return transaction
  }
}
