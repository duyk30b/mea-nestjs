import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus, PaymentMoneyStatus } from '../../../common/variable'
import { TicketProduct, TicketUser } from '../../../entities'
import { PositionType } from '../../../entities/position.entity'
import { TicketProductType } from '../../../entities/ticket-product.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProductManager, TicketUserManager } from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../ticket-change-user/ticket-user.common'

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
export class TicketUpdateTicketProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProductManager: TicketProductManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketUserManager: TicketUserManager,
    private ticketUserCommon: TicketUserCommon
  ) { }

  async updateTicketProduct<T extends TicketProductUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketProductId: number
    ticketProductType: TicketProductType
    ticketProductUpdateDto?: NoExtra<TicketProductUpdateDtoType, T>
    ticketUserRequestList?: Pick<TicketUser, 'positionId' | 'userId'>[]
  }) {
    const {
      oid,
      ticketId,
      ticketProductId,
      ticketProductType,
      ticketProductUpdateDto,
      ticketUserRequestList,
    } = params
    const PREFIX = `ticketId=${ticketId} updateTicketProduct failed: `

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )
      let ticketModified: Ticket = ticketOrigin

      // === 2. UPDATE TICKET PRODUCT ===
      const ticketProductOrigin = await this.ticketProductManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketProductId, type: ticketProductType },
        { ticketId }
      )

      let ticketProductModified: TicketProduct = ticketProductOrigin
      let productMoneyAdd = 0
      let itemsDiscountAdd = 0
      let itemsCostAmountAdd = 0
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
          productMoneyAdd =
            ticketProductModified.quantity * ticketProductModified.actualPrice
            - ticketProductOrigin.quantity * ticketProductOrigin.actualPrice
          itemsDiscountAdd =
            ticketProductModified.quantity * ticketProductModified.discountMoney
            - ticketProductOrigin.quantity * ticketProductOrigin.discountMoney
          itemsCostAmountAdd = ticketProductModified.costAmount - ticketProductOrigin.costAmount
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

      let ticketUserDestroyList: TicketUser[] = []
      let ticketUserCreatedList: TicketUser[] = []
      let commissionMoneyAdd = 0
      if (ticketUserRequestList) {
        ticketUserDestroyList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
          oid,
          ticketId,
          positionType: PositionType.ProductRequest,
          ticketItemId: ticketProductModified.id,
        })
        ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
          manager,
          createdAt: ticketProductModified.createdAt,
          oid,
          ticketId,
          ticketUserDtoList: ticketUserRequestList.map((i) => {
            return {
              positionId: i.positionId,
              userId: i.userId,
              quantity: 1,
              ticketItemId: ticketProductModified.id,
              ticketItemChildId: 0,
              positionInteractId: ticketProductModified.productId,
              ticketItemExpectedPrice: ticketProductModified.expectedPrice,
              ticketItemActualPrice: ticketProductModified.actualPrice,
            }
          }),
        })

        commissionMoneyAdd =
          ticketUserCreatedList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
          - ticketUserDestroyList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
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

      if (
        productMoneyAdd != 0
        || itemsDiscountAdd != 0
        || itemsCostAmountAdd != 0
        || commissionMoneyAdd != 0
      ) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            productMoneyAdd,
            itemsCostAmountAdd,
            itemsDiscountAdd,
            commissionMoneyAdd,
          },
          other: { deliveryStatus },
        })
      }
      return {
        ticketModified,
        ticketProductModified,
        ticketUserCreatedList,
        ticketUserDestroyList,
      }
    })

    return transaction
  }
}
