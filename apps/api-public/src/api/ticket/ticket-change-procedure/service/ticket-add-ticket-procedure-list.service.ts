import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../../../_libs/common/cache-data/cache-data.service'
import { GenerateId } from '../../../../../../_libs/database/common/generate-id'
import {
  PaymentMoneyStatus,
  TicketRegimenStatus,
} from '../../../../../../_libs/database/common/variable'
import {
  TicketProcedureInsertType,
  TicketProcedureStatus,
  TicketProcedureType,
} from '../../../../../../_libs/database/entities/ticket-procedure.entity'
import { TicketRegimenItemInsertType } from '../../../../../../_libs/database/entities/ticket-regimen-item.entity'
import { TicketRegimenInsertType } from '../../../../../../_libs/database/entities/ticket-regimen.entity'
import { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import {
  TicketChangeItemMoneyManager,
  TicketUserCommon,
} from '../../../../../../_libs/database/operations'
import {
  TicketProcedureRepository,
  TicketRegimenItemRepository,
  TicketRegimenRepository,
  TicketRepository,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { TicketAddTicketProcedureListBody } from '../request'

@Injectable()
export class TicketAddTicketProcedureListService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private ticketRepository: TicketRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketRegimenItemRepository: TicketRegimenItemRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketUserCommon: TicketUserCommon
  ) { }

  async addTicketProcedureList(props: {
    oid: number
    ticketId: string
    body: TicketAddTicketProcedureListBody
  }) {
    const { oid, ticketId, body } = props
    const ticketRegimenWrapList = body.ticketRegimenWrapList.map((i) => {
      return {
        ticketRegimenAdd: {
          ...i.ticketRegimenAdd,
          id: GenerateId.nextId(),
        },
        ticketRegimenItemAddList: i.ticketRegimenItemAddList,
        ticketUserRequestAddList: i.ticketUserRequestAddList,
      }
    })
    const ticketProcedureWrapList = body.ticketProcedureWrapList.map((i) => {
      return {
        ticketProcedureAdd: {
          ...i.ticketProcedureAdd,
          id: GenerateId.nextId(),
        },
        ticketUserRequestAddList: i.ticketUserRequestAddList,
      }
    })

    const createdAt = Date.now()

    const transaction = await this.ticketRepository.transaction(
      'READ UNCOMMITTED',
      async (manager) => {
        // === 1. UPDATE TICKET FOR TRANSACTION ===
        let ticketModified = await this.ticketRepository.managerUpdateOne(
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
        const { customerId } = ticketModified

        // // === 2. INSERT TICKET_REGIMEN ===
        const ticketUserRegimenCreatedList = await this.ticketUserCommon.addTicketUserList({
          manager,
          oid,
          ticketId,
          createdAt,
          ticketUserDtoList: ticketRegimenWrapList
            .map((trWrap, index) => {
              return trWrap.ticketUserRequestAddList.map((j) => {
                const ticketRegimenAdd = trWrap.ticketRegimenAdd
                return {
                  ...j,
                  quantity: 1,
                  ticketItemId: ticketRegimenAdd.id,
                  positionInteractId: ticketRegimenAdd.regimenId,
                  ticketItemExpectedPrice: ticketRegimenAdd.expectedMoney,
                  ticketItemActualPrice: ticketRegimenAdd.actualMoney,
                }
              })
            })
            .flat()
            .filter((i) => !!i.userId),
        })

        const ticketRegimenItemInsertList = ticketRegimenWrapList
          .map((trWrap, trIndex) => {
            const ticketRegimenAdd = trWrap.ticketRegimenAdd
            const temp = trWrap.ticketRegimenItemAddList.map((triAdd, triIndex) => {
              const ticketRegimenItemAdd = triAdd
              const insert = {
                ...ticketRegimenItemAdd,
                id: GenerateId.nextId(),
                oid,
                customerId,
                ticketId,
                regimenId: ticketRegimenAdd.regimenId,
                ticketRegimenId: ticketRegimenAdd.id,
                quantityFinish: 0,
                quantityPayment: 0,
                paymentMoneyAmount: 0,
              } satisfies TicketRegimenItemInsertType
              return insert
            })
            return temp
          })
          .flat()

        const ticketRegimenItemCreatedList =
          await this.ticketRegimenItemRepository.managerInsertMany(
            manager,
            ticketRegimenItemInsertList
          )

        const ticketProcedureRegimenInsertList = ticketRegimenItemCreatedList
          .map((triCreated, triIndex) => {
            const length = triCreated.quantityExpected
            const totalExpectedMoneyRemain = triCreated.expectedMoneyAmount
            const totalDiscountMoneyRemain = triCreated.discountMoneyAmount
            const totalActualMoneyRemain = triCreated.actualMoneyAmount

            const expectedPrice = Math.floor(totalExpectedMoneyRemain / length / 1000) * 1000
            const discountMoney = Math.floor(totalDiscountMoneyRemain / length / 1000) * 1000
            const actualPrice = Math.floor(totalActualMoneyRemain / length / 1000) * 1000

            const firstExpectedPrice = totalExpectedMoneyRemain - expectedPrice * (length - 1)
            const firstDiscountMoney = totalDiscountMoneyRemain - discountMoney * (length - 1)
            const firstActualPrice = totalActualMoneyRemain - actualPrice * (length - 1)

            const tpInsertList = Array.from({ length }, (_, i) => {
              const tpInsert: TicketProcedureInsertType = {
                id: GenerateId.nextId(),
                oid,
                ticketId,
                customerId,
                procedureId: triCreated.procedureId,
                ticketRegimenId: triCreated.ticketRegimenId,
                ticketRegimenItemId: triCreated.id,
                indexSession: i + 1,
                createdAt,
                ticketProcedureType: TicketProcedureType.InRegimen,
                paymentMoneyStatus: PaymentMoneyStatus.NoEffect,
                status: TicketProcedureStatus.NoEffect,
                costAmount: 0,
                commissionAmount: 0,
                completedAt: null,
                result: '',
                imageIds: '[]',
                expectedPrice: i === 0 ? firstExpectedPrice : expectedPrice,
                discountMoney: i === 0 ? firstDiscountMoney : discountMoney,
                discountPercent: triCreated.discountPercent,
                discountType: triCreated.discountType,
                actualPrice: i === 0 ? firstActualPrice : actualPrice,
                priority: 0,
                quantity: 1,
              } satisfies TicketProcedureInsertType
              return tpInsert
            })
            return tpInsertList
          })
          .flat()

        const ticketProcedureRegimenCreatedList =
          await this.ticketProcedureRepository.managerInsertMany(
            manager,
            ticketProcedureRegimenInsertList
          )

        const ticketRegimenCreatedList = await this.ticketRegimenRepository.managerInsertMany(
          manager,
          ticketRegimenWrapList.map((i) => {
            const ticketRegimenAdd = i.ticketRegimenAdd
            const insert = {
              ...ticketRegimenAdd,
              oid,
              ticketId,
              customerId,
              status: TicketRegimenStatus.Pending,
              completedAt: null,
              costAmount: 0,
              commissionAmount: ticketUserRegimenCreatedList
                .filter((tu) => tu.ticketItemId === ticketRegimenAdd.id)
                .reduce((acc, cur) => acc + cur.quantity * cur.commissionMoney, 0),
              createdAt,
              spentMoney: 0,
              remainingMoney: 0,
            } satisfies TicketRegimenInsertType
            return insert
          })
        )

        // // === 3. INSERT TICKET_PROCEDURE ===
        const ticketUserProcedureCreatedList = await this.ticketUserCommon.addTicketUserList({
          manager,
          oid,
          ticketId,
          createdAt: Date.now(),
          ticketUserDtoList: ticketProcedureWrapList
            .map((tpWrap, index) => {
              const tpAdd = tpWrap.ticketProcedureAdd
              return tpWrap.ticketUserRequestAddList.map((j) => {
                return {
                  ...j,
                  quantity: tpAdd.quantity,
                  ticketItemId: tpAdd.id,
                  positionInteractId: tpAdd.procedureId,
                  ticketItemExpectedPrice: tpAdd.expectedPrice,
                  ticketItemActualPrice: tpAdd.actualPrice,
                }
              })
            })
            .flat()
            .filter((i) => !!i.userId),
        })

        const ticketProcedureNormalCreatedList =
          await this.ticketProcedureRepository.managerInsertMany(
            manager,
            ticketProcedureWrapList.map((tpWrap) => {
              const tpAdd = tpWrap.ticketProcedureAdd
              const insert: TicketProcedureInsertType = {
                ...tpAdd,
                oid,
                ticketId,
                customerId,
                ticketProcedureType: TicketProcedureType.Normal,
                ticketRegimenId: '0',
                ticketRegimenItemId: '0',
                indexSession: 0,
                paymentMoneyStatus: ticketModified.isPaymentEachItem
                  ? PaymentMoneyStatus.PendingPayment
                  : PaymentMoneyStatus.TicketPaid,
                createdAt,
                completedAt: null,
                result: '',
                imageIds: JSON.stringify([]),
                costAmount: 0,
                commissionAmount: ticketUserProcedureCreatedList
                  .filter((tu) => tu.ticketItemId === tpAdd.id)
                  .reduce((acc, cur) => acc + cur.quantity * cur.commissionMoney, 0),
              }
              return insert
            })
          )

        // === 5. UPDATE TICKET: MONEY  ===
        const itemsDiscountAdd =
          ticketRegimenItemCreatedList.reduce((acc, item) => {
            return acc + 0 // chỗ này do quantityPayment luôn = 0
          }, 0)
          + ticketProcedureNormalCreatedList.reduce((acc, item) => {
            return acc + item.quantity * item.discountMoney
          }, 0)
        const procedureMoneyAdd =
          ticketRegimenItemCreatedList.reduce((acc, item) => {
            return acc + item.paymentMoneyAmount // chỗ này thì luôn = 0
          }, 0)
          + ticketProcedureNormalCreatedList.reduce((acc, item) => {
            return acc + item.quantity * item.actualPrice
          }, 0)
        const commissionMoneyAdd = [
          ...ticketUserRegimenCreatedList,
          ...ticketUserProcedureCreatedList,
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

        this.socketEmitService.socketTicketChange(oid, {
          ticketId,
          ticketModified,
          ticketUser: {
            upsertedList: [...ticketUserProcedureCreatedList, ...ticketUserRegimenCreatedList],
          },
          ticketProcedure: {
            upsertedList: [
              ...ticketProcedureNormalCreatedList,
              ...ticketProcedureRegimenCreatedList,
            ],
          },
          ticketRegimen: { upsertedList: ticketRegimenCreatedList },
          ticketRegimenItem: { upsertedList: ticketRegimenItemCreatedList },
        })

        return {
          ticketModified,
          ticketRegimenCreatedList,
          ticketRegimenItem: { upsertedList: ticketRegimenItemCreatedList },

          ticketProcedureCreatedList: [
            ...ticketProcedureNormalCreatedList,
            ...ticketProcedureRegimenCreatedList,
          ],
          ticketUserCreatedList: [
            ...ticketUserProcedureCreatedList,
            ...ticketUserRegimenCreatedList,
          ],
        }
      }
    )

    return transaction
  }
}
