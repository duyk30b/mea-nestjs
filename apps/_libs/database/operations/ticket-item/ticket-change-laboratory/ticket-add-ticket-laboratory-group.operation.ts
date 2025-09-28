import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { GenerateId } from '../../../common/generate-id'
import { PaymentMoneyStatus, TicketLaboratoryStatus } from '../../../common/variable'
import { TicketLaboratoryGroup } from '../../../entities'
import { TicketLaboratoryGroupInsertType } from '../../../entities/ticket-laboratory-group.entity'
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

export type TicketLaboratoryInsertBasicType = Pick<
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
>

export type TicketLaboratoryGroupInsertBasicType = Pick<
  TicketLaboratoryGroup,
  'laboratoryGroupId' | 'createdAt' | 'roomId'
> & { ticketLaboratoryList: TicketLaboratoryInsertBasicType[] }

@Injectable()
export class TicketAddSelectLaboratoryOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketLaboratoryGroupManager: TicketLaboratoryGroupManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async addTicketLaboratoryGroupList<U extends TicketLaboratoryGroupInsertBasicType>(params: {
    oid: number
    ticketId: string
    tlgDtoList: NoExtra<TicketLaboratoryGroupInsertBasicType, U>[]
  }) {
    const { oid, ticketId, tlgDtoList } = params
    const PREFIX = `ticketId=${ticketId} addSelectLaboratoryList failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. INSERT NEW ===
      const tlgEntityList = tlgDtoList.map((i) => {
        const tlgEntity: NoExtra<TicketLaboratoryGroupInsertType> = {
          ...i,
          id: GenerateId.nextId(),
          oid,
          ticketId,
          roomId: i.roomId,
          customerId: ticketOrigin.customerId,
          status: TicketLaboratoryStatus.Pending,
          paymentMoneyStatus: ticketOrigin.isPaymentEachItem
            ? PaymentMoneyStatus.PendingPayment
            : PaymentMoneyStatus.TicketPaid,
          completedAt: null,
          result: '',
        }
        return tlgEntity
      })
      const tlgCreatedList = await this.ticketLaboratoryGroupManager.insertManyAndReturnEntity(
        manager,
        tlgEntityList
      )

      const tlEntityList = tlgDtoList
        .map((tlgDto, tlgDtoIndex) => {
          return tlgDto.ticketLaboratoryList.map((tlDto) => {
            const tlEntity: NoExtra<TicketLaboratoryInsertType> = {
              ...tlDto,
              id: GenerateId.nextId(),
              oid,
              ticketId,
              customerId: ticketOrigin.customerId,
              ticketLaboratoryGroupId: tlgCreatedList[tlgDtoIndex].id,
              roomId: tlgCreatedList[tlgDtoIndex].roomId,
              status: TicketLaboratoryStatus.Pending,
              paymentMoneyStatus: ticketOrigin.isPaymentEachItem
                ? PaymentMoneyStatus.PendingPayment
                : PaymentMoneyStatus.TicketPaid,
              completedAt: null,
            }
            return tlEntity
          })
        })
        .flat()
      const tlCreatedList = await this.ticketLaboratoryManager.insertManyAndReturnEntity(
        manager,
        tlEntityList
      )

      // === 5. UPDATE TICKET: MONEY  ===
      const laboratoryMoneyAdd = tlCreatedList.reduce((acc, cur) => {
        return acc + cur.actualPrice
      }, 0)
      const itemsDiscountAdd = tlCreatedList.reduce((acc, cur) => {
        return acc + cur.discountMoney
      }, 0)
      const itemsCostAmountAdd = tlCreatedList.reduce((acc, cur) => {
        return acc + cur.costPrice
      }, 0)
      let ticketModified: Ticket = ticketOrigin
      if (laboratoryMoneyAdd != 0 || itemsDiscountAdd != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
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
        ticketModified,
        ticketLaboratoryCreatedList: tlCreatedList,
        ticketLaboratoryGroupCreatedList: tlgCreatedList,
      }
    })

    return transaction
  }
}
