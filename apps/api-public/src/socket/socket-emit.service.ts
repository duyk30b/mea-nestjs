import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import { VoucherType } from '../../../_libs/database/common/variable'
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

  ticketCreate(oid: number, data: { ticket: Ticket }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_CREATE, data)
  }

  ticketDestroy(oid: number, data: { ticketId: number; voucherType: VoucherType }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_DESTROY, data)
  }

  ticketUpdate(oid: number, data: { ticketBasic: Ticket }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_UPDATE, data)
  }

  ticketUpdateTicketDiagnosisBasic(
    oid: number,
    data: {
      ticketId: number
      voucherType: VoucherType
      ticketDiagnosisBasic: Omit<TicketDiagnosis, keyof Pick<TicketDiagnosis, 'special'>>
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_UPDATE_TICKET_DIAGNOSIS_BASIC, data)
  }

  ticketUpdateTicketDiagnosisSpecial(
    oid: number,
    data: { ticketId: number; voucherType: VoucherType; special: string }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_UPDATE_TICKET_DIAGNOSIS_SPECIAL, data)
  }

  ticketUpdateTicketProcedureList(
    oid: number,
    data: { ticketId: number; voucherType: VoucherType; ticketProcedureList: TicketProcedure[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_UPDATE_TICKET_PROCEDURE_LIST, data)
  }

  ticketUpdateTicketProductConsumableList(
    oid: number,
    data: {
      ticketId: number
      voucherType: VoucherType
      ticketProductConsumableList: TicketProduct[]
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_UPDATE_TICKET_PRODUCT_CONSUMABLE_LIST, data)
  }

  ticketUpdateTicketProductPrescriptionList(
    oid: number,
    data: {
      ticketId: number
      voucherType: VoucherType
      ticketProductPrescriptionList: TicketProduct[]
    }
  ) {
    if (!this.io) return
    this.io
      .in(oid.toString())
      .emit(SOCKET_EVENT.TICKET_UPDATE_TICKET_PRODUCT_PRESCRIPTION_LIST, data)
  }

  ticketUpdateTicketRadiologyList(
    oid: number,
    data: { ticketId: number; voucherType: VoucherType; ticketRadiologyList: TicketRadiology[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_UPDATE_TICKET_RADIOLOGY_LIST, data)
  }

  ticketUpdateTicketRadiologyResult(
    oid: number,
    data: { ticketId: number; voucherType: VoucherType; ticketRadiology: TicketRadiology }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_UPDATE_TICKET_RADIOLOGY_RESULT, data)
  }

  ticketUpdateTicketUserList(
    oid: number,
    data: { ticketId: number; voucherType: VoucherType; ticketUserList: TicketUser[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.TICKET_UPDATE_TICKET_USER_LIST, data)
  }
}
