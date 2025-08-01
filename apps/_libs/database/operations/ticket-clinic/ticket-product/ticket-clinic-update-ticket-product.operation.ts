import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus, PaymentMoneyStatus } from '../../../common/variable'
import { TicketProduct } from '../../../entities'
import { TicketProductType } from '../../../entities/ticket-product.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProductManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

export type TicketProductUpdateDtoType = {
  [K in keyof Pick<
    TicketProduct,
    | 'quantity'
    | 'quantityPrescription'
    | 'printPrescription'
    | 'expectedPrice'
    | 'discountType'
    | 'discountMoney'
    | 'discountPercent'
    | 'costAmount'
    | 'actualPrice'
    | 'hintUsage'
  >]: TicketProduct[K] | (() => string)
}

@Injectable()
export class TicketClinicUpdateTicketProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProductManager: TicketProductManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateTicketProduct<T extends TicketProductUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketProductId: number
    ticketProductType: TicketProductType
    ticketProductUpdateDto?: NoExtra<TicketProductUpdateDtoType, T>
  }) {
    const { oid, ticketId, ticketProductId, ticketProductType, ticketProductUpdateDto } = params
    const PREFIX = `ticketId=${ticketId} updateTicketProduct failed: `

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PRODUCT ===
      const ticketProductOrigin = await this.ticketProductManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketProductId, type: ticketProductType },
        { ticketId }
      )

      let ticketProductModified: TicketProduct = ticketProductOrigin
      let productMoneyChange = 0
      let itemsDiscountChange = 0
      let itemsCostAmountChange = 0
      if (ticketProductUpdateDto) {
        if (
          [DeliveryStatus.Pending, DeliveryStatus.NoStock].includes(
            ticketProductOrigin.deliveryStatus
          )
          && [PaymentMoneyStatus.NoEffect, PaymentMoneyStatus.Pending].includes(
            ticketProductOrigin.paymentMoneyStatus
          )
        ) {
          ticketProductModified = await this.ticketProductManager.updateOneAndReturnEntity(
            manager,
            { oid, id: ticketProductId },
            {
              quantity: ticketProductUpdateDto.quantity,
              quantityPrescription: ticketProductUpdateDto.quantityPrescription,
              printPrescription: ticketProductUpdateDto.printPrescription,
              expectedPrice: ticketProductUpdateDto.expectedPrice,
              discountType: ticketProductUpdateDto.discountType,
              discountMoney: ticketProductUpdateDto.discountMoney,
              discountPercent: ticketProductUpdateDto.discountPercent,
              costAmount: ticketProductUpdateDto.costAmount,
              actualPrice: ticketProductUpdateDto.actualPrice,
              hintUsage: ticketProductUpdateDto.hintUsage,
              deliveryStatus:
                ticketProductUpdateDto.quantity === 0
                  ? DeliveryStatus.NoStock
                  : DeliveryStatus.Pending,
            }
          )
          productMoneyChange =
            ticketProductModified.quantity * ticketProductModified.actualPrice
            - ticketProductOrigin.quantity * ticketProductOrigin.actualPrice
          itemsDiscountChange =
            ticketProductModified.quantity * ticketProductModified.discountMoney
            - ticketProductOrigin.quantity * ticketProductOrigin.discountMoney
          itemsCostAmountChange = ticketProductModified.costAmount - ticketProductOrigin.costAmount
        } else {
          ticketProductModified = await this.ticketProductManager.updateOneAndReturnEntity(
            manager,
            { oid, id: ticketProductId },
            {
              quantityPrescription: ticketProductUpdateDto.quantityPrescription,
              printPrescription: ticketProductUpdateDto.printPrescription,
              hintUsage: ticketProductUpdateDto.hintUsage,
            }
          )
        }
      }

      // === 4. ReCalculator DeliveryStatus
      let deliveryStatus = ticketOrigin.deliveryStatus
      if (ticketProductModified.deliveryStatus !== DeliveryStatus.Delivered) {
        if (ticketProductModified.quantity === 0) {
          const calc = await this.ticketProductManager.calculatorDeliveryStatus({
            manager,
            oid,
            ticketId,
          })
          deliveryStatus = calc.deliveryStatus
        } else {
          deliveryStatus = DeliveryStatus.Pending
        }
      }

      // === 5. UPDATE TICKET: MONEY  ===
      let ticket: Ticket = ticketOrigin
      if (productMoneyChange != 0 || itemsDiscountChange != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            productMoneyAdd: productMoneyChange,
            itemsCostAmountAdd: itemsCostAmountChange,
            itemsDiscountAdd: itemsDiscountChange,
          },
          other: { deliveryStatus },
        })
      }
      return { ticket, ticketProduct: ticketProductModified }
    })

    return transaction
  }
}
