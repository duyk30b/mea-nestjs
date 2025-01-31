import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus } from '../../../common/variable'
import { TicketProduct, TicketUser } from '../../../entities'
import { InteractType } from '../../../entities/commission.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProductManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserChangeListManager } from '../../ticket-user/ticket-user-change-list.manager'

export type TicketProductUpdateDtoType = {
  [K in keyof Pick<
    TicketProduct,
    | 'quantity'
    | 'quantityPrescription'
    | 'expectedPrice'
    | 'discountType'
    | 'discountMoney'
    | 'discountPercent'
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
    private ticketUserChangeListManager: TicketUserChangeListManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateTicketProduct<T extends TicketProductUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketProductId: number
    ticketProductUpdateDto?: NoExtra<TicketProductUpdateDtoType, T>
    ticketUserDto?: { roleId: number; userId: number }[]
  }) {
    const { oid, ticketId, ticketProductId, ticketProductUpdateDto, ticketUserDto } = params
    const PREFIX = `ticketId=${ticketId} updateTicketProduct failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PRODUCT ===
      const ticketProductOrigin = await this.ticketProductManager.findOneBy(manager, {
        oid,
        id: ticketProductId,
      })

      let ticketProduct: TicketProduct = ticketProductOrigin
      let productMoneyChange = 0
      if (ticketProductUpdateDto) {
        if (
          ticketProductOrigin.deliveryStatus === DeliveryStatus.Pending
          || ticketProductOrigin.deliveryStatus === DeliveryStatus.NoStock
        ) {
          ticketProduct = await this.ticketProductManager.updateOneAndReturnEntity(
            manager,
            { oid, id: ticketProductId },
            {
              quantity: ticketProductUpdateDto.quantity,
              quantityPrescription: ticketProductUpdateDto.quantityPrescription,
              expectedPrice: ticketProductUpdateDto.expectedPrice,
              discountType: ticketProductUpdateDto.discountType,
              discountMoney: ticketProductUpdateDto.discountMoney,
              discountPercent: ticketProductUpdateDto.discountPercent,
              actualPrice: ticketProductUpdateDto.actualPrice,
              hintUsage: ticketProductUpdateDto.hintUsage,
              deliveryStatus:
                ticketProductUpdateDto.quantity === 0
                  ? DeliveryStatus.NoStock
                  : DeliveryStatus.Pending,
            }
          )
          productMoneyChange =
            ticketProduct.quantity * ticketProduct.actualPrice
            - ticketProductOrigin.quantity * ticketProductOrigin.actualPrice
        } else {
          ticketProduct = await this.ticketProductManager.updateOneAndReturnEntity(
            manager,
            { oid, id: ticketProductId },
            { hintUsage: ticketProductUpdateDto.hintUsage }
          )
        }
      }

      let commissionMoneyChange = 0
      let ticketUserChangeList: {
        ticketUserDestroyList: TicketUser[]
        ticketUserInsertList: TicketUser[]
      }
      if (ticketUserDto) {
        ticketUserChangeList = await this.ticketUserChangeListManager.replaceList({
          manager,
          information: {
            oid,
            ticketId,
            interactType: InteractType.Product,
            interactId: ticketProductOrigin.productId,
            ticketItemId: ticketProductOrigin.id,
            quantity: ticketProductOrigin.quantity,
            ticketItemActualPrice: ticketProduct.actualPrice,
            ticketItemExpectedPrice: ticketProduct.expectedPrice,
          },
          dataChange: ticketUserDto,
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
      if (productMoneyChange != 0 || commissionMoneyChange != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            productMoneyAdd: productMoneyChange,
            commissionMoneyAdd: commissionMoneyChange,
          },
        })
      }
      return { ticket, ticketProduct, ticketUserChangeList }
    })

    return transaction
  }
}
