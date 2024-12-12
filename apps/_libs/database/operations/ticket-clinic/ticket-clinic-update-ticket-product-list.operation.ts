import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { DeliveryStatus, DiscountType } from '../../common/variable'
import TicketProduct, {
  TicketProductInsertType,
  TicketProductRelationType,
  TicketProductType,
} from '../../entities/ticket-product.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { TicketManager, TicketProductManager } from '../../managers'

export type TicketClinicProductUpdateDtoType = Omit<
  TicketProduct,
  | keyof TicketProductRelationType
  | keyof Pick<TicketProduct, 'oid' | 'id' | 'ticketId' | 'customerId' | 'deliveryStatus' | 'type'>
>

@Injectable()
export class TicketClinicUpdateTicketProductListOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProductManager: TicketProductManager
  ) { }

  async updateTicketProductList<T extends TicketClinicProductUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketProductListDto: NoExtra<TicketClinicProductUpdateDtoType, T>[]
    type: TicketProductType
  }) {
    const { oid, ticketId, ticketProductListDto, type } = params
    const PREFIX = `ticketId=${ticketId} updateTicketProductList failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: TicketStatus.Executing,
        },
        { updatedAt: Date.now() }
      )

      // === 2. DELETE OLD ===
      await this.ticketProductManager.delete(manager, {
        oid,
        ticketId,
        deliveryStatus: { IN: [DeliveryStatus.NoStock, DeliveryStatus.Pending] },
        type, // xóa type đó thôi, các type khác không liên quan
      })

      // === 3. INSERT NEW ===
      if (ticketProductListDto.length) {
        const ticketProductListInsert = ticketProductListDto.map((i) => {
          const draft: TicketProductInsertType = {
            ...i,
            oid,
            ticketId,
            customerId: ticketOrigin.customerId,
            deliveryStatus: DeliveryStatus.Pending,
            quantityReturn: 0,
            type,
          }
          return draft
        })
        await this.ticketProductManager.insertMany(manager, ticketProductListInsert)
      }

      // === 4. QUERY NEW ===
      const ticketProductList = await this.ticketProductManager.findMany(manager, {
        relation: { product: true, batch: true },
        relationLoadStrategy: 'join',
        condition: { ticketId },
        sort: { id: 'ASC' },
      })

      // === 5. UPDATE VISIT: MONEY  ===
      const productMoneyUpdate = ticketProductList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)
      const totalCostAmountUpdate = ticketProductList.reduce((acc, item) => {
        return acc + item.costPrice * item.quantity
      }, 0)

      const itemsActualMoneyUpdate =
        ticketOrigin.itemsActualMoney - ticketOrigin.productMoney + productMoneyUpdate

      const discountType = ticketOrigin.discountType
      let discountPercent = ticketOrigin.discountPercent
      let discountMoney = ticketOrigin.discountMoney
      if (discountType === DiscountType.VND) {
        discountPercent =
          itemsActualMoneyUpdate == 0
            ? 0
            : Math.floor((discountMoney * 100) / itemsActualMoneyUpdate)
      }
      if (discountType === DiscountType.Percent) {
        discountMoney = Math.floor((discountPercent * itemsActualMoneyUpdate) / 100)
      }
      const totalMoneyUpdate = itemsActualMoneyUpdate - discountMoney
      const debtUpdate = totalMoneyUpdate - ticketOrigin.paid

      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        {
          productMoney: productMoneyUpdate,
          itemsActualMoney: itemsActualMoneyUpdate,
          totalCostAmount: totalCostAmountUpdate,
          discountPercent,
          discountMoney,
          totalMoney: totalMoneyUpdate,
          debt: debtUpdate,
        }
      )

      return { ticket, ticketProductList }
    })

    return transaction
  }
}
