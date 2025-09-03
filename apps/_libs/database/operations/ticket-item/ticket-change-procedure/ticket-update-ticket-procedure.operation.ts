import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { PaymentMoneyStatus, TicketProcedureStatus } from '../../../common/variable'
import { TicketProcedureItem, TicketUser } from '../../../entities'
import {
  AppointmentInsertType,
  AppointmentStatus,
  AppointmentType,
  AppointmentUpdateType,
} from '../../../entities/appointment.entity'
import { PositionType } from '../../../entities/position.entity'
import { ProcedureType } from '../../../entities/procedure.entity'
import { TicketProcedureItemInsertType } from '../../../entities/ticket-procedure-item.entity'
import TicketProcedure from '../../../entities/ticket-procedure.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import {
  AppointmentManager,
  TicketManager,
  TicketProcedureItemManager,
  TicketProcedureManager,
  TicketUserManager,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../ticket-change-user/ticket-user.common'

export type TicketProcedureUpdateDtoType = {
  [K in keyof Pick<
    TicketProcedure,
    | 'status'
    | 'totalSessions'
    | 'finishedSessions'
    | 'quantity'
    | 'expectedPrice'
    | 'discountType'
    | 'discountMoney'
    | 'discountPercent'
    | 'actualPrice'
  >]: TicketProcedure[K] | (() => string)
}

