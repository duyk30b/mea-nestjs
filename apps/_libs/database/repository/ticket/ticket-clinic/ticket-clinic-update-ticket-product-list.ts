import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus } from '../../../common/variable'
import TicketProduct, { TicketProductInsertType, TicketProductRelationType, TicketProductType } from '../../../entities/ticket-product.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'

export type TicketClinicProductUpdateDtoType = Omit<
  TicketProduct,
  | keyof TicketProductRelationType
  | keyof Pick<
    TicketProduct,
    | 'oid'
    | 'id'
    | 'ticketId'
    | 'customerId'
    | 'deliveryStatus'
    | 'quantityReturn'
    | 'type'
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
      // === 1. UPDATE VISIT FOR TRANSACTION ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: TicketStatus.Executing,
      }

      const setTicketRoot: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        updatedAt: Date.now(),
      }

      // update tạm để tạo transaction
      const ticketRootUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Ticket)
        .where(whereTicket)
        .set(setTicketRoot)
        .returning('*')
        .execute()
      if (ticketRootUpdateResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }
      const ticketRoot = Ticket.fromRaw(ticketRootUpdateResult.raw[0])

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
            customerId: ticketRoot.customerId,
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
      const productsMoney = ticketProductList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)
      const totalCostAmount = ticketProductList.reduce((acc, item) => {
        return acc + item.costAmount
      }, 0)

      let deliveryStatus = DeliveryStatus.NoStock
      if (!ticketProductList.length) {
        deliveryStatus = DeliveryStatus.NoStock
      } else if (ticketProductList.find((i) => i.deliveryStatus === DeliveryStatus.Pending)) {
        deliveryStatus = DeliveryStatus.Pending
      } else if (ticketProductList.find((i) => i.deliveryStatus === DeliveryStatus.Delivered)) {
        deliveryStatus = DeliveryStatus.Delivered
      }

      // === 5. UPDATE VISIT: MONEY  ===
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        deliveryStatus,
        productsMoney,
        totalCostAmount,
        totalMoney: () => `"totalMoney" - "productsMoney" + ${productsMoney}`,
        debt: () => `"debt" - "productsMoney" + ${productsMoney}`,
        profit: () =>
          `"totalMoney" - "productsMoney" + ${productsMoney} - ${totalCostAmount} - "expense"`,
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
