import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { BusinessError } from '../../../common/error'
import { PaymentMoneyStatus } from '../../../common/variable'
import TicketRadiology from '../../../entities/ticket-radiology.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketRadiologyManager } from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

export type TicketRadiologyUpdateDtoType = {
  [K in keyof Pick<
    TicketRadiology,
    | 'expectedPrice'
    | 'discountType'
    | 'discountMoney'
    | 'discountPercent'
    | 'actualPrice'
  >]?: TicketRadiology[K] | (() => string)
}

@Injectable()
export class TicketUpdateTicketRadiologyOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketRadiologyManager: TicketRadiologyManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateMoneyTicketRadiology<T extends TicketRadiologyUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketRadiologyId: number
    ticketRadiologyUpdateDto: NoExtra<TicketRadiologyUpdateDtoType, T>
  }) {
    const { oid, ticketId, ticketRadiologyId, ticketRadiologyUpdateDto } = params

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketRadiologyOrigin = await this.ticketRadiologyManager.findOneBy(manager, {
        oid,
        id: ticketRadiologyId,
      })

      if (ticketRadiologyOrigin.paymentMoneyStatus === PaymentMoneyStatus.Paid) {
        throw new BusinessError('Phiếu đã thanh toán không thể sửa')
      }

      let ticketRadiology: TicketRadiology = ticketRadiologyOrigin
      if (ticketRadiologyUpdateDto) {
        ticketRadiology = await this.ticketRadiologyManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticketRadiologyId },
          {
            expectedPrice: ticketRadiologyUpdateDto.expectedPrice,
            discountType: ticketRadiologyUpdateDto.discountType,
            discountMoney: ticketRadiologyUpdateDto.discountMoney,
            discountPercent: ticketRadiologyUpdateDto.discountPercent,
            actualPrice: ticketRadiologyUpdateDto.actualPrice,
          }
        )
      }

      const radiologyMoneyChange = ticketRadiology.actualPrice - ticketRadiologyOrigin.actualPrice
      const itemsDiscountChange =
        ticketRadiology.discountMoney - ticketRadiologyOrigin.discountMoney
      const itemsCostAmountChange = ticketRadiology.costPrice - ticketRadiologyOrigin.costPrice

      // === 5. UPDATE TICKET: MONEY  ===
      let ticket: Ticket = ticketOrigin
      if (radiologyMoneyChange != 0 || itemsDiscountChange != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            radiologyMoneyAdd: radiologyMoneyChange,
            itemsDiscountAdd: itemsDiscountChange,
            itemsCostAmountAdd: itemsCostAmountChange,
          },
        })
      }
      return { ticket, ticketRadiology }
    })

    return transaction
  }
}
