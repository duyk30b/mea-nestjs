import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../../../../_libs/common/helpers'
import { BusinessError } from '../../../../../../_libs/database/common/error'
import {
  PaymentMoneyStatus,
  TicketRegimenStatus,
} from '../../../../../../_libs/database/common/variable'
import { TicketUser } from '../../../../../../_libs/database/entities'
import { PositionType } from '../../../../../../_libs/database/entities/position.entity'
import TicketProcedure, {
  TicketProcedureStatus,
  TicketProcedureType,
} from '../../../../../../_libs/database/entities/ticket-procedure.entity'
import Ticket, { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../../../../../../_libs/database/operations/ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../../../../../../_libs/database/operations/ticket-item/ticket-change-user/ticket-user.common'
import {
  TicketProcedureRepository,
  TicketRegimenItemRepository,
  TicketRegimenRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { TicketUpdateMoneyTicketRegimenBody } from '../request'

@Injectable()
export class TicketUpdateMoneyTicketRegimenService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketRegimenItemRepository: TicketRegimenItemRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketUserCommon: TicketUserCommon,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateMoneyTicketRegimen(props: {
    oid: number
    ticketId: string
    ticketRegimenId: string
    body: TicketUpdateMoneyTicketRegimenBody
  }) {
    const { oid, ticketId, ticketRegimenId, body } = props
    const { ticketRegimenUpdate, ticketRegimenItemUpdateList } = body
    const ticketRegimenItemUpdateMap = ESArray.arrayToKeyValue(ticketRegimenItemUpdateList, 'id')

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. CHECK TICKET_REGIMEN ===
      const ticketRegimenOrigin = await this.ticketRegimenRepository.managerFindOneBy(manager, {
        oid,
        ticketId,
        id: ticketRegimenId,
      })

      if (![TicketRegimenStatus.Pending].includes(ticketRegimenOrigin.status)) {
        // Vẫn cho sửa nếu chưa thanh toán
        // throw new BusinessError('Trạng thái liệu trình không hợp lệ')
      }
      if (
        ticketRegimenOrigin.paid > 0
        || ticketRegimenOrigin.paidItem > 0
        || ticketRegimenOrigin.debt > 0
        || ticketRegimenOrigin.debtItem > 0
      ) {
        throw new BusinessError('Không thể sửa phiếu đã thanh toán')
      }

      // === 4. UPDATE TicketProcedure ===
      const ticketProcedureOriginList = await this.ticketProcedureRepository.findMany({
        condition: {
          oid,
          ticketId,
          ticketRegimenId,
          ticketProcedureType: TicketProcedureType.InRegimen,
        },
        sort: { id: 'ASC' },
      })
      const ticketProcedureFixList = TicketProcedure.fromRaws(ticketProcedureOriginList)
      const tpFixListMapTri = ESArray.arrayToKeyArray(ticketProcedureFixList, 'ticketRegimenItemId')
      Object.keys(tpFixListMapTri).forEach((triId) => {
        const triUpdate = ticketRegimenItemUpdateMap[triId]
        const lengthArray = tpFixListMapTri[triId]?.length
        if (lengthArray !== triUpdate.quantityRegular) {
          throw new BusinessError('Số lượng phiếu dịch vụ không đúng')
        }
        const totalMoneyAmountRegular = triUpdate.moneyAmountRegular
        const totalMoneyAmountSale = triUpdate.moneyAmountSale
        const totalDiscountMoney = triUpdate.discountMoneyAmount

        const expectedPrice = Math.floor(totalMoneyAmountRegular / lengthArray / 1000) * 1000
        const discountMoney = Math.floor(totalDiscountMoney / lengthArray / 1000) * 1000
        const actualPrice = Math.floor(totalMoneyAmountSale / lengthArray / 1000) * 1000

        const firstExpectedPrice = totalMoneyAmountRegular - expectedPrice * (lengthArray - 1)
        const firstDiscountMoney = totalDiscountMoney - discountMoney * (lengthArray - 1)
        const firstActualPrice = totalMoneyAmountSale - actualPrice * (lengthArray - 1)

        tpFixListMapTri[triId].forEach((tp, tpIndex) => {
          tp.expectedPrice = tpIndex === 0 ? firstExpectedPrice : expectedPrice
          tp.discountMoney = tpIndex === 0 ? firstDiscountMoney : discountMoney
          tp.actualPrice = tpIndex === 0 ? firstActualPrice : actualPrice
          tp.discountPercent = triUpdate.discountPercent
          tp.discountType = triUpdate.discountType
        })
      })

      const ticketProcedureModifiedList = await this.ticketProcedureRepository.managerBulkUpdate({
        manager,
        condition: {
          oid,
          ticketId,
          ticketRegimenId,
          ticketProcedureType: TicketProcedureType.InRegimen,
        },
        tempList: ticketProcedureFixList,
        compare: { id: { cast: 'bigint' } },
        update: [
          'expectedPrice',
          'discountMoney',
          'discountPercent',
          'discountType',
          'actualPrice',
        ],
        options: {},
      })

      // Nếu đã có buổi thanh toán rồi thì không sửa được
      ticketProcedureModifiedList.forEach((tp) => {
        if (
          [
            PaymentMoneyStatus.FullPaid,
            PaymentMoneyStatus.PartialPaid,
            PaymentMoneyStatus.Debt,
          ].includes(tp.paymentMoneyStatus)
        ) {
          throw new BusinessError('Đã có dịch vụ đã thanh toán, không thể sửa')
        }
      })

      // === 3. TICKET_USER ===
      let ticketUserDestroyedList: TicketUser[] = []
      let ticketUserCreatedList: TicketUser[] = []
      let commissionMoneyChange = 0
      if (ticketRegimenOrigin.commissionAmount) {
        ticketUserDestroyedList = await this.ticketUserRepository.managerDelete(manager, {
          oid,
          ticketId,
          $OR: [
            { positionType: PositionType.RegimenRequest, ticketItemId: ticketRegimenId },
            ...(ticketProcedureOriginList.length
              ? [
                {
                  positionType: PositionType.ProcedureResult,
                  ticketItemId: { IN: ticketProcedureOriginList.map((i) => i.id) },
                },
              ]
              : []),
          ],
          positionType: { IN: [PositionType.RegimenRequest] },
          ticketItemId: ticketRegimenId,
        })

        const commissionDestroy = ticketUserDestroyedList.reduce((acc, item) => {
          return acc + item.quantity * item.commissionMoney
        }, 0)

        if (commissionDestroy !== ticketRegimenOrigin.commissionAmount) {
          throw new BusinessError('Lỗi, hoa hồng tính toán sai', {
            commissionDestroy,
            'ticketRegimenOrigin.commissionAmount': ticketRegimenOrigin.commissionAmount,
          })
        }

        ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
          manager,
          createdAt: ticketRegimenOrigin.createdAt,
          oid,
          ticketId,
          ticketUserDtoList: ticketUserDestroyedList.map((tuDestroyed) => {
            if (tuDestroyed.positionType === PositionType.RegimenRequest) {
              return {
                positionId: tuDestroyed.positionId,
                userId: tuDestroyed.userId,
                quantity: 1,
                ticketItemId: ticketRegimenId,
                positionInteractId: ticketRegimenOrigin.regimenId,
                ticketItemExpectedPrice: ticketRegimenUpdate.expectedPrice,
                ticketItemActualPrice: ticketRegimenUpdate.actualPrice,
              }
            }
            if (tuDestroyed.positionType === PositionType.ProcedureResult) {
              const ticketProcedureModified = ticketProcedureModifiedList.find((tpModified) => {
                return tpModified.id === tuDestroyed.ticketItemId
              })
              return {
                positionId: tuDestroyed.positionId,
                userId: tuDestroyed.userId,
                quantity: 1,
                ticketItemId: ticketProcedureModified.id,
                positionInteractId: ticketProcedureModified.procedureId,
                ticketItemExpectedPrice: ticketProcedureModified.expectedPrice,
                ticketItemActualPrice: ticketProcedureModified.actualPrice,
              }
            }
          }),
        })

        commissionMoneyChange =
          ticketUserCreatedList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0) - commissionDestroy
      }

      const ticketRegimenItemModifiedList =
        await this.ticketRegimenItemRepository.managerBulkUpdate({
          manager,
          condition: { oid, ticketId, ticketRegimenId },
          tempList: ticketRegimenItemUpdateList.map((tri) => {
            return {
              ...tri,
              moneyAmountActual: ticketProcedureModifiedList
                .filter((tp) => {
                  return (
                    tp.ticketRegimenItemId === tri.id
                    && tp.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
                  )
                })
                .reduce((acc, item) => acc + item.quantity * item.actualPrice, 0),
              moneyAmountUsed: ticketProcedureModifiedList
                .filter((tp) => {
                  return (
                    tp.ticketRegimenItemId === tri.id
                    && tp.status === TicketProcedureStatus.Completed
                  )
                })
                .reduce((acc, item) => acc + item.quantity * item.actualPrice, 0),
            }
          }),
          compare: { id: { cast: 'bigint' } },
          update: [
            'moneyAmountRegular',
            'moneyAmountSale',
            'moneyAmountActual',
            'moneyAmountUsed',
            'discountMoneyAmount',
            'discountPercent',
            'discountType',
            'quantityRegular',
          ],
          options: {},
        })

      // Update ticketRegimen sau vì có thay đổi commission khi update ticketUser
      const ticketRegimenModified = await this.ticketRegimenRepository.managerUpdateOne(
        manager,
        { oid, id: ticketRegimenId },
        {
          expectedPrice: ticketRegimenUpdate.expectedPrice,
          actualPrice: ticketRegimenUpdate.actualPrice,
          moneyAmountActual: ticketRegimenItemModifiedList.reduce(
            (acc, item) => acc + item.moneyAmountActual,
            0
          ),
          moneyAmountUsed: ticketRegimenItemModifiedList.reduce(
            (acc, item) => acc + item.moneyAmountUsed,
            0
          ),
          discountType: ticketRegimenUpdate.discountType,
          discountMoney: ticketRegimenUpdate.discountMoney,
          discountPercent: ticketRegimenUpdate.discountPercent,
          commissionAmount: ticketRegimenOrigin.commissionAmount + commissionMoneyChange,
        }
      )

      const procedureMoneyChange =
        ticketProcedureModifiedList.reduce((acc, item) => {
          const money =
            item.status !== TicketProcedureStatus.NoEffect ? item.actualPrice * item.quantity : 0
          return acc + money
        }, 0)
        - ticketProcedureOriginList.reduce((acc, item) => {
          const money =
            item.status !== TicketProcedureStatus.NoEffect ? item.actualPrice * item.quantity : 0
          return acc + money
        }, 0)
      const itemsDiscountChange =
        ticketProcedureModifiedList.reduce((acc, item) => {
          const discount =
            item.status !== TicketProcedureStatus.NoEffect ? item.discountMoney * item.quantity : 0
          return acc + discount
        }, 0)
        - ticketProcedureOriginList.reduce((acc, item) => {
          const discount =
            item.status !== TicketProcedureStatus.NoEffect ? item.discountMoney * item.quantity : 0
          return acc + discount
        }, 0)
      // === 5. UPDATE TICKET: MONEY  ===
      let ticketModified: Ticket = ticketOrigin
      if (procedureMoneyChange != 0 || itemsDiscountChange != 0 || commissionMoneyChange != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            procedureMoneyAdd: procedureMoneyChange,
            itemsDiscountAdd: itemsDiscountChange,
            commissionMoneyAdd: commissionMoneyChange,
          },
        })
      }

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        ticketUser: {
          destroyedList: ticketUserDestroyedList || [],
          upsertedList: ticketUserCreatedList || [],
        },
        ticketRegimen: { upsertedList: [ticketRegimenModified] },
        ticketRegimenItem: { upsertedList: ticketRegimenItemModifiedList },
        ticketProcedure: { upsertedList: ticketProcedureModifiedList },
      })
      return {
        ticketModified,
        ticketRegimenModified,
        ticketRegimenItemModifiedList,
        ticketProcedureModifiedList,
        ticketUserCreatedList,
        ticketUserDestroyedList,
      }
    })

    return transaction
  }
}
