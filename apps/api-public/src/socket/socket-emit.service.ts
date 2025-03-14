import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import {
  Batch,
  Customer,
  Distributor,
  Organization,
  Product,
  Ticket,
  TicketAttribute,
  TicketLaboratory,
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
    if (!this.io || !data.productList.length) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.PRODUCT_LIST_UPDATE, data)
  }

  batchUpsert(oid: number, data: { batch: Batch }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.BATCH_UPSERT, data)
  }

  batchListUpdate(oid: number, data: { batchList: Batch[] }) {
    if (!this.io || !data.batchList.length) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.BATCH_LIST_UPDATE, data)
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
      ticketUserUpdateList?: TicketUser[]
      ticketUserUpdate?: TicketUser
      ticketUserInsertList?: TicketUser[]
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

  ticketClinicChangeTicketLaboratoryList(
    oid: number,
    data: {
      ticketId: number
      ticketLaboratoryInsert?: TicketLaboratory
      ticketLaboratoryInsertList?: TicketLaboratory[]
      ticketLaboratoryUpdate?: TicketLaboratory
      ticketLaboratoryUpdateList?: TicketLaboratory[]
      ticketLaboratoryDestroy?: TicketLaboratory
      ticketLaboratoryList?: TicketLaboratory[]
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_CHANGE_TICKET_LABORATORY_LIST, data)
  }

  ticketClinicChangeTicketProductConsumableList(
    oid: number,
    data: {
      ticketId: number
      ticketProductInsert?: TicketProduct
      ticketProductInsertList?: TicketProduct[]
      ticketProductUpdate?: TicketProduct
      ticketProductUpdateList?: TicketProduct[]
      ticketProductDestroy?: TicketProduct
      replace?: {
        ticketProductList?: TicketProduct[]
      }
    }
  ) {
    if (!this.io) return
    this.io
      .in(oid.toString())
      .emit(SOCKET_EVENT.TICKET_CLINIC_CHANGE_TICKET_PRODUCT_CONSUMABLE_LIST, data)
  }

  ticketClinicChangeTicketProductPrescriptionList(
    oid: number,
    data: {
      ticketId: number
      ticketProductInsert?: TicketProduct
      ticketProductInsertList?: TicketProduct[]
      ticketProductUpdate?: TicketProduct
      ticketProductUpdateList?: TicketProduct[]
      ticketProductDestroy?: TicketProduct
      replace?: {
        ticketProductList?: TicketProduct[]
      }
    }
  ) {
    if (!this.io) return
    this.io
      .in(oid.toString())
      .emit(SOCKET_EVENT.TICKET_CLINIC_CHANGE_TICKET_PRODUCT_PRESCRIPTION_LIST, data)
  }
}
