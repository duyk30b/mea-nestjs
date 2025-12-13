import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { GenerateId } from '../../../common/generate-id'
import { TicketLaboratoryStatus } from '../../../common/variable'
import { TicketLaboratoryGroup } from '../../../entities'
import TicketLaboratory, {
  TicketLaboratoryInsertType,
} from '../../../entities/ticket-laboratory.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import {
  TicketLaboratoryGroupManager,
  TicketLaboratoryManager,
  TicketManager,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

export type TicketLaboratoryUpdateBasicType = Pick<
  TicketLaboratory,
  | 'priority'
  | 'laboratoryId'
  | 'laboratoryGroupId'
  | 'costPrice'
  | 'expectedPrice'
  | 'discountMoney'
  | 'discountPercent'
  | 'discountType'
  | 'actualPrice'
  | 'createdAt'
  | 'paymentMoneyStatus'
>

export type TicketLaboratoryGroupUpdateBasicType = Pick<
  TicketLaboratoryGroup,
  'id' | 'laboratoryGroupId' | 'createdAt' | 'roomId'
>

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
    ticketId: string
    ticketLaboratoryGroupDto: NoExtra<TicketLaboratoryGroupUpdateBasicType, U>
    ticketLaboratoryListDto: TicketLaboratoryUpdateBasicType[]
  }) {
    const { oid, ticketId, ticketLaboratoryGroupDto, ticketLaboratoryListDto } = params
    const PREFIX = `ticketId=${ticketId} changeSelectLaboratoryList failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE ===
      let tlgModified: TicketLaboratoryGroup
      if (ticketLaboratoryGroupDto.id) {
        tlgModified = await this.ticketLaboratoryGroupManager.updateOneAndReturnEntity(
          manager,
          { oid, ticketId, id: ticketLaboratoryGroupDto.id },
          {
            createdAt: ticketLaboratoryGroupDto.createdAt,
            roomId: ticketLaboratoryGroupDto.roomId,
          }
        )
      }

      const tlDestroyedList = await this.ticketLaboratoryManager.deleteAndReturnEntity(manager, {
        oid,
        ticketId,
        ticketLaboratoryGroupId: ticketLaboratoryGroupDto.id,
        laboratoryId: {
          NOT_IN: [0, ...ticketLaboratoryListDto.map((i) => i.laboratoryId)],
        },
      })

      const tlKeepList = await this.ticketLaboratoryManager.findManyBy(manager, {
        oid,
        ticketId,
        ticketLaboratoryGroupId: ticketLaboratoryGroupDto.id,
      })

      const laboratoryIdKeepList = tlKeepList.map((i) => i.laboratoryId)

      const tlInsertList = ticketLaboratoryListDto
        .filter((tlDto) => !laboratoryIdKeepList.includes(tlDto.laboratoryId))
        .map((tlDto) => {
          const tlEntity: NoExtra<TicketLaboratoryInsertType> = {
            ...tlDto,
            id: GenerateId.nextId(),
            oid,
            ticketId,
            customerId: ticketOrigin.customerId,
            ticketLaboratoryGroupId: ticketLaboratoryGroupDto.id,
            roomId: ticketLaboratoryGroupDto.roomId,
            completedAt: null,
            paid: 0,
            debt: 0,
            status: TicketLaboratoryStatus.Pending,
          }
          return tlEntity
        })

      const tlCreatedList = await this.ticketLaboratoryManager.insertManyAndReturnEntity(
        manager,
        tlInsertList
      )

      // === 5. UPDATE TICKET: MONEY  ===
      const laboratoryMoneyAdd =
        tlCreatedList.reduce((acc, cur) => {
          return acc + cur.actualPrice
        }, 0)
        - tlDestroyedList.reduce((acc, cur) => {
          return acc + cur.actualPrice
        }, 0)

      const itemsDiscountAdd =
        tlCreatedList.reduce((acc, cur) => {
          return acc + cur.discountMoney
        }, 0)
        - tlDestroyedList.reduce((acc, cur) => {
          return acc + cur.discountMoney
        }, 0)
      const itemsCostAmountAdd =
        tlCreatedList.reduce((acc, cur) => {
          return acc + cur.costPrice
        }, 0)
        - tlDestroyedList.reduce((acc, cur) => {
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
        ticketLaboratoryCreatedList: tlCreatedList,
        ticketLaboratoryDestroyedList: tlDestroyedList,
        ticketLaboratoryGroupModified: tlgModified,
      }
    })

    return transaction
  }
}
