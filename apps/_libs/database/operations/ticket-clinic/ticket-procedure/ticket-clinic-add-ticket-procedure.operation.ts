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
} from '../../../entities/ticket-procedure.entity'
import TicketUser, { TicketUserInsertType } from '../../../entities/ticket-user.entity'
import { TicketStatus } from '../../../entities/ticket.entity'
import {
  CommissionManager,
  TicketManager,
  TicketProcedureManager,
  TicketUserManager,
} from '../../../managers'

export type TicketProcedureAddDtoType = Omit<
  TicketProcedure,
  | keyof TicketProcedureRelationType
  | keyof Pick<
    TicketProcedure,
    'oid' | 'id' | 'ticketId' | 'customerId' | 'result' | 'startedAt' | 'status' | 'imageIds'
  >
>

@Injectable()
export class TicketClinicAddTicketProcedureOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketUserManager: TicketUserManager,
    private commissionManager: CommissionManager,
    private ticketProcedureManager: TicketProcedureManager
  ) { }

  async addTicketProcedure<T extends TicketProcedureAddDtoType>(params: {
    oid: number
    ticketId: number
    ticketProcedureDto: NoExtra<TicketProcedureAddDtoType, T>
    ticketUserDto: { roleId: number; userId: number }[]
  }) {
    const { oid, ticketId, ticketProcedureDto, ticketUserDto } = params
    const PREFIX = `ticketId=${ticketId} addTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. INSERT NEW ===
      const ticketProcedureInsert: NoExtra<TicketProcedureInsertType> = {
        ...ticketProcedureDto,
        oid,
        ticketId,
        customerId: ticketOrigin.customerId,
        imageIds: JSON.stringify([]),
        result: '',
        startedAt: null,
        status: TicketProcedureStatus.Completed, // coi như đã hoàn thành
      }
      const ticketProcedure = await this.ticketProcedureManager.insertOneAndReturnEntity(
        manager,
        ticketProcedureInsert
      )

      let commissionMoneyAdd = 0
      let ticketUserInsertList: TicketUser[] = []
      if (ticketUserDto.length) {
        // === 3. QUERY COMMISSION ===
        const commissionList = await this.commissionManager.findManyBy(manager, {
          oid,
          interactType: InteractType.Procedure,
          interactId: ticketProcedure.procedureId,
        })
        const commissionMap = ESObject.keyBy(commissionList, 'roleId')

        // === 4. INSERT TICKET USER ===
        const ticketUserInsertListDto = ticketUserDto.map((i) => {
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
            commissionMoney = Math.floor((ticketProcedure.expectedPrice * commissionPercent) / 100)
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

        ticketUserInsertList = await this.ticketUserManager.insertManyAndReturnEntity(
          manager,
          ticketUserInsertListDto
        )

        commissionMoneyAdd = ticketUserInsertList.reduce((acc, item) => {
          return acc + item.commissionMoney
        }, 0)
      }

      // === 5. UPDATE TICKET: MONEY  ===
      const procedureMoneyAdd = ticketProcedure.quantity * ticketProcedure.actualPrice

      const procedureMoneyUpdate = ticketOrigin.procedureMoney + procedureMoneyAdd
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
          commissionMoney: commissionMoneyUpdate,
          profit: profitUpdate,
        }
      )
      return { ticket, ticketProcedure, ticketUserInsertList }
    })

    return transaction
  }
}
