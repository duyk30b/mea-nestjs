import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { ESArray } from '../../../../common/helpers'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { TicketProcedureStatus } from '../../../common/variable'
import { TicketProcedureItem } from '../../../entities'
import { TicketProcedureItemInsertType } from '../../../entities/ticket-procedure-item.entity'
import TicketProcedure, {
  TicketProcedureInsertType,
} from '../../../entities/ticket-procedure.entity'
import { TicketStatus } from '../../../entities/ticket.entity'
import {
  TicketManager,
  TicketProcedureItemManager,
  TicketProcedureManager,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

export type TIcketProcedureItemAddType = Pick<TicketProcedureItem, 'completedAt'>

export type TIcketProcedureAddType = Pick<
  TicketProcedure,
  | 'priority'
  | 'paymentMoneyStatus'
  | 'procedureId'
  | 'status'
  | 'quantity'
  | 'totalSessions'
  | 'expectedPrice'
  | 'discountMoney'
  | 'discountPercent'
  | 'discountType'
  | 'actualPrice'
  | 'createdAt'
> & { ticketProcedureItemAddList: TIcketProcedureItemAddType[] }

@Injectable()
export class TicketAddTicketProcedureListOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketProcedureItemManager: TicketProcedureItemManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async addTicketProcedureList<T extends TIcketProcedureAddType>(params: {
    oid: number
    ticketId: number
    ticketProcedureDtoList: NoExtra<TIcketProcedureAddType, T>[]
  }) {
    const { oid, ticketId, ticketProcedureDtoList } = params
    const PREFIX = `ticketId=${ticketId} addTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      let ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          status: {
            IN: [
              TicketStatus.Draft,
              TicketStatus.Schedule,
              TicketStatus.Deposited,
              TicketStatus.Executing,
            ],
          },
        },
        { updatedAt: Date.now() }
      )

      // === 2. INSERT NEW ===
      const ticketProcedureInsertList = ticketProcedureDtoList.map((i) => {
        const insert: NoExtra<TicketProcedureInsertType> = {
          ...i,
          oid,
          ticketId,
          customerId: ticketModified.customerId,
          imageIds: JSON.stringify([]),
          completedSessions: 0,
        }
        return insert
      })
      const ticketProcedureCreatedList =
        await this.ticketProcedureManager.insertManyAndReturnEntity(
          manager,
          ticketProcedureInsertList
        )

      const ticketProcedureItemInsertList = ticketProcedureDtoList
        .map((i, index) => {
          return i.ticketProcedureItemAddList.map((j) => {
            const insert: NoExtra<TicketProcedureItemInsertType> = {
              completedAt: j.completedAt,
              oid,
              ticketId,
              ticketProcedureId: ticketProcedureCreatedList[index].id,
              status: TicketProcedureStatus.Pending,
              imageIds: '[]',
              result: '',
            }
            return insert
          })
        })
        .flat()
      const ticketProcedureItemCreatedList =
        await this.ticketProcedureItemManager.insertManyAndReturnEntity(
          manager,
          ticketProcedureItemInsertList
        )

      const ticketProcedureItemCreatedMapList = ESArray.arrayToKeyArray(
        ticketProcedureItemCreatedList,
        'ticketProcedureId'
      )

      ticketProcedureCreatedList.forEach((i) => {
        i.ticketProcedureItemList = ticketProcedureItemCreatedMapList[i.id] || []
      })

      // === 5. UPDATE TICKET: MONEY  ===
      const itemsDiscountAdd = ticketProcedureCreatedList.reduce((acc, item) => {
        return acc + item.quantity * item.discountMoney
      }, 0)
      const procedureMoneyAdd = ticketProcedureCreatedList.reduce((acc, item) => {
        return acc + item.quantity * item.actualPrice
      }, 0)

      if (procedureMoneyAdd != 0 || itemsDiscountAdd !== 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin: ticketModified,
          itemMoney: {
            procedureMoneyAdd,
            itemsDiscountAdd,
          },
        })
      }
      return { ticketModified, ticketProcedureCreatedList }
    })

    return transaction
  }
}
