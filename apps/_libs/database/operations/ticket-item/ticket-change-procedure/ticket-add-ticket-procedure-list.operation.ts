import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { ESArray } from '../../../../common/helpers'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { TicketProcedureStatus } from '../../../common/variable'
import { TicketProcedureItem, TicketUser } from '../../../entities'
import {
  AppointmentInsertType,
  AppointmentStatus,
  AppointmentType,
} from '../../../entities/appointment.entity'
import { TicketProcedureItemInsertType } from '../../../entities/ticket-procedure-item.entity'
import TicketProcedure, {
  TicketProcedureInsertType,
} from '../../../entities/ticket-procedure.entity'
import { TicketStatus } from '../../../entities/ticket.entity'
import {
  AppointmentManager,
  TicketManager,
  TicketProcedureItemManager,
  TicketProcedureManager,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../ticket-change-user/ticket-user.common'

export type TicketProcedureItemAddType = Pick<TicketProcedureItem, 'registeredAt' | 'indexSession'>

export type TicketProcedureAddType = {
  ticketProcedureAdd: Pick<
    TicketProcedure,
    | 'priority'
    | 'paymentMoneyStatus'
    | 'procedureId'
    | 'procedureType'
    | 'status'
    | 'quantity'
    | 'totalSessions'
    | 'expectedPrice'
    | 'discountMoney'
    | 'discountPercent'
    | 'discountType'
    | 'actualPrice'
    | 'createdAt'
  >
  ticketProcedureItemAddList: TicketProcedureItemAddType[]
  ticketUserRequestAddList: Pick<TicketUser, 'positionId' | 'userId'>[]
}

@Injectable()
export class TicketAddTicketProcedureListOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketProcedureItemManager: TicketProcedureItemManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketUserCommon: TicketUserCommon,
    private appointmentManager: AppointmentManager
  ) { }

  async addTicketProcedureList(params: {
    oid: number
    ticketId: number
    ticketProcedureDtoList: TicketProcedureAddType[]
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
        const insert: TicketProcedureInsertType = {
          ...i.ticketProcedureAdd,
          oid,
          ticketId,
          customerId: ticketModified.customerId,
          finishedSessions: 0,
        }
        return insert
      })

      const ticketProcedureCreatedList =
        await this.ticketProcedureManager.insertManyAndReturnEntity(
          manager,
          ticketProcedureInsertList
        )

      const ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
        manager,
        oid,
        ticketId,
        createdAt: Date.now(),
        ticketUserDtoList: ticketProcedureDtoList
          .map((i, index) => {
            return i.ticketUserRequestAddList.map((j) => {
              const ticketProcedureCreated = ticketProcedureCreatedList[index]
              return {
                ...j,
                quantity: ticketProcedureCreated.quantity,
                ticketItemId: ticketProcedureCreated.id,
                ticketItemChildId: 0,
                positionInteractId: ticketProcedureCreated.procedureId,
                ticketItemExpectedPrice: ticketProcedureCreated.expectedPrice,
                ticketItemActualPrice: ticketProcedureCreated.actualPrice,
              }
            })
          })
          .flat()
          .filter((i) => !!i.userId),
      })

      const tpiCreatedList = await this.ticketProcedureItemManager.insertManyAndReturnEntity(
        manager,
        ticketProcedureDtoList
          .map((i, index) => {
            return i.ticketProcedureItemAddList.map((j) => {
              const insert: NoExtra<TicketProcedureItemInsertType> = {
                ...j,
                oid,
                ticketId,
                ticketProcedureId: ticketProcedureCreatedList[index].id,
                status: TicketProcedureStatus.Pending,
                imageIds: '[]',
                result: '',
                completedAt: null,
              }
              return insert
            })
          })
          .flat()
      )

      const appointmentInsertListDto = tpiCreatedList
        .filter((i) => !!i.registeredAt)
        .map((i) => {
          const appointmentInsert: AppointmentInsertType = {
            oid,
            customerId: ticketModified.customerId,
            customerSourceId: 0,
            type: AppointmentType.TicketProcedure,
            status: AppointmentStatus.Waiting,
            registeredAt: i.registeredAt,
            reason: '',
            fromTicketId: ticketModified.id,
            toTicketId: ticketModified.id,
            ticketProcedureId: i.ticketProcedureId,
            ticketProcedureItemId: i.id,
            cancelReason: '',
          }
          return appointmentInsert
        })
      await this.appointmentManager.insertManyAndReturnEntity(manager, appointmentInsertListDto)

      const ticketProcedureItemCreatedMapList = ESArray.arrayToKeyArray(
        tpiCreatedList,
        'ticketProcedureId'
      )

      ticketProcedureCreatedList.forEach((i) => {
        i.ticketProcedureItemList = ticketProcedureItemCreatedMapList[i.id] || []
        i.ticketProcedureItemList.forEach((i) => (i.imageList = []))
      })

      // === 5. UPDATE TICKET: MONEY  ===
      const itemsDiscountAdd = ticketProcedureCreatedList.reduce((acc, item) => {
        return acc + item.quantity * item.discountMoney
      }, 0)
      const procedureMoneyAdd = ticketProcedureCreatedList.reduce((acc, item) => {
        return acc + item.quantity * item.actualPrice
      }, 0)
      const commissionMoneyAdd = ticketUserCreatedList.reduce((acc, item) => {
        return acc + item.quantity * item.commissionMoney
      }, 0)

      if (procedureMoneyAdd != 0 || itemsDiscountAdd !== 0 || commissionMoneyAdd !== 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin: ticketModified,
          itemMoney: {
            procedureMoneyAdd,
            itemsDiscountAdd,
            commissionMoneyAdd,
          },
        })
      }
      return { ticketModified, ticketProcedureCreatedList, ticketUserCreatedList }
    })

    return transaction
  }
}
