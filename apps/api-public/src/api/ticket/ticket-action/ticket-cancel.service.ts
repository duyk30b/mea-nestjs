import { CacheDataService } from '@libs/common/cache-data/cache-data.service'
import { BusinessError } from '@libs/database/common/error'
import { DeliveryStatus, TicketActionType } from '@libs/database/common/variable'
import { Customer, TicketProduct } from '@libs/database/entities'
import { PaymentActionType } from '@libs/database/entities/payment.entity'
import { TicketRadiologyStatus } from '@libs/database/entities/ticket-radiology.entity'
import { TicketStatus } from '@libs/database/entities/ticket.entity'
import {
  TicketChangeDebtOperation,
  TicketOpenCloseOperation,
  TicketPaymentMoneyOperation,
  TicketReturnProductOperation,
} from '@libs/database/operations'
import {
  AppointmentRepository,
  PaymentTicketRepository,
  ProductMovementRepository,
  TicketAttributeRepository,
  TicketBatchRepository,
  TicketExpenseRepository,
  TicketLaboratoryGroupRepository,
  TicketLaboratoryRepository,
  TicketLaboratoryResultRepository,
  TicketPaymentDetailRepository,
  TicketProcedureRepository,
  TicketProductRepository,
  TicketRadiologyRepository,
  TicketReceptionRepository,
  TicketRegimenItemRepository,
  TicketRegimenRepository,
  TicketRepository,
  TicketSurchargeRepository,
  TicketUserRepository,
} from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { ImageManagerService } from '../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketTerminalBody } from './request'

@Injectable()
export class TicketCancelService {
  constructor(
    private socketEmitService: SocketEmitService,
    private cacheDataService: CacheDataService,
    private imageManagerService: ImageManagerService,
    private ticketRepository: TicketRepository,
    private ticketPaymentDetailRepository: TicketPaymentDetailRepository,
    private appointmentRepository: AppointmentRepository,
    private ticketReceptionRepository: TicketReceptionRepository,
    private ticketAttributeRepository: TicketAttributeRepository,
    private ticketExpenseRepository: TicketExpenseRepository,
    private ticketSurchargeRepository: TicketSurchargeRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketBatchRepository: TicketBatchRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketRegimenItemRepository: TicketRegimenItemRepository,
    private ticketRadiologyRepository: TicketRadiologyRepository,
    private ticketLaboratoryRepository: TicketLaboratoryRepository,
    private ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private ticketLaboratoryResultRepository: TicketLaboratoryResultRepository,
    private ticketUserRepository: TicketUserRepository,
    private productMovementRepository: ProductMovementRepository,
    private paymentTicketRepository: PaymentTicketRepository,
    private ticketReturnProductOperation: TicketReturnProductOperation,
    private ticketOpenCloseOperation: TicketOpenCloseOperation,
    private ticketPaymentMoneyOperation: TicketPaymentMoneyOperation,
    private ticketChangeDebtOperation: TicketChangeDebtOperation
  ) {}

