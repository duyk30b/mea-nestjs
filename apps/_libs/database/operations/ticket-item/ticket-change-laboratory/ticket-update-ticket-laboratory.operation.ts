import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { BusinessError } from '../../../common/error'
import { PaymentMoneyStatus } from '../../../common/variable'
import TicketLaboratory from '../../../entities/ticket-laboratory.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketLaboratoryManager, TicketManager } from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

export type TicketLaboratoryUpdateDtoType = {
  [K in keyof Pick<
    TicketLaboratory,
    'expectedPrice' | 'discountType' | 'discountMoney' | 'discountPercent' | 'actualPrice'
  >]: TicketLaboratory[K] | (() => string)
}

@Injectable()
export class TicketUpdateTicketLaboratoryOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateTicketLaboratory<T extends TicketLaboratoryUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketLaboratoryId: number
    ticketLaboratoryUpdateDto?: NoExtra<TicketLaboratoryUpdateDtoType, T>
  }) {
    const { oid, ticketId, ticketLaboratoryId, ticketLaboratoryUpdateDto } = params
    const PREFIX = `ticketId=${ticketId} updateTicketLaboratory failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketLaboratoryOrigin = await this.ticketLaboratoryManager.findOneBy(manager, {
        oid,
        id: ticketLaboratoryId,
      })

      if (ticketLaboratoryOrigin.paymentMoneyStatus === PaymentMoneyStatus.Paid) {
        throw new BusinessError('Xét nghiệm đã thanh toán không thể sửa')
      }

      let ticketLaboratory: TicketLaboratory = ticketLaboratoryOrigin
      let laboratoryMoneyChange = 0
      let itemsDiscountChange = 0
      let itemsCostAmountChange = 0
      if (ticketLaboratoryUpdateDto) {
        ticketLaboratory = await this.ticketLaboratoryManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticketLaboratoryId },
          {
            expectedPrice: ticketLaboratoryUpdateDto.expectedPrice,
            discountType: ticketLaboratoryUpdateDto.discountType,
            discountMoney: ticketLaboratoryUpdateDto.discountMoney,
            discountPercent: ticketLaboratoryUpdateDto.discountPercent,
            actualPrice: ticketLaboratoryUpdateDto.actualPrice,
          }
        )
        laboratoryMoneyChange = ticketLaboratory.actualPrice - ticketLaboratoryOrigin.actualPrice
        itemsDiscountChange = ticketLaboratory.discountMoney - ticketLaboratoryOrigin.discountMoney
        itemsCostAmountChange = ticketLaboratory.costPrice - ticketLaboratoryOrigin.costPrice
      }

      // === 5. UPDATE TICKET: MONEY  ===
      let ticket: Ticket = ticketOrigin
      if (laboratoryMoneyChange != 0 || itemsDiscountChange != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            laboratoryMoneyAdd: laboratoryMoneyChange,
            itemsDiscountAdd: itemsDiscountChange,
            itemsCostAmountAdd: itemsCostAmountChange,
          },
        })
      }
      return { ticket, ticketLaboratory }
    })

    return transaction
  }
}
