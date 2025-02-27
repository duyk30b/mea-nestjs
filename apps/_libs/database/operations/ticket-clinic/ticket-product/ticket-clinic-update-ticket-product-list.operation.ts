import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { TicketProduct } from '../../../entities'
import { TicketUserUpdateType } from '../../../entities/ticket-user.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProductManager, TicketUserManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

export type TicketProductUpdateDtoType2 = {
  [K in keyof Pick<
    TicketProduct,
    'id' | 'priority' | 'quantity' | 'quantityPrescription' | 'hintUsage'
  >]: TicketProduct[K]
}

@Injectable()
export class TicketClinicUpdateTicketProductListOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProductManager: TicketProductManager,
    private ticketUserManager: TicketUserManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateTicketProductList<T extends TicketProductUpdateDtoType2>(params: {
    oid: number
    ticketId: number
    ticketProductDtoList?: NoExtra<TicketProductUpdateDtoType2, T>[]
  }) {
    const { oid, ticketId, ticketProductDtoList } = params
    if (!ticketProductDtoList.length) {
      return
    }
    const PREFIX = `ticketId=${ticketId} updateTicketProduct failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PRODUCT ===
      const ticketProductOrigin = await this.ticketProductManager.findManyBy(manager, {
        oid,
        ticketId,
        id: { IN: ticketProductDtoList.map((i) => i.id) },
      })

      const queryUpdateTicketProduct: [any[], number] = await manager.query(
        `
        UPDATE "TicketProduct"
        SET   "priority"              = temp."priority",
              "quantity"              = temp."quantity",
              "quantityPrescription"  = temp."quantityPrescription",
              "hintUsage"             = temp."hintUsage"
        FROM (VALUES `
        + ticketProductDtoList
          .map(({ id, priority, quantity, quantityPrescription, hintUsage }) => {
            return `(${id}, ${priority}, ${quantity}, ${quantityPrescription}, ${hintUsage})`
          })
          .join(', ')
        + `   ) AS temp("id", "priority", "quantity", "quantityPrescription", "hintUsage")
        WHERE   "TicketProduct"."id"  = temp."id" 
            AND "TicketProduct"."ticketId" = ${params.ticketId} 
            AND "TicketProduct"."oid" = ${params.oid} 
        RETURNING *
        `
      )
      if (queryUpdateTicketProduct[0].length != ticketProductOrigin.length) {
        throw new Error(`Update TicketProduct failed`)
      }
      const ticketProductUpdateList = TicketProduct.fromRaws(queryUpdateTicketProduct[0])

      // === 3. UPDATE TICKET USER ===
      const ticketUserPayloadList = ticketProductDtoList.map((i) => {
        const payload: Partial<TicketUserUpdateType> = {
          ticketItemId: i.id,
          quantity: i.quantity,
        }
        return payload
      })
      const queryUpdateTicketUser: [any[], number] = await manager.query(
        `
        UPDATE "TicketUser"
        SET   "quantity"  = temp."quantity"
        FROM (VALUES `
        + ticketUserPayloadList
          .map(({ ticketItemId, quantity }) => {
            return `(${ticketItemId}, ${quantity})`
          })
          .join(', ')
        + `   ) AS temp("ticketItemId", "quantity")
        WHERE   "TicketUser"."ticketItemId" = temp."ticketItemId" 
            AND "TicketUser"."ticketId"     = ${params.ticketId} 
            AND "TicketUser"."oid"          = ${params.oid} 
        `
      )

      // 4. QUERY NEW
      const ticketUserList = await this.ticketUserManager.findManyBy(manager, {
        oid,
        ticketId,
      })
      const commissionMoneyNew = ticketUserList.reduce((acc, cur) => {
        return acc + cur.quantity * cur.commissionMoney
      }, 0)
      const commissionMoneyAdd = commissionMoneyNew - ticketOrigin.commissionMoney

      const productMoneyAdd =
        ticketProductUpdateList.reduce((acc, cur) => {
          return acc + cur.quantity * cur.actualPrice
        }, 0)
        - ticketProductOrigin.reduce((acc, cur) => {
          return acc + cur.quantity * cur.actualPrice
        }, 0)
      const itemsDiscountAdd =
        ticketProductUpdateList.reduce((acc, cur) => {
          return acc + cur.quantity * cur.discountMoney
        }, 0)
        - ticketProductOrigin.reduce((acc, cur) => {
          return acc + cur.quantity * cur.discountMoney
        }, 0)

      // === 5. UPDATE TICKET: MONEY  ===
      let ticket: Ticket = ticketOrigin
      if (productMoneyAdd != 0 || itemsDiscountAdd != 0 || commissionMoneyAdd != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            productMoneyAdd,
            commissionMoneyAdd,
            itemsDiscountAdd,
          },
        })
      }
      return { ticket, ticketProductUpdateList, ticketUserList }
    })

    return transaction
  }
}
