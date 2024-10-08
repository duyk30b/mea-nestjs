import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import {
  Batch,
  Customer,
  Distributor,
  Organization,
  Procedure,
  Product,
  Ticket,
  TicketDiagnosis,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
} from '../../../_libs/database/entities'
import { SOCKET_EVENT } from './socket.variable'

@Injectable()
export class SocketEmitService {
  public connections: Record<string, { refreshExp: number, socketId: string }[]> = null
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

  distributorUpsert(oid: number, data: { distributor: Distributor }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.DISTRIBUTOR_UPSERT, data)
  }

  customerUpsert(oid: number, data: { customer: Customer }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.CUSTOMER_UPSERT, data)
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

  procedureUpsert(oid: number, data: { procedure: Procedure }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.PROCEDURE_UPSERT, data)
  }

  ticketClinicCreate(oid: number, data: { ticket: Ticket }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_CREATE, data)
  }

  ticketClinicUpdate(oid: number, data: { ticketBasic: Ticket }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_UPDATE, data)
  }

  ticketClinicUpdateTicketDiagnosis(
    oid: number,
    data: { ticketId: number; ticketDiagnosis: TicketDiagnosis }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_UPDATE_TICKET_DIAGNOSIS, data)
  }

  ticketClinicUpdateTicketRadiology(
    oid: number,
    data: { ticketId: number; ticketRadiology: TicketRadiology }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY, data)
  }

  ticketClinicChangeTicketProductList(
    oid: number,
    data: { ticketId: number; ticketProductList: TicketProduct[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_CHANGE_TICKET_PRODUCT_LIST, data)
  }

  ticketClinicChangeTicketProcedureList(
    oid: number,
    data: { ticketId: number; ticketProcedureList: TicketProcedure[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_CHANGE_TICKET_PROCEDURE_LIST, data)
  }

  ticketClinicChangeTicketRadiologyList(
    oid: number,
    data: { ticketId: number; ticketRadiologyList: TicketRadiology[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CLINIC_CHANGE_TICKET_RADIOLOGY_LIST, data)
  }
}