@Injectable()
export class TicketUpdateTicketProcedureOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketProcedureItemManager: TicketProcedureItemManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private appointmentManager: AppointmentManager,
    private ticketUserManager: TicketUserManager,
    private ticketUserCommon: TicketUserCommon
  ) { }

  async updateTicketProcedure<T extends TicketProcedureUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketProcedureId: number
    ticketProcedureUpdateDto?: NoExtra<TicketProcedureUpdateDtoType, T>
    ticketProcedureItemUpdateList?: Pick<
      TicketProcedureItem,
      'id' | 'registeredAt' | 'indexSession'
    >[]
    ticketUserRequestList?: Pick<TicketUser, 'positionId' | 'userId'>[]
  }) {
    const {
      oid,
      ticketId,
      ticketProcedureId,
      ticketProcedureUpdateDto,
      ticketProcedureItemUpdateList,
      ticketUserRequestList,
    } = params
    const PREFIX = `ticketId=${ticketId} updateTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketProcedureOrigin = await this.ticketProcedureManager.findOneBy(manager, {
        oid,
        ticketId,
        id: ticketProcedureId,
      })

      let ticketProcedureModified: TicketProcedure = ticketProcedureOrigin
      let procedureMoneyChange = 0
      let itemsDiscountChange = 0
      if (ticketProcedureUpdateDto) {
        if (ticketProcedureOrigin.paymentMoneyStatus !== PaymentMoneyStatus.Paid) {
          ticketProcedureModified = await this.ticketProcedureManager.updateOneAndReturnEntity(
            manager,
            { oid, id: ticketProcedureId },
            {
              quantity: ticketProcedureUpdateDto.quantity,
              status: ticketProcedureUpdateDto.status,
              totalSessions: ticketProcedureUpdateDto.totalSessions,
              finishedSessions: ticketProcedureUpdateDto.finishedSessions,
              expectedPrice: ticketProcedureUpdateDto.expectedPrice,
              discountType: ticketProcedureUpdateDto.discountType,
              discountMoney: ticketProcedureUpdateDto.discountMoney,
              discountPercent: ticketProcedureUpdateDto.discountPercent,
              actualPrice: ticketProcedureUpdateDto.actualPrice,
            }
          )
        } else {
          ticketProcedureModified = await this.ticketProcedureManager.updateOneAndReturnEntity(
            manager,
            { oid, id: ticketProcedureId },
            {
              status: ticketProcedureUpdateDto.status,
              totalSessions: ticketProcedureUpdateDto.totalSessions,
              finishedSessions: ticketProcedureUpdateDto.finishedSessions,
            }
          )
        }

        procedureMoneyChange =
          ticketProcedureModified.quantity * ticketProcedureModified.actualPrice
          - ticketProcedureOrigin.quantity * ticketProcedureOrigin.actualPrice
        itemsDiscountChange =
          ticketProcedureModified.quantity * ticketProcedureModified.discountMoney
          - ticketProcedureOrigin.quantity * ticketProcedureOrigin.discountMoney
      }

      if (ticketProcedureItemUpdateList && ticketProcedureOrigin.type === ProcedureType.Regimen) {
        // DELETE OLD
        await this.ticketProcedureItemManager.delete(manager, {
          oid,
          ticketId,
          ticketProcedureId,
          status: { NOT: TicketProcedureStatus.Completed },
          id: { NOT_IN: [0, ...ticketProcedureItemUpdateList.map((i) => i.id)] },
        })
        await this.appointmentManager.delete(manager, {
          oid,
          fromTicketId: ticketId,
          toTicketId: ticketId,
          customerId: ticketOrigin.customerId,
          ticketProcedureId,
          ticketProcedureItemId: {
            NOT_IN: [
              0,
              ...ticketProcedureItemUpdateList.filter((i) => !!i.registeredAt).map((i) => i.id),
            ],
          },
        })

        // INSERT NEW
        const tpiInsertList = ticketProcedureItemUpdateList
          .filter((i) => !i.id)
          .map((i) => {
            const insert: TicketProcedureItemInsertType = {
              ...i,
              oid,
              ticketId,
              ticketProcedureId,
              status: TicketProcedureStatus.Pending,
              imageIds: '[]',
              result: '',
              completedAt: null,
            }
            return insert
          })
        const tpiCreatedList = await this.ticketProcedureItemManager.insertManyAndReturnEntity(
          manager,
          tpiInsertList
        )
        const appointmentInsertListDto = tpiCreatedList
          .filter((i) => !!i.registeredAt)
          .map((i) => {
            const appointmentInsert: AppointmentInsertType = {
              oid,
              customerId: ticketOrigin.customerId,
              customerSourceId: 0,
              status: AppointmentStatus.Waiting,
              type: AppointmentType.TicketProcedure,
              registeredAt: i.registeredAt,
              reason: '',
              fromTicketId: ticketOrigin.id,
              toTicketId: ticketOrigin.id,
              ticketProcedureId: i.ticketProcedureId,
              ticketProcedureItemId: i.id,
              cancelReason: '',
            }
            return appointmentInsert
          })
        await this.appointmentManager.insertManyAndReturnEntity(manager, appointmentInsertListDto)

        // UPDATE
        const tpiUpdateList = ticketProcedureItemUpdateList.filter((i) => i.id)
        if (tpiUpdateList.length) {
          await this.ticketProcedureItemManager.bulkUpdate({
            manager,
            condition: { oid, ticketId, ticketProcedureId },
            compare: ['id'],
            tempList: tpiUpdateList,
            update: { indexSession: true, registeredAt: { cast: 'bigint' } },
            options: { requireEqualLength: true },
          })
        }

        const appointmentUpdateListDto = ticketProcedureItemUpdateList
          .filter((i) => !!i.id && !!i.registeredAt)
          .map((i) => {
            const updateDto: Partial<AppointmentUpdateType> = {
              registeredAt: i.registeredAt,
              ticketProcedureItemId: i.id,
            }
            return updateDto
          })
        if (appointmentUpdateListDto.length) {
          await this.appointmentManager.bulkUpdate({
            manager,
            condition: { oid, fromTicketId: ticketId, toTicketId: ticketId, ticketProcedureId },
            compare: ['ticketProcedureItemId'],
            tempList: appointmentUpdateListDto,
            update: ['registeredAt'],
            options: { requireEqualLength: true },
          })
        }
      }

      let ticketUserDestroyList: TicketUser[] = []
      let ticketUserCreatedList: TicketUser[] = []
      let commissionMoneyAdd = 0
      if (ticketUserRequestList) {
        ticketUserDestroyList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
          oid,
          ticketId,
          positionType: PositionType.ProcedureRequest,
          ticketItemId: ticketProcedureModified.id,
        })
        ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
          manager,
          createdAt: ticketProcedureModified.createdAt,
          oid,
          ticketId,
          ticketUserDtoList: ticketUserRequestList.map((i) => {
            return {
              positionId: i.positionId,
              userId: i.userId,
              quantity: ticketProcedureModified.quantity,
              ticketItemId: ticketProcedureModified.id,
              ticketItemChildId: 0,
              positionInteractId: ticketProcedureModified.procedureId,
              ticketItemExpectedPrice: ticketProcedureModified.expectedPrice,
              ticketItemActualPrice: ticketProcedureModified.actualPrice,
            }
          }),
        })

        commissionMoneyAdd =
          ticketUserCreatedList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
          - ticketUserDestroyList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
      }

      // === 5. UPDATE TICKET: MONEY  ===
      let ticketModified: Ticket = ticketOrigin
      if (procedureMoneyChange != 0 || itemsDiscountChange != 0 || commissionMoneyAdd != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            procedureMoneyAdd: procedureMoneyChange,
            itemsDiscountAdd: itemsDiscountChange,
            commissionMoneyAdd,
          },
        })
      }
      return {
        ticketModified,
        ticketProcedureModified,
        ticketUserCreatedList,
        ticketUserDestroyList,
      }
    })

    return transaction
  }
}
