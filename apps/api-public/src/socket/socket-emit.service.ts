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

  ticketClinicCreate(oid: number, data: { ticket: Ticket }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_CREATE, data)
  }

  ticketClinicDestroy(oid: number, data: { ticketId: number }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_DESTROY, data)
  }

  ticketClinicUpdate(oid: number, data: { ticketBasic: Ticket }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_UPDATE, data)
  }

  ticketClinicUpdateTicketAttributeList(
    oid: number,
    data: { ticketId: number; ticketAttributeList: TicketAttribute[] }
  ) {
    if (!this.io) return
    this.io
      .in(oid.toString())
      .emit(SOCKET_EVENT.TICKET_CLINIC_UPDATE_TICKET_ATTRIBUTE_LIST, data)
  }

  ticketClinicUpdateTicketProcedureList(
    oid: number,
    data: { ticketId: number; ticketProcedureList: TicketProcedure[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_UPDATE_TICKET_PROCEDURE_LIST, data)
  }

  ticketClinicUpdateTicketProductConsumableList(
    oid: number,
    data: {
      ticketId: number
      ticketProductConsumableList: TicketProduct[]
    }
  ) {
    if (!this.io) return
    this.io
      .in(oid.toString())
      .emit(SOCKET_EVENT.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_CONSUMABLE_LIST, data)
  }

  ticketClinicUpdateTicketProductPrescriptionList(
    oid: number,
    data: {
      ticketId: number
      ticketProductPrescriptionList: TicketProduct[]
    }
  ) {
    if (!this.io) return
    this.io
      .in(oid.toString())
      .emit(SOCKET_EVENT.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_PRESCRIPTION_LIST, data)
  }

  ticketClinicUpdateTicketLaboratoryList(
    oid: number,
    data: { ticketId: number; ticketLaboratoryList: TicketLaboratory[] }
  ) {
    if (!this.io) return
    this.io
      .in(oid.toString())
      .emit(SOCKET_EVENT.TICKET_CLINIC_UPDATE_TICKET_LABORATORY_LIST, data)
  }

  ticketClinicUpdateTicketLaboratoryResult(
    oid: number,
    data: { ticketId: number; ticketLaboratory: TicketLaboratory }
  ) {
    if (!this.io) return
    this.io
      .in(oid.toString())
      .emit(SOCKET_EVENT.TICKET_CLINIC_UPDATE_TICKET_LABORATORY_RESULT, data)
  }

  ticketClinicUpdateTicketRadiologyList(
    oid: number,
    data: { ticketId: number; ticketRadiologyList: TicketRadiology[] }
  ) {
    if (!this.io) return
    this.io
      .in(oid.toString())
      .emit(SOCKET_EVENT.TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY_LIST, data)
  }

  ticketClinicUpdateTicketRadiologyResult(
    oid: number,
    data: { ticketId: number; ticketRadiology: TicketRadiology }
  ) {
    if (!this.io) return
    this.io
      .in(oid.toString())
      .emit(SOCKET_EVENT.TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY_RESULT, data)
  }

  ticketClinicUpdateTicketUserList(
    oid: number,
    data: { ticketId: number; ticketUserList: TicketUser[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_UPDATE_TICKET_USER_LIST, data)
  }
}
