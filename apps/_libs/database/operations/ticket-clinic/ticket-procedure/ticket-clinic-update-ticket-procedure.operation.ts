import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESObject } from '../../../../common/helpers/object.helper'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DiscountType } from '../../../common/variable'
import { CommissionCalculatorType, InteractType } from '../../../entities/commission.entity'
import TicketProcedure, {
  TicketProcedureInsertType,
  TicketProcedureRelationType,
  TicketProcedureStatus,
  TicketProcedureUpdateType,
} from '../../../entities/ticket-procedure.entity'
import { TicketUserInsertType } from '../../../entities/ticket-user.entity'
import { TicketStatus } from '../../../entities/ticket.entity'
import {
  CommissionManager,
  TicketManager,
  TicketProcedureManager,
  TicketUserManager,
} from '../../../managers'

export type TicketProcedureUpdateDtoType = {
  [K in keyof Pick<TicketProcedure, 'quantity'>]: TicketProcedure[K] | (() => string)
}

@Injectable()
export class TicketClinicAddTicketProcedureOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketUserManager: TicketUserManager,
    private commissionManager: CommissionManager,
    private ticketProcedureManager: TicketProcedureManager
  ) { }

  async updateTicketProcedure<T extends TicketProcedureUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketProcedureId: number
    ticketProcedureUpdateDto: NoExtra<TicketProcedureUpdateDtoType, T>
    ticketUserDto?: { id: number; roleId: number; userId: number }[]
  }) {
    const { oid, ticketId, ticketProcedureId, ticketProcedureUpdateDto, ticketUserDto } = params
    const PREFIX = `ticketId=${ticketId} updateTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketProcedureOrigin = await this.ticketProcedureManager.findOneBy(manager, {
        oid,
        id: ticketProcedureId,
      })
      const ticketProcedureUpdate = await this.ticketProcedureManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketProcedureId },
        { quantity: ticketProcedureUpdateDto.quantity }
      )
      const procedureMoneyChange =
        ticketProcedureUpdate.quantity * ticketProcedureUpdate.actualPrice
        - ticketProcedureOrigin.quantity * ticketProcedureOrigin.actualPrice

      const commissionMoneyChange = 0
      if (ticketUserDto) {
        const ticketUserDestroyList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
          oid,
          interactType: InteractType.Procedure,
          ticketItemId: ticketProcedureId,
          id: { NOT_IN: ticketUserDto.map((i) => i.id) },
        })
        
        const ticketUserInsertDto = ticketUserDto
          .filter((i) => i.id === 0)
          .map((i) => {
            let commissionMoney = 0
            let commissionPercent = 0

            const commissionCalculatorType = commissionMap[i.roleId].commissionCalculatorType
            if (commissionCalculatorType === CommissionCalculatorType.VND) {
              commissionPercent = 0
              commissionMoney = commissionMap[i.roleId]?.commissionValue || 0
            }
            if (commissionCalculatorType === CommissionCalculatorType.PercentActual) {
              commissionPercent = commissionMap[i.roleId]?.commissionValue || 0
              commissionMoney = Math.floor((ticketProcedure.actualPrice * commissionPercent) / 100)
            }
            if (commissionCalculatorType === CommissionCalculatorType.PercentExpected) {
              commissionPercent = commissionMap[i.roleId]?.commissionValue || 0
              commissionMoney = Math.floor(
                (ticketProcedure.expectedPrice * commissionPercent) / 100
              )
            }

            const insertDto: TicketUserInsertType = {
              ...i,
              oid,
              ticketId,
              interactId: ticketProcedure.procedureId,
              interactType: InteractType.Procedure,
              ticketItemId: ticketProcedure.id,
              createdAt: Date.now(),
              commissionCalculatorType,
              commissionMoney,
              commissionPercent,
            }
            return insertDto
          })

        const ticketUserInsert = await this.ticketUserManager.insertManyAndReturnEntity(
          manager,
          ticketUserInsertDto
        )

        const commissionMoneySubtract = ticketUserDestroyList.reduce((acc, item) => {
          return acc + item.commissionMoney
        }, 0)

        let commissionMoneyPlus = 0
        if (ticketUserDto.length) {
          // === 3. QUERY COMMISSION ===
          const commissionList = await this.commissionManager.findManyBy(manager, {
            oid,
            interactType: InteractType.Procedure,
            interactId: ticketProcedureId,
          })
          const commissionMap = ESObject.keyBy(commissionList, 'roleId')

          // === 4. INSERT TICKET USER ===

          commissionMoneyPlus = ticketUserInsert.reduce((acc, item) => {
            return acc + item.commissionMoney
          }, 0)
        }

        // === 3. QUERY COMMISSION ===
        const commissionList = await this.commissionManager.findManyBy(manager, {
          oid,
          interactType: InteractType.Procedure,
          interactId: ticketProcedure.procedureId,
        })
        const commissionMap = ESObject.keyBy(commissionList, 'roleId')

        // === 4. INSERT TICKET USER ===
      }

      // === 5. UPDATE TICKET: MONEY  ===
      const procedureMoneyUpdate =
        ticketOrigin.procedureMoney + ticketProcedure.quantity * ticketProcedure.actualPrice
      const commissionMoneyUpdate = ticketOrigin.commissionMoney + commissionMoneyAdd

      const itemsActualMoneyUpdate =
        ticketOrigin.itemsActualMoney - ticketOrigin.procedureMoney + procedureMoneyUpdate

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
      const profitUpdate =
        totalMoneyUpdate
        - ticketOrigin.totalCostAmount
        - ticketOrigin.expense
        - commissionMoneyUpdate

      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        {
          procedureMoney: procedureMoneyUpdate,
          itemsActualMoney: itemsActualMoneyUpdate,
          discountPercent,
          discountMoney,
          totalMoney: totalMoneyUpdate,
          debt: debtUpdate,
          profit: profitUpdate,
        }
      )
      return { ticket, ticketProcedure }
    })

    return transaction
  }
}
