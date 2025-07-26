import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { BusinessError } from '../../../common/error'
import { PaymentMoneyStatus } from '../../../common/variable'
import TicketProcedure from '../../../entities/ticket-procedure.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProcedureManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

export type TicketProcedureUpdateDtoType = {
  [K in keyof Pick<
    TicketProcedure,
    | 'quantity'
    | 'expectedPrice'
    | 'discountType'
    | 'discountMoney'
    | 'discountPercent'
    | 'actualPrice'
  >]: TicketProcedure[K] | (() => string)
}

@Injectable()
export class TicketClinicUpdateTicketProcedureOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateTicketProcedure<T extends TicketProcedureUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketProcedureId: number
    ticketProcedureUpdateDto?: NoExtra<TicketProcedureUpdateDtoType, T>
  }) {
    const { oid, ticketId, ticketProcedureId, ticketProcedureUpdateDto } = params
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
        id: ticketProcedureId,
      })

      if (ticketProcedureOrigin.paymentMoneyStatus === PaymentMoneyStatus.Paid) {
        throw new BusinessError('Dịch vụ đã thanh toán không thể sửa')
      }

      let ticketProcedure: TicketProcedure = ticketProcedureOrigin
      let procedureMoneyChange = 0
      let itemsDiscountChange = 0
      if (ticketProcedureUpdateDto) {
        ticketProcedure = await this.ticketProcedureManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticketProcedureId },
          {
            quantity: ticketProcedureUpdateDto.quantity,
            expectedPrice: ticketProcedureUpdateDto.expectedPrice,
            discountType: ticketProcedureUpdateDto.discountType,
            discountMoney: ticketProcedureUpdateDto.discountMoney,
            discountPercent: ticketProcedureUpdateDto.discountPercent,
            actualPrice: ticketProcedureUpdateDto.actualPrice,
          }
        )
        procedureMoneyChange =
          ticketProcedure.quantity * ticketProcedure.actualPrice
          - ticketProcedureOrigin.quantity * ticketProcedureOrigin.actualPrice
        itemsDiscountChange =
          ticketProcedure.quantity * ticketProcedure.discountMoney
          - ticketProcedureOrigin.quantity * ticketProcedureOrigin.discountMoney
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
