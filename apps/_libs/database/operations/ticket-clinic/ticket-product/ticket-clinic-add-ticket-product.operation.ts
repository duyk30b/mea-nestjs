import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus } from '../../../common/variable'
import TicketProduct, {
  TicketProductInsertType,
  TicketProductRelationType,
  TicketProductType,
} from '../../../entities/ticket-product.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProductManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

export type TicketClinicProductAddDtoType = Omit<
  TicketProduct,
  | keyof TicketProductRelationType
  | keyof Pick<TicketProduct, 'oid' | 'id' | 'ticketId' | 'customerId' | 'deliveryStatus' | 'type'>
>

@Injectable()
export class TicketClinicAddTicketProductOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager,
    private ticketProductManager: TicketProductManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async addTicketProductList<T extends TicketClinicProductAddDtoType>(params: {
    oid: number
    ticketId: number
    ticketProductType: TicketProductType
    ticketProductDtoList: NoExtra<TicketClinicProductAddDtoType, T>[]
  }) {
    const { oid, ticketId, ticketProductDtoList, ticketProductType } = params
    const PREFIX = `ticketId=${ticketId} addTicketProduct failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. INSERT NEW ===
      const ticketProductInsertList = ticketProductDtoList.map((i) => {
        const insert: NoExtra<TicketProductInsertType> = {
          ...i,
          oid,
          ticketId,
          customerId: ticketOrigin.customerId,
          deliveryStatus: DeliveryStatus.Pending,
          type: ticketProductType,
        }
        return insert
      })
      const ticketProductList = await this.ticketProductManager.insertManyAndReturnEntity(
        manager,
        ticketProductInsertList
      )

      // === 5. UPDATE TICKET: MONEY  ===
      const productMoneyAdd = ticketProductList.reduce((acc, cur) => {
        return acc + cur.quantity * cur.actualPrice
      }, 0)
      const itemsDiscountAdd = ticketProductList.reduce((acc, cur) => {
        return acc + cur.quantity * cur.discountMoney
      }, 0)
      const itemsCostAmountAdd = ticketProductList.reduce((acc, cur) => {
        return acc + cur.quantity * cur.costPrice
      }, 0)
      let ticket: Ticket = ticketOrigin
      if (productMoneyAdd != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            productMoneyAdd,
            itemsDiscountAdd,
            itemsCostAmountAdd,
          },
        })
      }
      return { ticket, ticketProductList }
    })

    return transaction
  }
}
