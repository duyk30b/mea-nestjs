import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { PaymentMoneyStatus, TicketRegimenStatus } from '../../../common/variable'
import { TicketRegimen, TicketUser } from '../../../entities'
import TicketProcedure, {
  TicketProcedureInsertType,
  TicketProcedureType,
} from '../../../entities/ticket-procedure.entity'
import { TicketRegimenInsertType } from '../../../entities/ticket-regimen.entity'
import { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProcedureManager, TicketRegimenManager } from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../ticket-change-user/ticket-user.common'

type TicketRegimenAdd = Pick<
  TicketRegimen,
  | 'regimenId'
  | 'paymentMoneyStatus'
  | 'expectedPrice'
  | 'discountMoney'
  | 'discountPercent'
  | 'discountType'
  | 'actualPrice'
>

type TicketProcedureAddType = Pick<
  TicketProcedure,
  | 'priority'
  | 'procedureId'
  | 'status'
  | 'paymentMoneyStatus'
  | 'quantity'
  | 'expectedPrice'
  | 'discountType'
  | 'discountPercent'
  | 'discountMoney'
  | 'actualPrice'
>

type TicketUserRequestAdd = Pick<TicketUser, 'positionId' | 'userId'>

@Injectable()
export class TicketAddTicketProcedureListOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager,
    private ticketRegimenManager: TicketRegimenManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketUserCommon: TicketUserCommon
  ) { }

  async addTicketProcedureList<
    T extends TicketRegimenAdd,
    U extends TicketProcedureAddType,
    X extends TicketUserRequestAdd,
  >(params: {
    oid: number
    ticketId: number
    ticketRegimenAddWrapList: {
      ticketRegimenAdd: NoExtra<TicketRegimenAdd, T>
      ticketProcedureRegimenAddWrapList: {
        totalSession: number
        ticketProcedureAdd: NoExtra<TicketProcedureAddType, U>
      }[]
      ticketUserRequestAddList: NoExtra<TicketUserRequestAdd, X>[]
    }[]
    ticketProcedureNormalWrapList: {
      ticketProcedureAdd: NoExtra<TicketProcedureAddType, U>
      ticketUserRequestAddList: NoExtra<TicketUserRequestAdd, X>[]
    }[]
  }) {
    const { oid, ticketId, ticketRegimenAddWrapList, ticketProcedureNormalWrapList } = params
    const PREFIX = `ticketId=${ticketId} addTicketProcedureList failed`
    const createdAt = Date.now()

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
      const customerId = ticketModified.customerId

      // === 2. INSERT TICKET_REGIMEN ===
      const ticketRegimenCreatedList = await this.ticketRegimenManager.insertManyAndReturnEntity(
        manager,
        ticketRegimenAddWrapList.map((i) => {
          const insert: TicketRegimenInsertType = {
            ...i.ticketRegimenAdd,
            oid,
            ticketId,
            customerId,
            // paymentMoneyStatus: PaymentMoneyStatus.PendingPayment, // truyền lên là NoEffect hoặc Pending
            status: TicketRegimenStatus.Pending,
            completedAt: null,
            costAmount: 0,
            commissionAmount: 0,
            createdAt,
          }
          return insert
        })
      )

      const ticketUserRegimenCreatedList = await this.ticketUserCommon.addTicketUserList({
        manager,
        oid,
        ticketId,
        createdAt,
        ticketUserDtoList: ticketRegimenAddWrapList
          .map((i, index) => {
            return i.ticketUserRequestAddList.map((j) => {
              const ticketRegimenCreated = ticketRegimenCreatedList[index]
              return {
                ...j,
                quantity: 1,
                ticketItemId: ticketRegimenCreated.id,
                ticketItemChildId: 0,
                positionInteractId: ticketRegimenCreated.regimenId,
                ticketItemExpectedPrice: ticketRegimenCreated.expectedPrice,
                ticketItemActualPrice: ticketRegimenCreated.actualPrice,
              }
            })
          })
          .flat()
          .filter((i) => !!i.userId),
      })

      const ticketProcedureRegimeInsertList = ticketRegimenAddWrapList
        .map((trWrap, trIndex) => {
          const ticketRegimenCreated = ticketRegimenCreatedList[trIndex]

          const temp = trWrap.ticketProcedureRegimenAddWrapList
            .map((tpWrap, tpIndex) => {
              const { ticketProcedureAdd } = tpWrap
              return Array.from({ length: tpWrap.totalSession }, (_, i) => {
                const insert: TicketProcedureInsertType = {
                  oid,
                  ticketId: 0, // ticket nào xử lý sẽ lấy ticketId
                  procedureId: ticketProcedureAdd.procedureId,
                  ticketRegimenId: ticketRegimenCreated.id,
                  customerId: ticketModified.customerId,
                  priority: i + 1,
                  sessionIndex: i + 1,
                  quantity: 1,

                  discountMoney: ticketProcedureAdd.discountMoney,
                  discountPercent: ticketProcedureAdd.discountPercent,
                  discountType: ticketProcedureAdd.discountType,
                  expectedPrice: ticketProcedureAdd.expectedPrice,
                  actualPrice: ticketProcedureAdd.actualPrice,

                  status: ticketProcedureAdd.status,
                  paymentMoneyStatus: ticketProcedureAdd.paymentMoneyStatus,
                  ticketProcedureType: TicketProcedureType.InRegimen,

                  createdAt,
                  completedAt: null,
                  result: '',
                  imageIds: '[]',
                  costAmount: 0,
                  commissionAmount: 0,
                }
                return insert
              })
            })
            .flat()
          return temp
        })
        .flat()

      const ticketProcedureRegimenCreatedList =
        await this.ticketProcedureManager.insertManyAndReturnEntity(
          manager,
          ticketProcedureRegimeInsertList
        )

      ticketRegimenCreatedList.forEach((tr) => {
        tr.ticketProcedureList = ticketProcedureRegimenCreatedList.filter((tri) => {
          return tri.ticketRegimenId === tr.id
        })
        tr.ticketUserRequestList = ticketUserRegimenCreatedList.filter((tu) => {
          return tu.ticketItemId === tr.id
        })
        tr.commissionAmount = tr.ticketUserRequestList.reduce((acc, cur) => {
          return acc + cur.quantity * cur.commissionMoney
        }, 0)
      })

      await this.ticketRegimenManager.bulkUpdate({
        manager,
        condition: { oid, ticketId, customerId },
        tempList: ticketRegimenCreatedList
          .filter((i) => i.commissionAmount)
          .map((i) => ({
            id: i.id,
            commissionAmount: i.commissionAmount,
          })),
        compare: ['id'],
        update: ['commissionAmount'],
        options: { requireEqualLength: true },
      })

      // === 3. INSERT TICKET_NORMAL ===
      const ticketProcedureNormalCreatedList =
        await this.ticketProcedureManager.insertManyAndReturnEntity(
          manager,
          ticketProcedureNormalWrapList.map((i) => {
            const insert: TicketProcedureInsertType = {
              ...i.ticketProcedureAdd,
              oid,
              ticketId,
              customerId,
              ticketProcedureType: TicketProcedureType.Normal,
              ticketRegimenId: 0,
              sessionIndex: 0,
              // status: TicketProcedureStatus.Pending,
              // paymentMoneyStatus: PaymentMoneyStatus.PendingPayment,
              createdAt,
              completedAt: null,
              result: '',
              imageIds: JSON.stringify([]),
              costAmount: 0,
              commissionAmount: 0,
            }
            return insert
          })
        )

      const ticketUserNormalCreatedList = await this.ticketUserCommon.addTicketUserList({
        manager,
        oid,
        ticketId,
        createdAt: Date.now(),
        ticketUserDtoList: ticketProcedureNormalWrapList
          .map((i, index) => {
            return i.ticketUserRequestAddList.map((j) => {
              const ticketProcedureCreated = ticketProcedureNormalCreatedList[index]
              return {
                ...j,
                quantity: 1,
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

      ticketProcedureNormalCreatedList.forEach((tp) => {
        tp.ticketUserRequestList = ticketUserNormalCreatedList.filter((tu) => {
          return tu.ticketItemId === tp.id
        })
        tp.commissionAmount = tp.ticketUserRequestList.reduce((acc, cur) => {
          return acc + cur.quantity * cur.commissionMoney
        }, 0)
      })

      await this.ticketProcedureManager.bulkUpdate({
        manager,
        condition: { oid, ticketId, customerId },
        tempList: ticketProcedureNormalCreatedList
          .filter((i) => i.commissionAmount)
          .map((i) => ({
            id: i.id,
            commissionAmount: i.commissionAmount,
          })),
        compare: ['id'],
        update: ['commissionAmount'],
        options: { requireEqualLength: true },
      })

      // === 5. UPDATE TICKET: MONEY  ===
      const itemsDiscountAdd =
        ticketRegimenCreatedList.reduce((acc, item) => {
          const currentMoney =
            item.paymentMoneyStatus === PaymentMoneyStatus.NoEffect ? 0 : item.discountMoney
          return acc + currentMoney
        }, 0)
        + ticketProcedureNormalCreatedList.reduce((acc, item) => {
          return acc + item.quantity * item.discountMoney
        }, 0)
      const procedureMoneyAdd =
        ticketRegimenCreatedList.reduce((acc, item) => {
          const currentMoney =
            item.paymentMoneyStatus === PaymentMoneyStatus.NoEffect ? 0 : item.actualPrice
          return acc + currentMoney
        }, 0)
        + ticketProcedureNormalCreatedList.reduce((acc, item) => {
          return acc + item.quantity * item.actualPrice
        }, 0)
      const commissionMoneyAdd = [
        ...ticketUserRegimenCreatedList,
        ...ticketUserNormalCreatedList,
      ].reduce((acc, item) => {
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
      return {
        ticketModified,
        ticketRegimenCreatedList,
        ticketProcedureNormalCreatedList,
        ticketUserCreatedList: [...ticketUserNormalCreatedList, ...ticketUserRegimenCreatedList],
      }
    })

    return transaction
  }
}
