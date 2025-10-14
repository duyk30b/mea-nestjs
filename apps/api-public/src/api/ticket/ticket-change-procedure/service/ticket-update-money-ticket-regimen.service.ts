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
import {
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

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketRegimenOrigin = await this.ticketRegimenRepository.managerFindOneBy(manager, {
        oid,
        ticketId,
        id: ticketRegimenId,
      })

      if (![TicketRegimenStatus.Pending].includes(ticketRegimenOrigin.status)) {
        throw new BusinessError('Trạng thái liệu trình không hợp lệ')
      }
      if (ticketRegimenOrigin.moneyAmountPaid > 0 || ticketRegimenOrigin.moneyAmountUsed) {
        throw new BusinessError('Không thể sửa phiếu đã thanh toán')
      }

      let ticketUserDestroyedList: TicketUser[] = []
      let ticketUserCreatedList: TicketUser[] = []
      let commissionMoneyChange = 0
      if (ticketRegimenOrigin.commissionAmount) {
        ticketUserDestroyedList = await this.ticketUserRepository.managerDelete(manager, {
          oid,
          ticketId,
          positionType: { IN: [PositionType.RegimenRequest] },
          ticketItemId: ticketRegimenId,
        })
        ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
          manager,
          createdAt: ticketRegimenOrigin.createdAt,
          oid,
          ticketId,
          ticketUserDtoList: ticketUserDestroyedList.map((i) => {
            return {
              positionId: i.positionId,
              userId: i.userId,
              quantity: 1,
              ticketItemId: ticketRegimenId,
              positionInteractId: ticketRegimenOrigin.regimenId,
              ticketItemExpectedPrice: ticketRegimenUpdate.expectedPrice,
              ticketItemActualPrice: ticketRegimenUpdate.actualPrice,
            }
          }),
        })

        commissionMoneyChange =
          ticketUserCreatedList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
          - ticketUserDestroyedList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
      }

      // Update ticketRegimen sau vì có thay đổi commission khi update ticketUser
      const ticketRegimenModified = await this.ticketRegimenRepository.managerUpdateOne(
        manager,
        { oid, id: ticketRegimenId },
        {
          expectedPrice: ticketRegimenUpdate.expectedPrice,
          actualPrice: ticketRegimenUpdate.actualPrice,
          moneyAmountActual: ticketRegimenOrigin.isEffectTotalMoney
            ? ticketRegimenUpdate.actualPrice
            : 0,
          discountType: ticketRegimenUpdate.discountType,
          discountMoney: ticketRegimenUpdate.discountMoney,
          discountPercent: ticketRegimenUpdate.discountPercent,
          commissionAmount: ticketRegimenOrigin.commissionAmount + commissionMoneyChange,
        }
      )

      const ticketRegimenItemModifiedList =
        await this.ticketRegimenItemRepository.managerBulkUpdate({
          manager,
          condition: { oid, ticketId, ticketRegimenId },
          tempList: ticketRegimenItemUpdateList.map((i) => {
            return {
              ...i,
              moneyAmountActual: ticketRegimenOrigin.isEffectTotalMoney
                ? i.moneyAmountSale
                : 0,
            }
          }),
          compare: { id: { cast: 'bigint' } },
          update: [
            'moneyAmountRegular',
            'moneyAmountSale',
            'moneyAmountActual',
            'discountMoneyAmount',
            'discountPercent',
            'discountType',
            'quantityRegular',
          ],
          options: {},
        })

      const ticketRegimenItemModifiedMap = ESArray.arrayToKeyValue(
        ticketRegimenItemModifiedList,
        'id'
      )
      const ticketProcedureOriginList = await this.ticketProcedureRepository.findManyBy({
        oid,
        ticketId,
        ticketRegimenId,
        ticketProcedureType: TicketProcedureType.InRegimen,
      })
      const tpFixMapTri = ESArray.arrayToKeyArray(ticketProcedureOriginList, 'ticketRegimenItemId')

      Object.keys(tpFixMapTri).forEach((triId) => {
        const triModified = ticketRegimenItemModifiedMap[triId]
        const lengthArray = tpFixMapTri[triId]?.length
        if (lengthArray !== triModified.quantityRegular) {
          throw new BusinessError('Số lượng phiếu dịch vụ không đúng')
        }
        const totalMoneyAmountRegularRemain = triModified.moneyAmountRegular
        const totalMoneyAmountSaleRemain = triModified.moneyAmountSale
        const totalDiscountMoneyRemain = triModified.discountMoneyAmount

        const expectedPrice = Math.floor(totalMoneyAmountRegularRemain / lengthArray / 1000) * 1000
        const discountMoney = Math.floor(totalDiscountMoneyRemain / lengthArray / 1000) * 1000
        const actualPrice = Math.floor(totalMoneyAmountSaleRemain / lengthArray / 1000) * 1000

        const firstExpectedPrice = totalMoneyAmountRegularRemain - expectedPrice * (lengthArray - 1)
        const firstDiscountMoney = totalDiscountMoneyRemain - discountMoney * (lengthArray - 1)
        const firstActualPrice = totalMoneyAmountSaleRemain - actualPrice * (lengthArray - 1)

        tpFixMapTri[triId].forEach((tp, tpIndex) => {
          tp.expectedPrice = tpIndex === 0 ? firstExpectedPrice : expectedPrice
          tp.discountMoney = tpIndex === 0 ? firstDiscountMoney : discountMoney
          tp.actualPrice = tpIndex === 0 ? firstActualPrice : actualPrice
          tp.discountPercent = triModified.discountPercent
          tp.discountType = triModified.discountType
        })
      })
      const ticketProcedureFixList = Object.values(tpFixMapTri).flat()

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

      ticketProcedureModifiedList.forEach((tp) => {
        if (
          [PaymentMoneyStatus.FullPaid, PaymentMoneyStatus.PartialPaid].includes(
            tp.paymentMoneyStatus
          )
        ) {
          throw new BusinessError('Đã có dịch vụ đã thanh toán, không thể sửa')
        }
      })

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
