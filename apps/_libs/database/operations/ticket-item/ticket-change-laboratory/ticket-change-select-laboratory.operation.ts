import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { TicketLaboratoryStatus } from '../../../common/variable'
import { TicketLaboratoryGroup } from '../../../entities'
import {
  TicketLaboratoryInsertType,
} from '../../../entities/ticket-laboratory.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import {
  TicketLaboratoryGroupManager,
  TicketLaboratoryManager,
  TicketManager,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketLaboratoryInsertBasicType } from './ticket-add-select-laboratory.operation'

export type TicketLaboratoryUpdateBasicType = Omit<
  TicketLaboratoryInsertBasicType,
  keyof Pick<TicketLaboratoryInsertBasicType, 'paymentMoneyStatus'>
>

export type TicketLaboratoryGroupUpdateBasicType = Pick<
  TicketLaboratoryGroup,
  'id' | 'laboratoryGroupId' | 'registeredAt' | 'roomId'
> & { ticketLaboratoryList: TicketLaboratoryUpdateBasicType[] }

@Injectable()
export class TicketChangeSelectLaboratoryOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketLaboratoryGroupManager: TicketLaboratoryGroupManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async changeSelectLaboratoryList<U extends TicketLaboratoryGroupUpdateBasicType>(params: {
    oid: number
    ticketId: number
    tlgDto: NoExtra<TicketLaboratoryGroupUpdateBasicType, U>
  }) {
    const { oid, ticketId, tlgDto } = params
    const PREFIX = `ticketId=${ticketId} changeSelectLaboratoryList failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE ===
      let tlgUpdate: TicketLaboratoryGroup
      if (tlgDto.id !== 0) {
        tlgUpdate = await this.ticketLaboratoryGroupManager.updateOneAndReturnEntity(
          manager,
          { oid, ticketId, id: tlgDto.id },
          { registeredAt: tlgDto.registeredAt, roomId: tlgDto.roomId }
        )
      }

      const tlDestroyList = await this.ticketLaboratoryManager.deleteAndReturnEntity(manager, {
        oid,
        ticketId,
        ticketLaboratoryGroupId: tlgDto.id,
        laboratoryId: { NOT_IN: tlgDto.ticketLaboratoryList.map((i) => i.laboratoryId) },
      })

      const tlKeepList = await this.ticketLaboratoryManager.findManyBy(manager, {
        oid,
        ticketId,
        ticketLaboratoryGroupId: tlgDto.id,
      })

      const laboratoryIdKeepList = tlKeepList.map((i) => i.laboratoryId)

      const tlEntityList = tlgDto.ticketLaboratoryList
        .filter((tlDto) => !laboratoryIdKeepList.includes(tlDto.laboratoryId))
        .map((tlDto) => {
          const tlEntity: NoExtra<TicketLaboratoryInsertType> = {
            ...tlDto,
            oid,
            ticketId,
            customerId: ticketOrigin.customerId,
            ticketLaboratoryGroupId: tlgDto.id,
            roomId: tlgDto.roomId,
            status: TicketLaboratoryStatus.Pending,
            startedAt: null,
            paymentMoneyStatus: tlgUpdate.paymentMoneyStatus,
          }
          return tlEntity
        })

      const tlInsertList = await this.ticketLaboratoryManager.insertManyAndReturnEntity(
        manager,
        tlEntityList
      )

      // === 5. UPDATE TICKET: MONEY  ===
      const laboratoryMoneyAdd =
        tlInsertList.reduce((acc, cur) => {
          return acc + cur.actualPrice
        }, 0)
        - tlDestroyList.reduce((acc, cur) => {
          return acc + cur.actualPrice
        }, 0)

      const itemsDiscountAdd =
        tlInsertList.reduce((acc, cur) => {
          return acc + cur.discountMoney
        }, 0)
        - tlDestroyList.reduce((acc, cur) => {
          return acc + cur.discountMoney
        }, 0)
      const itemsCostAmountAdd =
        tlInsertList.reduce((acc, cur) => {
          return acc + cur.costPrice
        }, 0)
        - tlDestroyList.reduce((acc, cur) => {
          return acc + cur.costPrice
        }, 0)

      let ticket: Ticket = ticketOrigin
      if (laboratoryMoneyAdd != 0 || itemsDiscountAdd != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            laboratoryMoneyAdd,
            itemsDiscountAdd,
            itemsCostAmountAdd,
          },
        })
      }
      return {
        ticket,
        ticketLaboratoryInsertList: tlInsertList,
        ticketLaboratoryDestroyList: tlDestroyList,
        ticketLaboratoryGroupUpdate: tlgUpdate,
      }
    })

    return transaction
  }
}
