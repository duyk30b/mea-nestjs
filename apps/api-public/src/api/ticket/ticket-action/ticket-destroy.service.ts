import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../../_libs/common/cache-data/cache-data.service'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { DeliveryStatus } from '../../../../../_libs/database/common/variable'
import { TicketProcedureStatus } from '../../../../../_libs/database/entities/ticket-procedure.entity'
import { TicketRadiologyStatus } from '../../../../../_libs/database/entities/ticket-radiology.entity'
import { TicketStatus } from '../../../../../_libs/database/entities/ticket.entity'
import {
  AppointmentRepository,
  TicketAttributeRepository,
  TicketBatchRepository,
  TicketExpenseRepository,
  TicketLaboratoryGroupRepository,
  TicketLaboratoryRepository,
  TicketLaboratoryResultRepository,
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
    private readonly ticketUserRepository: TicketUserRepository
  ) { }

  async destroy(params: { oid: number; ticketId: string }) {
    const { oid, ticketId } = params

    const t = await this.ticketRepository.transaction('READ UNCOMMITTED', async (manager) => {
      const ticketDestroyed = await this.ticketRepository.managerDeleteOne(manager, {
        id: ticketId,
        oid,
      })
      if (ticketDestroyed.paid) {
        throw new BusinessError('Không thể hủy phiếu đã thanh toán, cần hoàn trả thanh toán trước')
      }
      if ([TicketStatus.Completed, TicketStatus.Debt].includes(ticketDestroyed.status)) {
        throw new BusinessError('Phiếu đã đóng, bắt buộc phải mở lại phiếu trước khi xóa')
      }
      if ([DeliveryStatus.Delivered].includes(ticketDestroyed.deliveryStatus)) {
        throw new BusinessError('Đã xuất hàng, bắt buộc phải HOÀN TRẢ sản phẩm phiếu trước khi xóa')
      }

      await this.appointmentRepository.managerDelete(manager, { oid, fromTicketId: ticketId })

      await this.ticketReceptionRepository.managerDelete(manager, { oid, ticketId })

      await this.ticketAttributeRepository.managerDelete(manager, { oid, ticketId })
      await this.ticketExpenseRepository.managerDelete(manager, { oid, ticketId })
      await this.ticketSurchargeRepository.managerDelete(manager, { oid, ticketId })

      const ticketProductDestroyedList = await this.ticketProductRepository.managerDelete(manager, {
        oid,
        ticketId,
      })
      if (ticketProductDestroyedList.find((i) => i.deliveryStatus === DeliveryStatus.Delivered)) {
        throw new BusinessError('Không thể hủy phiếu đã gửi hàng, cần hoàn trả hàng trước khi hủy')
      }
      await this.ticketBatchRepository.managerDelete(manager, { oid, ticketId })

      const ticketProcedureDestroyedList = await this.ticketProcedureRepository.managerDelete(
        manager,
        { oid, ticketId }
      )
      if (ticketProcedureDestroyedList.find((i) => i.status === TicketProcedureStatus.Completed)) {
        throw new BusinessError('Cần XÓA tất dịch vụ đã hoàn thành trước khi HỦY phiếu khám')
      }
      await this.ticketRegimenRepository.managerDelete(manager, { oid, ticketId })
      await this.ticketRegimenItemRepository.managerDelete(manager, { oid, ticketId })

      await this.ticketLaboratoryRepository.managerDelete(manager, { oid, ticketId })
      await this.ticketLaboratoryGroupRepository.managerDelete(manager, { oid, ticketId })
      await this.ticketLaboratoryResultRepository.managerDelete(manager, { oid, ticketId })

      const ticketRadiologyDestroyedList = await this.ticketRadiologyRepository.managerDelete(
        manager,
        { oid, ticketId }
      )
      if (ticketRadiologyDestroyedList.find((i) => i.status === TicketRadiologyStatus.Completed)) {
        throw new BusinessError('Cần XÓA tất phiếu CĐHA đã hoàn thành trước khi HỦY phiếu khám')
      }
      await this.ticketUserRepository.managerDelete(manager, { oid, ticketId })

      await this.imageManagerService.removeImageList({
        oid,
        idRemoveList: JSON.parse(ticketDestroyed.imageDiagnosisIds || '[]'),
      })
    })

    this.socketEmitService.socketTicketChange(oid, { ticketId, ticketDestroyedId: ticketId })
    return ticketId
  }
}
