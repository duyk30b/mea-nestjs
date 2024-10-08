import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus, DiscountType } from '../../../common/variable'
import { Ticket, TicketProcedure, TicketProduct, TicketRadiology } from '../../../entities'
import { TicketStatus } from '../../../entities/ticket.entity'

@Injectable()
export class TicketClinicChangeItemsMoney {
  constructor(private dataSource: DataSource) { }

  async changeItemsMoney(params: {
    oid: number
    ticketId: number
    ticketProductUpdateList: {
      ticketProductId: number
      productId: number
      quantity: number
      costAmount: number
      discountMoney: number
      discountPercent: number
      discountType: DiscountType
      actualPrice: number
    }[]
    ticketProcedureUpdateList: {
      ticketProcedureId: number
      procedureId: number
      discountMoney: number
      discountPercent: number
      discountType: DiscountType
      actualPrice: number
    }[]
    ticketRadiologyUpdateList: {
      ticketRadiologyId: number
      radiologyId: number
      discountMoney: number
      discountPercent: number
      discountType: DiscountType
      actualPrice: number
    }[]
  }) {
    const {
      oid,
      ticketId,
      ticketProductUpdateList,
      ticketProcedureUpdateList,
      ticketRadiologyUpdateList,
    } = params
    const PREFIX = `ticketId=${ticketId} update items quantity and discount failed`

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE VISIT FOR TRANSACTION ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: TicketStatus.Executing,
      }
      const ticketUpdateTime = await manager.update(Ticket, whereTicket, {
        updatedAt: Date.now(),
      }) // update tạm để tạo transaction
      if (ticketUpdateTime.affected !== 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }

