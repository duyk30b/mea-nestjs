import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus, TicketItemPaymentType } from '../../../common/variable'
import { TicketProduct, TicketUser } from '../../../entities'
import { PositionType } from '../../../entities/position.entity'
import { TicketProductType } from '../../../entities/ticket-product.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import {
    TicketProductRepository,
    TicketRepository,
    TicketUserRepository,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../ticket-change-user/ticket-user.common'

export type TicketProductUpdateDtoType = {
  [K in keyof Pick<
    TicketProduct,
    | 'unitRate'
    | 'quantity'
    | 'quantityPrescription'
    | 'printPrescription'
    | 'unitExpectedPrice'
    | 'discountType'
    | 'unitDiscountMoney'
    | 'discountPercent'
    | 'unitActualPrice'
    | 'hintUsage'
  >]: TicketProduct[K] | (() => string)
}

@Injectable()
export class TicketUpdateTicketProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketUserCommon: TicketUserCommon
  ) {}

  async updateTicketProduct<T extends TicketProductUpdateDtoType>(params: {
    oid: number
    ticketId: string
    ticketProductId: string
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
      const ticketOrigin = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )
      let ticketModified: Ticket = ticketOrigin

      // === 2. UPDATE TICKET PRODUCT ===
      const ticketProductOrigin = await this.ticketProductRepository.managerUpdateOne(
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
          ticketProductOrigin.quantityCompleted === 0
          && [
            TicketItemPaymentType.TicketPaid,
            TicketItemPaymentType.PendingPayment,
            TicketItemPaymentType.NoEffect,
          ].includes(ticketProductOrigin.ticketItemPaymentType)
        ) {
          ticketProductModified = await this.ticketProductRepository.managerUpdateOne(
            manager,
            { oid, id: ticketProductId },
            {
              unitRate: ticketProductUpdateDto.unitRate,
              quantity: ticketProductUpdateDto.quantity,
              quantityPrescription: ticketProductUpdateDto.quantityPrescription,
              printPrescription: ticketProductUpdateDto.printPrescription,
              unitExpectedPrice: ticketProductUpdateDto.unitExpectedPrice,
              discountType: ticketProductUpdateDto.discountType,
              unitDiscountMoney: ticketProductUpdateDto.unitDiscountMoney,
              discountPercent: ticketProductUpdateDto.discountPercent,
              unitActualPrice: ticketProductUpdateDto.unitActualPrice,
              hintUsage: ticketProductUpdateDto.hintUsage,
              ticketItemPaymentType: (() => {
                if (ticketProductUpdateDto.unitActualPrice === 0) {
                  return TicketItemPaymentType.NoEffect
                }
                if (ticketOrigin.isPaymentEachItem) {
                  return TicketItemPaymentType.PendingPayment
                } else {
                  return TicketItemPaymentType.TicketPaid
                }
              })(),
            }
          )
          productMoneyAdd =
            (ticketProductModified.quantity * ticketProductModified.unitActualPrice)
              / ticketProductModified.unitRate
            - (ticketProductOrigin.quantity * ticketProductOrigin.unitActualPrice)
              / ticketProductOrigin.unitRate
          itemsDiscountAdd =
            (ticketProductModified.quantity * ticketProductModified.unitDiscountMoney)
              / ticketProductModified.unitRate
            - (ticketProductOrigin.quantity * ticketProductOrigin.unitDiscountMoney)
              / ticketProductOrigin.unitRate
          itemsCostAmountAdd = ticketProductModified.costAmount - ticketProductOrigin.costAmount
        } else {
          ticketProductModified = await this.ticketProductRepository.managerUpdateOne(
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
        ticketUserDestroyList = await this.ticketUserRepository.managerDelete(manager, {
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
              positionInteractId: ticketProductModified.productId,
              ticketItemExpectedPrice: Math.round(
                ticketProductModified.unitExpectedPrice / ticketProductModified.unitRate
              ),
              ticketItemActualPrice: Math.round(
                ticketProductModified.unitActualPrice / ticketProductModified.unitRate
              ),
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
      if (ticketProductModified.quantityCompleted == 0) {
        if (ticketProductModified.quantity === 0) {
          const calc = await this.ticketProductRepository.calculatorDeliveryStatus({
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