  async terminate(options: {
    oid: number
    userId: number
    ticketId: string
    body: TicketTerminalBody
  }) {
    const { oid, userId, ticketId, body } = options
    const time = Date.now()

    const ticketOrigin = await this.ticketRepository.findOneBy({ oid, id: ticketId })

    let ticketProductModifiedAll: TicketProduct[]
    let ticketModified = ticketOrigin
    let customerModified: Customer

    if ([TicketStatus.Debt, TicketStatus.Completed].includes(ticketOrigin.status)) {
      const reopenResult = await this.ticketOpenCloseOperation.reopen({
        oid,
        ticketId,
      })
      ticketModified = reopenResult.ticketModified
    }
    if (
      [DeliveryStatus.Delivered, DeliveryStatus.Partial].includes(ticketModified.deliveryStatus)
    ) {
      const returnProductResult = await this.ticketReturnProductOperation.returnProduct({
        oid,
        ticketId,
        time,
        returnType: 'ALL',
        options: { changePendingIfNoStock: true },
      })
      ticketProductModifiedAll = returnProductResult.ticketProductModifiedAll

      this.socketEmitService.productListChange(oid, {
        productUpsertedList: returnProductResult.productModifiedList || [],
        batchUpsertedList: returnProductResult.batchModifiedList || [],
      })
      ticketModified = returnProductResult.ticketModified
    }

    if (ticketModified.paidTotal > 0) {
      const paymentResult = await this.ticketPaymentMoneyOperation.startPaymentMoney({
        oid,
        cashierId: userId,
        walletId: body.walletId,
        time: Date.now(),
        note: '',
        paymentActionType: PaymentActionType.RefundMoney,
        ticketActionType: TicketActionType.Terminal,
        paidTotal: -ticketOrigin.paidTotal,
        ticketId,
        isPaymentEachItem: 0,
      })
      ticketModified = paymentResult.ticketModified
      customerModified = paymentResult.customerModified
    }

    if (ticketModified.debtTotal > 0) {
      const changeDebtResult = await this.ticketChangeDebtOperation.startChangeDebt({
        oid,
        customerId: ticketOrigin.customerId,
        cashierId: userId,
        walletId: null,
        time: Date.now(),
        note: '',
        paymentActionType: PaymentActionType.RefundDebt,
        changeDebtList: [
          {
            ticketId,
            paid: 0,
            debt: -ticketOrigin.debtTotal,
            ticketActionType: TicketActionType.Terminal,
          },
        ],
      })
      ticketModified = changeDebtResult.ticketModifiedList[0]
      customerModified = changeDebtResult.customerModified
    }

    const terminalResult = await this.ticketOpenCloseOperation.startTerminal({
      oid,
      ticketId,
    })
    ticketModified = terminalResult.ticketModified

    if (customerModified) {
      this.socketEmitService.customerUpsert(oid, { customer: customerModified })
    }

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified,
      ticketProduct: { upsertedList: ticketProductModifiedAll },
    })
    return {
      ticketModified,
      customerModified,
      ticketProductModifiedAll,
    }
  }

  async destroy(params: { oid: number; ticketId: string }) {
    const { oid, ticketId } = params
    const PREFIX = `ticketID=${ticketId} destroy failed: `

    const transaction = await this.ticketRepository.transaction(
      'READ UNCOMMITTED',
      async (manager) => {
        const ticketDestroyed = await this.ticketRepository.managerDeleteOne(manager, {
          id: ticketId,
          oid,
          status: {
            IN: [
              TicketStatus.Schedule,
              TicketStatus.Draft,
              TicketStatus.Executing, // cho phép xóa phiếu đang thực hiện, miễn là các item đều chưa xử lý
              TicketStatus.Cancelled,
            ],
          },
          paidTotal: 0,
          debtTotal: 0,
          deliveryStatus: {
            IN: [DeliveryStatus.Empty, DeliveryStatus.Pending, DeliveryStatus.Cancelled],
          },
        })

        if (ticketDestroyed.isPaymentEachItem) {
          await this.ticketPaymentDetailRepository.managerDeleteOne(manager, {
            oid,
            ticketId,
            id: ticketId,
          })
        }

        await this.appointmentRepository.managerDelete(manager, { oid, fromTicketId: ticketId })
        await this.ticketReceptionRepository.managerDelete(manager, { oid, ticketId })

        await this.ticketAttributeRepository.managerDelete(manager, { oid, ticketId })
        await this.ticketExpenseRepository.managerDelete(manager, { oid, ticketId })
        await this.ticketSurchargeRepository.managerDelete(manager, { oid, ticketId })

        const ticketProductDestroyedList = await this.ticketProductRepository.managerDelete(
          manager,
          { oid, ticketId }
        )
        if (ticketProductDestroyedList.find((i) => i.quantityCompleted > 0)) {
          throw new BusinessError(
            PREFIX,
            'Không thể hủy phiếu đã gửi hàng, cần hoàn trả hàng trước khi hủy'
          )
        }
        await this.ticketBatchRepository.managerDelete(manager, { oid, ticketId })

        const ticketProcedureDestroyedList = await this.ticketProcedureRepository.managerDelete(
          manager,
          { oid, ticketId }
        )
        // if (ticketProcedureDestroyedList.find((i) => i.status === TicketProcedureStatus.Completed)) {
        //   throw new BusinessError('Cần XÓA tất dịch vụ đã hoàn thành trước khi HỦY phiếu khám')
        // }
        await this.ticketRegimenRepository.managerDelete(manager, { oid, ticketId })
        await this.ticketRegimenItemRepository.managerDelete(manager, { oid, ticketId })

        await this.ticketLaboratoryRepository.managerDelete(manager, { oid, ticketId })
        await this.ticketLaboratoryGroupRepository.managerDelete(manager, { oid, ticketId })
        await this.ticketLaboratoryResultRepository.managerDelete(manager, { oid, ticketId })

        const ticketRadiologyDestroyedList = await this.ticketRadiologyRepository.managerDelete(
          manager,
          { oid, ticketId }
        )
        if (
          ticketRadiologyDestroyedList.find((i) => i.status === TicketRadiologyStatus.Completed)
        ) {
          throw new BusinessError(
            PREFIX,
            'Cần XÓA tất phiếu CĐHA đã hoàn thành trước khi HỦY phiếu khám'
          )
        }
        await this.ticketUserRepository.managerDelete(manager, { oid, ticketId })

        const paymentTicketDestroyedList = await this.paymentTicketRepository.managerDelete(
          manager,
          { oid, ticketId }
        )

        // Tạm thời chưa xóa payment, vì có thể payment này liên quan đến nhiều phiếu khác nhau, nên không xóa payment, chỉ xóa paymentTicket thôi
        // const paymentIdList = paymentTicketDestroyedList.map((i) => i.paymentId)
        // await this.paymentRepository.managerDelete(manager, {
        //   oid,
        //   id: { IN: paymentIdList },
        //   personType: PaymentPersonType.Customer,
        //   personId: ticketDestroyed.customerId,
        // })

        // await this.productMovementRepository.managerDelete(manager, {
        //   oid,
        //   movementType: MovementType.Ticket,
        //   voucherId: ticketId,
        //   contactId: ticketDestroyed.customerId,
        // })

        await this.imageManagerService.removeImageList({
          oid,
          idRemoveList: JSON.parse(ticketDestroyed.imageDiagnosisIds || '[]'),
        })

        return { ticketDestroyed }
      }
    )

    this.socketEmitService.socketTicketPaginationChange(oid, {
      roomId: transaction.ticketDestroyed.roomId,
    })
    return transaction
  }
}
