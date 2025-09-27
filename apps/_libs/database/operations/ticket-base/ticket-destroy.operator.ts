import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  AppointmentManager,
  TicketAttributeManager,
  TicketBatchManager,
  TicketExpenseManager,
  TicketLaboratoryGroupManager,
  TicketLaboratoryManager,
  TicketLaboratoryResultManager,
  TicketManager,
  TicketProcedureRepository,
  TicketProductManager,
  TicketRadiologyManager,
  TicketReceptionRepository,
  TicketRegimenItemRepository,
  TicketRegimenRepository,
  TicketSurchargeManager,
  TicketUserManager,
} from '../../repositories'

@Injectable()
export class TicketDestroyOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private appointmentManager: AppointmentManager,
    private ticketReceptionRepository: TicketReceptionRepository,
    private ticketAttributeManager: TicketAttributeManager,
    private ticketExpenseManager: TicketExpenseManager,
    private ticketSurchargeManager: TicketSurchargeManager,
    private ticketProductManager: TicketProductManager,
    private ticketBatchManager: TicketBatchManager,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketRegimenItemRepository: TicketRegimenItemRepository,
    private ticketRadiologyManager: TicketRadiologyManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketLaboratoryGroupManager: TicketLaboratoryGroupManager,
    private ticketLaboratoryResultManager: TicketLaboratoryResultManager,
    private ticketUserManager: TicketUserManager
  ) { }

  async destroyAll(options: { oid: number; ticketId: string }) {
    const { oid, ticketId } = options
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const ticketDestroyed = await this.ticketManager.deleteOneAndReturnEntity(manager, {
        id: ticketId,
        oid,
        status: { IN: [TicketStatus.Schedule, TicketStatus.Draft, TicketStatus.Cancelled] },
      })

      await this.appointmentManager.delete(manager, { oid, fromTicketId: ticketId })

      await this.ticketReceptionRepository.managerDelete(manager, { oid, ticketId })

      await this.ticketAttributeManager.delete(manager, { oid, ticketId })
      await this.ticketExpenseManager.delete(manager, { oid, ticketId })
      await this.ticketSurchargeManager.delete(manager, { oid, ticketId })

      await this.ticketProductManager.delete(manager, { oid, ticketId })
      await this.ticketBatchManager.delete(manager, { oid, ticketId })

      await this.ticketProcedureRepository.managerDelete(manager, { oid, ticketId })
      await this.ticketRegimenRepository.managerDelete(manager, { oid, ticketId })
      await this.ticketRegimenItemRepository.managerDelete(manager, { oid, ticketId })

      await this.ticketRadiologyManager.delete(manager, { oid, ticketId })

      await this.ticketLaboratoryManager.delete(manager, { oid, ticketId })
      await this.ticketLaboratoryGroupManager.delete(manager, { oid, ticketId })
      await this.ticketLaboratoryResultManager.delete(manager, { oid, ticketId })

      await this.ticketUserManager.delete(manager, { oid, ticketId })

      return { ticketDestroyed }
    })
  }
}
