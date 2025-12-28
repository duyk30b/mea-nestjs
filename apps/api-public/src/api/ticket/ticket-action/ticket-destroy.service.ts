import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../../_libs/common/cache-data/cache-data.service'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { DeliveryStatus, MovementType } from '../../../../../_libs/database/common/variable'
import {
  PaymentPersonType,
  PaymentVoucherType,
} from '../../../../../_libs/database/entities/payment.entity'
import { TicketRadiologyStatus } from '../../../../../_libs/database/entities/ticket-radiology.entity'
import { TicketStatus } from '../../../../../_libs/database/entities/ticket.entity'
import {
  AppointmentRepository,
  PaymentRepository,
  PaymentTicketItemRepository,
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
} from '../../../../../_libs/database/repositories'
import { ImageManagerService } from '../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../socket/socket-emit.service'

@Injectable()
export class TicketDestroyService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketPaymentDetailRepository: TicketPaymentDetailRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly ticketReceptionRepository: TicketReceptionRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository,
    private readonly ticketExpenseRepository: TicketExpenseRepository,
    private readonly ticketSurchargeRepository: TicketSurchargeRepository,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketBatchRepository: TicketBatchRepository,
    private readonly ticketProcedureRepository: TicketProcedureRepository,
    private readonly ticketRegimenRepository: TicketRegimenRepository,
    private readonly ticketRegimenItemRepository: TicketRegimenItemRepository,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private readonly ticketLaboratoryResultRepository: TicketLaboratoryResultRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly productMovementRepository: ProductMovementRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentTicketItemRepository: PaymentTicketItemRepository
  ) { }

  async destroy(params: { oid: number; ticketId: string }) {
    const { oid, ticketId } = params
    const PREFIX = `ticketID=${ticketId} destroy failed: `

    const transaction = await this.ticketRepository.transaction(
      'READ UNCOMMITTED',
      async (manager) => {
        const ticketDestroyed = await this.ticketRepository.managerDeleteOne(manager, {
          id: ticketId,
          oid,
        })
        if (ticketDestroyed.paidTotal) {
          throw new BusinessError(
            PREFIX,
            'Không thể xóa phiếu đã thanh toán, cần hoàn trả thanh toán trước'
          )
        }
        if (ticketDestroyed.debtTotal) {
          throw new BusinessError(PREFIX, 'Không thể xóa phiếu đang nợ, cần hoàn nợ trước')
        }
        if ([TicketStatus.Completed, TicketStatus.Debt].includes(ticketDestroyed.status)) {
          throw new BusinessError(PREFIX, 'Phiếu đã đóng, bắt buộc phải mở lại phiếu trước khi xóa')
        }
        if ([DeliveryStatus.Delivered].includes(ticketDestroyed.deliveryStatus)) {
          throw new BusinessError(
            PREFIX,
            'Đã xuất hàng, bắt buộc phải HOÀN TRẢ sản phẩm phiếu trước khi xóa'
          )
        }

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
          {
            oid,
            ticketId,
          }
        )
        if (ticketProductDestroyedList.find((i) => i.deliveryStatus === DeliveryStatus.Delivered)) {
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
        await this.paymentRepository.managerDelete(manager, {
          oid,
          voucherType: PaymentVoucherType.Ticket,
          voucherId: ticketId,
          personType: PaymentPersonType.Customer,
          personId: ticketDestroyed.customerId,
        })
        await this.paymentTicketItemRepository.managerDelete(manager, {
          oid,
          ticketId,
        })
        await this.productMovementRepository.managerDelete(manager, {
          oid,
          movementType: MovementType.Ticket,
          voucherId: ticketId,
          contactId: ticketDestroyed.customerId,
        })

        await this.imageManagerService.removeImageList({
          oid,
          idRemoveList: JSON.parse(ticketDestroyed.imageDiagnosisIds || '[]'),
        })

        return { ticketDestroyed }
      }
    )

    this.socketEmitService.socketRoomTicketPaginationChange(oid, {
      roomId: transaction.ticketDestroyed.roomId,
    })
    return transaction
  }
}
