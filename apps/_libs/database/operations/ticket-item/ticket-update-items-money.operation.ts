import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DeliveryStatus, DiscountType } from '../../common/variable'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  TicketLaboratoryManager,
  TicketManager,
  TicketProcedureManager,
  TicketProductManager,
  TicketRadiologyManager,
} from '../../repositories'

@Injectable()
export class TicketUpdateItemsMoneyOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProductManager: TicketProductManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketRadiologyManager: TicketRadiologyManager
  ) { }

  async updateItemsMoney(params: {
    oid: number
    ticketId: string
    itemsActualMoney: number
    discountMoney: number
    discountPercent: number
    discountType: DiscountType
    ticketProductUpdateList: {
      ticketProductId: string
      quantity: number
      discountMoney: number
      discountPercent: number
      discountType: DiscountType
      actualPrice: number
    }[]
    ticketProcedureUpdateList: {
      ticketProcedureId: string
      discountMoney: number
      discountPercent: number
      discountType: DiscountType
      actualPrice: number
    }[]
    ticketLaboratoryUpdateList: {
      ticketLaboratoryId: string
      discountMoney: number
      discountPercent: number
      discountType: DiscountType
      actualPrice: number
    }[]
    ticketRadiologyUpdateList: {
      ticketRadiologyId: string
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
      ticketLaboratoryUpdateList,
      ticketRadiologyUpdateList,
    } = params
    const PREFIX = `ticketId=${ticketId} update items quantity and discount failed`

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          status: TicketStatus.Executing,
        },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE PRODUCT_LIST ===
      if (ticketProductUpdateList.length) {
        const ticketProductUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "TicketProduct" tp
          SET "quantity"        = temp."quantity",
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
                `(${i.ticketProductId}, ${i.quantity}, `
                + `${i.discountMoney}, ${i.discountPercent}, '${i.discountType}', ${i.actualPrice})`
              )
            })
            .join(', ')
          + `   ) AS temp("ticketProductId", "quantity",
                       "discountMoney", "discountPercent", "discountType", "actualPrice"
                      )
          WHERE   tp."id"             = temp."ticketProductId"
              AND tp."deliveryStatus" IN (${DeliveryStatus.NoStock}, ${DeliveryStatus.Pending}) 
              AND tp."ticketId"       = ${ticketId}
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
                `(${i.ticketProcedureId}, ${i.discountMoney}, `
                + ` ${i.discountPercent}, '${i.discountType}', ${i.actualPrice})`
              )
            })
            .join(', ')
          + `   ) AS temp("ticketProcedureId", "discountMoney",
                      "discountPercent", "discountType", "actualPrice"
                      )
          WHERE   tp."id"           = temp."ticketProcedureId"
              AND tp."ticketId"     = ${ticketId}
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
      if (ticketLaboratoryUpdateList.length) {
        const ticketLaboratoryUpdateResult: [any[], number] = await manager.query(
          `
            UPDATE "TicketLaboratory" tp
            SET "discountMoney"   = temp."discountMoney",
                "discountPercent" = temp."discountPercent",
                "discountType"    = temp."discountType",
                "actualPrice"     = temp."actualPrice"
            FROM (VALUES `
          + ticketLaboratoryUpdateList
            .map((i) => {
              return (
                `(${i.ticketLaboratoryId}, ${i.discountMoney}, `
                + ` ${i.discountPercent}, '${i.discountType}', ${i.actualPrice})`
              )
            })
            .join(', ')
          + `   ) AS temp("ticketLaboratoryId", "discountMoney",
                        "discountPercent", "discountType", "actualPrice"
                        )
            WHERE   tp."id"           = temp."ticketLaboratoryId"
                AND tp."ticketId"     = ${ticketId}
                AND tp."oid"          = ${oid}
            RETURNING tp.*;
            `
        )
        if (ticketLaboratoryUpdateResult[0].length != ticketLaboratoryUpdateList.length) {
          throw new Error(
            `${PREFIX}: Update TicketLaboratory, affected = ${ticketLaboratoryUpdateResult[1]}`
          )
        }
      }

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
                `(${i.ticketRadiologyId},  ${i.discountMoney}, `
                + ` ${i.discountPercent}, '${i.discountType}', ${i.actualPrice})`
              )
            })
            .join(', ')
          + `   ) AS temp("ticketRadiologyId", "discountMoney",
                        "discountPercent", "discountType", "actualPrice"
                        )
            WHERE   tp."id"           = temp."ticketRadiologyId"
                AND tp."ticketId"     = ${ticketId}
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
      const ticketProcedureList = await this.ticketProcedureManager.findMany(manager, {
        relation: { procedure: true },
        relationLoadStrategy: 'join',
        condition: { ticketId },
        sort: { id: 'ASC' },
      })
      const ticketProductList = await this.ticketProductManager.findMany(manager, {
        relation: { product: true, batch: true },
        relationLoadStrategy: 'join',
        condition: { ticketId },
        sort: { id: 'ASC' },
      })
      const ticketLaboratoryList = await this.ticketLaboratoryManager.findMany(manager, {
        condition: { ticketId },
        sort: { id: 'ASC' },
      })
      const ticketRadiologyList = await this.ticketRadiologyManager.findMany(manager, {
        relation: { radiology: {} },
        relationLoadStrategy: 'join',
        condition: { ticketId },
        sort: { id: 'ASC' },
      })

      const procedureMoneyUpdate = ticketProcedureList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)
      const productMoneyUpdate = ticketProductList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)
      const laboratoryMoneyUpdate = ticketLaboratoryList.reduce((acc, item) => {
        return acc + item.actualPrice
      }, 0)
      const radiologyMoneyUpdate = ticketRadiologyList.reduce((acc, item) => {
        return acc + item.actualPrice
      }, 0)

      const itemsCostAmountUpdate = ticketProductList.reduce((acc, item) => {
        return acc + item.costAmount
      }, 0)

      const itemsActualMoneyUpdate =
        procedureMoneyUpdate + productMoneyUpdate + laboratoryMoneyUpdate + radiologyMoneyUpdate
      const discountMoney = params.discountMoney
      const discountPercent = params.discountPercent
      const discountType = params.discountType

      const totalMoneyUpdate = itemsActualMoneyUpdate - discountMoney
      const debtUpdate = totalMoneyUpdate - ticketOrigin.paid
      const profitUpdate = totalMoneyUpdate - itemsCostAmountUpdate - ticketOrigin.expense

      // 5. UPDATE TICKET: MONEY
      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        {
          itemsCostAmount: itemsCostAmountUpdate,
          procedureMoney: procedureMoneyUpdate,
          productMoney: productMoneyUpdate,
          laboratoryMoney: laboratoryMoneyUpdate,
          radiologyMoney: radiologyMoneyUpdate,
          itemsActualMoney: itemsActualMoneyUpdate,
          // itemsDiscount, // itemDiscount có thể thay đổi liên tục nên để đợi khi đóng phiếu mới tính
          discountMoney,
          discountPercent,
          discountType,
          totalMoney: totalMoneyUpdate,
          debt: debtUpdate,
          profit: profitUpdate,
        }
      )

      return {
        ticket,
        ticketProcedureList,
        ticketProductList,
        ticketRadiologyList,
        ticketLaboratoryList,
      }
    })
  }
}