      // === 2. UPDATE PRODUCT_LIST ===
      if (ticketProductUpdateList.length) {
        const ticketProductUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "TicketProduct" tp
          SET "quantity"        = temp."quantity",
              "costAmount"      = temp."costAmount",
              "discountMoney"   = temp."discountMoney",
              "discountPercent" = temp."discountPercent",
              "discountType"    = temp."discountType",
              "actualPrice"     = temp."actualPrice",
              "deliveryStatus"  = CASE 
                                      WHEN (temp."quantity" = 0) THEN ${DeliveryStatus.NoStock} 
                                      ELSE ${DeliveryStatus.Pending} 
                                  END
          FROM (VALUES `
          + ticketProductUpdateList
            .map((i) => {
              return (
                `(${i.ticketProductId}, ${ticketId}, ${i.productId}, `
                + `${i.quantity}, ${i.costAmount}, `
                + `${i.discountMoney}, ${i.discountPercent}, '${i.discountType}', ${i.actualPrice})`
              )
            })
            .join(', ')
          + `   ) AS temp("ticketProductId", "ticketId", "productId", "quantity", "costAmount",
                       "discountMoney", "discountPercent", "discountType", "actualPrice"
                      )
          WHERE   tp."id"             = temp."ticketProductId"
              AND tp."ticketId"       = temp."ticketId"
              AND tp."productId"      = temp."productId"
              AND tp."deliveryStatus" IN (${DeliveryStatus.NoStock}, ${DeliveryStatus.Pending}) 
              AND tp."oid"            = ${oid}
          RETURNING tp.*;   
          `
        )
        if (ticketProductUpdateResult[0].length != ticketProductUpdateList.length) {
          throw new Error(
            `${PREFIX}: Update TicketProduct, affected = ${ticketProductUpdateResult[1]}`
          )
        }
      }

      // === 3. UPDATE PROCEDURE_LIST ===
      if (ticketProcedureUpdateList.length) {
        const ticketProcedureUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "TicketProcedure" tp
          SET "discountMoney"   = temp."discountMoney",
              "discountPercent" = temp."discountPercent",
              "discountType"    = temp."discountType",
              "actualPrice"     = temp."actualPrice"
          FROM (VALUES `
          + ticketProcedureUpdateList
            .map((i) => {
              return (
                `(${i.ticketProcedureId}, ${ticketId}, ${i.procedureId}, ${i.discountMoney}, `
                + ` ${i.discountPercent}, '${i.discountType}', ${i.actualPrice})`
              )
            })
            .join(', ')
          + `   ) AS temp("ticketProcedureId", "ticketId", "procedureId", "discountMoney",
                      "discountPercent", "discountType", "actualPrice"
                      )
          WHERE   tp."id"           = temp."ticketProcedureId"
              AND tp."ticketId"     = temp."ticketId"
              AND tp."procedureId"  = temp."procedureId"
              AND tp."oid"          = ${oid}
          RETURNING tp.*;
          `
        )
        if (ticketProcedureUpdateResult[0].length != ticketProcedureUpdateList.length) {
          throw new Error(
            `${PREFIX}: Update TicketProcedure, affected = ${ticketProcedureUpdateResult[1]}`
          )
        }
      }

      // === 4. UPDATE RADIOLOGY_LIST ===
      if (ticketRadiologyUpdateList.length) {
        const ticketRadiologyUpdateResult: [any[], number] = await manager.query(
          `
            UPDATE "TicketRadiology" tp
            SET "discountMoney"   = temp."discountMoney",
                "discountPercent" = temp."discountPercent",
                "discountType"    = temp."discountType",
                "actualPrice"     = temp."actualPrice"
            FROM (VALUES `
          + ticketRadiologyUpdateList
            .map((i) => {
              return (
                `(${i.ticketRadiologyId}, ${ticketId}, ${i.radiologyId}, ${i.discountMoney}, `
                + ` ${i.discountPercent}, '${i.discountType}', ${i.actualPrice})`
              )
            })
            .join(', ')
          + `   ) AS temp("ticketRadiologyId", "ticketId", "radiologyId", "discountMoney",
                        "discountPercent", "discountType", "actualPrice"
                        )
            WHERE   tp."id"           = temp."ticketRadiologyId"
                AND tp."ticketId"     = temp."ticketId"
                AND tp."radiologyId"  = temp."radiologyId"
                AND tp."oid"          = ${oid}
            RETURNING tp.*;
            `
        )
        if (ticketRadiologyUpdateResult[0].length != ticketRadiologyUpdateList.length) {
          throw new Error(
            `${PREFIX}: Update TicketRadiology, affected = ${ticketRadiologyUpdateResult[1]}`
          )
        }
      }

      // === 4. QUERY NEW ===
      const ticketProcedureList = await manager.find(TicketProcedure, {
        relations: { procedure: true },
        relationLoadStrategy: 'join',
        where: { ticketId },
        order: { id: 'ASC' },
      })
      const ticketProductList = await manager.find(TicketProduct, {
        relations: { product: true, batch: true },
        relationLoadStrategy: 'join',
        where: { ticketId },
        order: { id: 'ASC' },
      })
      const ticketRadiologyList = await manager.find(TicketRadiology, {
        relations: { radiology: true },
        relationLoadStrategy: 'join',
        where: { ticketId },
        order: { id: 'ASC' },
      })

      const proceduresMoney = ticketProcedureList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)
      const productsMoney = ticketProductList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)
      const radiologyMoney = ticketRadiologyList.reduce((acc, item) => {
        return acc + item.actualPrice
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

      // 4. UPDATE VISIT: MONEY
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        totalCostAmount,
        proceduresMoney,
        productsMoney,
        radiologyMoney,
        deliveryStatus,
        totalMoney: () =>
          `${proceduresMoney} + ${productsMoney} + ${radiologyMoney} - "discountMoney"`,
        debt: () =>
          `${proceduresMoney} + ${productsMoney} + ${radiologyMoney} - "discountMoney" - "paid"`,
        profit: () =>
          `${proceduresMoney} + ${productsMoney} + ${radiologyMoney}`
          + ` - ${totalCostAmount} - "expense"`,
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

      return { ticketBasic, ticketProcedureList, ticketProductList, ticketRadiologyList }
    })
  }
}
