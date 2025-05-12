import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import {
  Customer,
  Distributor,
  Organization,
  Product,
  Ticket,
  TicketAttribute,
  TicketBatch,
  TicketLaboratory,
  TicketLaboratoryGroup,
  TicketLaboratoryResult,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
  TicketUser,
} from '../../../_libs/database/entities'
import { InteractType } from '../../../_libs/database/entities/commission.entity'
import { SOCKET_EVENT } from './socket.variable'

@Injectable()
export class SocketEmitService {
  public connections: Record<string, { refreshExp: number; socketId: string }[]> = null
  public io: Server = null

  demo(oid: number) {
    if (!this.io) return
    const dataDemo = new Date().toISOString()
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SERVER_EMIT_DEMO, { dataDemo })
  }

  organizationUpdate(oid: number, data: { organization: Organization }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.ORGANIZATION_UPDATE)
  }

  settingReload(oid: number) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SETTING_RELOAD)
  }

  customerUpsert(oid: number, data: { customer: Customer }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.CUSTOMER_UPSERT, data)
  }

  distributorUpsert(oid: number, data: { distributor: Distributor }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.DISTRIBUTOR_UPSERT, data)
  }

  productUpsert(oid: number, data: { product: Product }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.PRODUCT_UPSERT, data)
  }

  productListUpdate(oid: number, data: { productList: Product[] }) {
    if (!this.io || !data.productList?.length) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.PRODUCT_LIST_UPDATE, data)
  }

  ticketClinicChange(oid: number, data: { type: 'CREATE' | 'UPDATE' | 'DESTROY'; ticket: Ticket }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_CHANGE, data)
  }

  ticketClinicUpdateTicketAttributeList(
    oid: number,
    data: { ticketId: number; ticketAttributeList: TicketAttribute[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_UPDATE_TICKET_ATTRIBUTE_LIST, data)
  }

  ticketClinicChangeTicketUserList(
    oid: number,
    data: {
      ticketId: number
      ticketUserDestroyList?: TicketUser[]
      ticketUserUpsertList?: TicketUser[]
      replace?: {
        interactType: InteractType
        ticketItemId: number // ticketItemId = 0 là thay thế toàn bộ interactType đó
        ticketUserList: TicketUser[]
      }
      replaceAll?: {
        ticketUserList: TicketUser[]
      }
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_CHANGE_TICKET_USER_LIST, data)
  }

  ticketClinicChangeTicketProcedureList(
    oid: number,
    data: {
      ticketId: number
      ticketProcedureInsert?: TicketProcedure
      ticketProcedureUpdate?: TicketProcedure
      ticketProcedureDestroy?: TicketProcedure
      ticketProcedureList?: TicketProcedure[]
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_CHANGE_TICKET_PROCEDURE_LIST, data)
  }

  ticketClinicChangeTicketRadiologyList(
    oid: number,
    data: {
      ticketId: number
      ticketRadiologyInsert?: TicketRadiology
      ticketRadiologyUpdate?: TicketRadiology
      ticketRadiologyDestroy?: TicketRadiology
      ticketRadiologyList?: TicketRadiology[]
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_CHANGE_TICKET_RADIOLOGY_LIST, data)
  }

  ticketClinicChangeLaboratory(
    oid: number,
    data: {
      ticketId: number
      ticketLaboratoryInsertList?: TicketLaboratory[]
      ticketLaboratoryUpdateList?: TicketLaboratory[]
      ticketLaboratoryDestroyList?: TicketLaboratory[]
      ticketLaboratoryGroupInsertList?: TicketLaboratoryGroup[]
      ticketLaboratoryGroupUpdate?: TicketLaboratoryGroup
      ticketLaboratoryGroupDestroy?: TicketLaboratoryGroup
      ticketLaboratoryResultInsertList?: TicketLaboratoryResult[]
      ticketLaboratoryResultUpdateList?: TicketLaboratoryResult[]
      ticketLaboratoryResultDestroyList?: TicketLaboratoryResult[]
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_CHANGE_LABORATORY, data)
  }

  ticketClinicChangeConsumable(
    oid: number,
    data: {
      ticketId: number
      ticketProductUpsertList?: TicketProduct[]
      ticketProductDestroyList?: TicketProduct[]
      ticketProductReplaceList?: TicketProduct[]
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_CHANGE_CONSUMABLE, data)
  }

  ticketClinicChangePrescription(
    oid: number,
    data: {
      ticketId: number
      ticketProductUpsertList?: TicketProduct[]
      ticketProductDestroyList?: TicketProduct[]
      ticketProductReplaceList?: TicketProduct[]
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_CHANGE_PRESCRIPTION, data)
  }

  ticketClinicChangeBatch(
    oid: number,
    data: {
      ticketId: number
      ticketBatchUpsertList?: TicketBatch[]
      ticketBatchDestroyList?: TicketBatch[]
      ticketBatchReplaceList?: TicketBatch[]
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_CHANGE_BATCH, data)
  }
}
