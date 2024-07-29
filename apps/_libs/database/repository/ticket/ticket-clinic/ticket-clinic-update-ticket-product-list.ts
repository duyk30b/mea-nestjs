import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus, DiscountType } from '../../../common/variable'
import TicketProduct, {
  TicketProductInsertType,
  TicketProductRelationType,
  TicketProductType,
} from '../../../entities/ticket-product.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'

export type TicketClinicProductUpdateDtoType = Omit<
  TicketProduct,
  | keyof TicketProductRelationType
  | keyof Pick<
    TicketProduct,
    'oid' | 'id' | 'ticketId' | 'customerId' | 'deliveryStatus' | 'quantityReturn' | 'type'
  >
>

@Injectable()
export class TicketClinicUpdateTicketProductList {
  constructor(private dataSource: DataSource) { }

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
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: TicketStatus.Executing,
      }

      const setTicketOrigin: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } =
      {
        updatedAt: Date.now(),
      }

      // update tạm để tạo transaction
      const ticketOriginUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Ticket)
        .where(whereTicket)
        .set(setTicketOrigin)
        .returning('*')
        .execute()
      if (ticketOriginUpdateResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }
      const ticketOrigin = Ticket.fromRaw(ticketOriginUpdateResult.raw[0])

      // === 2. DELETE OLD ===
      const whereTicketProductDelete: FindOptionsWhere<TicketProduct> = {
        oid,
        ticketId,
        deliveryStatus: In([DeliveryStatus.NoStock, DeliveryStatus.Pending]),
        type, // xóa type đó thôi, các type khác không liên quan
      }
      await manager.delete(TicketProduct, whereTicketProductDelete)

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
        await manager.insert(TicketProduct, ticketProductListInsert)
      }

      // === 4. QUERY NEW ===
      const ticketProductList = await manager.find(TicketProduct, {
        relations: { product: true, batch: true },
        relationLoadStrategy: 'join',
        where: { ticketId },
        order: { id: 'ASC' },
      })

      const productMoney = ticketProductList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)
      const totalCostAmount = ticketProductList.reduce((acc, item) => {
        return acc + item.costAmount
      }, 0)

      const itemsActualMoney =
        ticketOrigin.itemsActualMoney - ticketOrigin.productMoney + productMoney

      const discountType = ticketOrigin.discountType
      let discountPercent = ticketOrigin.discountPercent
      let discountMoney = ticketOrigin.discountMoney
      if (discountType === DiscountType.VND) {
        discountPercent =
          itemsActualMoney == 0 ? 0 : Math.floor((discountMoney * 100) / itemsActualMoney)
      }
      if (discountType === DiscountType.Percent) {
        discountMoney = Math.floor((discountPercent * itemsActualMoney) / 100)
      }
      const totalMoney = itemsActualMoney - discountMoney

      // === 5. UPDATE VISIT: MONEY  ===
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        productMoney,
        totalCostAmount,
        itemsActualMoney,
        discountPercent,
        discountMoney,
        totalMoney,
        debt: () => `${totalMoney} - "paid"`,
      }

      const ticketUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Ticket)
        .where(whereTicket)
        .set(setTicket)
        .returning('*')
        .execute()
      if (ticketUpdateResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }
      const ticketBasic = Ticket.fromRaw(ticketUpdateResult.raw[0])

      return { ticketBasic, ticketProductList }
    })

    return transaction
  }
}
