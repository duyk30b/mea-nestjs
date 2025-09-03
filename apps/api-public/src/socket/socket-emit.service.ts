import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import {
  Batch,
  Customer,
  Discount,
  Distributor,
  Laboratory,
  Organization,
  Position,
  Procedure,
  Product,
  PurchaseOrder,
  Radiology,
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
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_ORGANIZATION_UPDATE)
  }

  settingReload(oid: number) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_SETTING_RELOAD)
  }

  customerUpsert(oid: number, data: { customer: Customer }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_CUSTOMER_UPSERT, data)
  }

  distributorUpsert(oid: number, data: { distributor: Distributor }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_DISTRIBUTOR_UPSERT, data)
  }

  batchListChange(
    oid: number,
    data: { batchDestroyedList?: Batch[]; batchUpsertedList?: Batch[] }
  ) {
    if (!this.io) return
    if (!data.batchUpsertedList?.length && !data.batchDestroyedList?.length) {
      return
    }
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_BATCH_LIST_CHANGE, data)
  }

  productListChange(
    oid: number,
    data: { productDestroyedList?: Product[]; productUpsertedList?: Product[] }
  ) {
    if (!this.io) return
    if (!data.productUpsertedList?.length && !data.productDestroyedList?.length) {
      return
    }
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_PRODUCT_LIST_CHANGE, data)
  }

  procedureListChange(
    oid: number,
    data: { procedureDestroyedList?: Procedure[]; procedureUpsertedList?: Procedure[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_PROCEDURE_LIST_CHANGE, data)
  }

  laboratoryListChange(
    oid: number,
    data: { laboratoryDestroyedList?: Laboratory[]; laboratoryUpsertedList?: Laboratory[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_LABORATORY_LIST_CHANGE, data)
  }

  radiologyListChange(
    oid: number,
    data: { radiologyDestroyedList?: Radiology[]; radiologyUpsertedList?: Radiology[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_RADIOLOGY_LIST_CHANGE, data)
  }

  positionListChange(
    oid: number,
    data: { positionDestroyedList?: Position[]; positionUpsertedList?: Position[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_POSITION_LIST_CHANGE, data)
  }

  discountListChange(
    oid: number,
    data: { discountDestroyedList?: Discount[]; discountUpsertedList?: Discount[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_DISCOUNT_LIST_CHANGE, data)
  }

  socketPurchaseOrderListChange(
    oid: number,
    data: {
      purchaseOrderDestroyedList?: PurchaseOrder[]
      purchaseOrderUpsertedList?: PurchaseOrder[]
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_PURCHASE_ORDER_LIST_CHANGE, data)
  }

  socketTicketChange(oid: number, data: { type: 'CREATE' | 'UPDATE' | 'DESTROY'; ticket: Ticket }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_TICKET_CHANGE, data)
  }

  socketTicketListChange(
    oid: number,
    data: { ticketDestroyedList?: Ticket[]; ticketUpsertedList?: Ticket[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_TICKET_LIST_CHANGE, data)
  }

  socketTicketAttributeListChange(
    oid: number,
    data: { ticketId: number; ticketAttributeList: TicketAttribute[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_TICKET_CHANGE_ATTRIBUTE, data)
  }

  socketTicketUserListChange(
    oid: number,
    data: {
      ticketId: number
      ticketUserDestroyList?: TicketUser[]
      ticketUserUpsertList?: TicketUser[]
    }
  ) {
    if (!this.io) return
    if (!data.ticketUserDestroyList?.length && !data.ticketUserUpsertList?.length) {
      return
    }
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_TICKET_CHANGE_USER, data)
  }

  socketTicketProcedureListChange(
    oid: number,
    data: {
      ticketId: number
      ticketProcedureUpsertList?: TicketProcedure[]
      ticketProcedureDestroyList?: TicketProcedure[]
    }
  ) {
    if (!this.io) return
    if (!data.ticketProcedureUpsertList?.length && !data.ticketProcedureDestroyList?.length) {
      return
    }
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_TICKET_CHANGE_PROCEDURE, data)
  }

  socketTicketRadiologyListChange(
    oid: number,
    data: {
      ticketId: number
      ticketRadiologyUpsertList?: TicketRadiology[]
      ticketRadiologyDestroyList?: TicketRadiology[]
      ticketUserDestroyList?: TicketUser[]
      ticketUserUpsertList?: TicketUser[]
    }
  ) {
    if (!this.io) return
    if (!data.ticketRadiologyUpsertList?.length && !data.ticketRadiologyDestroyList?.length) {
      return
    }
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_TICKET_CHANGE_RADIOLOGY, data)
  }

  socketTicketLaboratoryListChange(
    oid: number,
    data: {
      ticketId: number
      ticketLaboratoryUpsertList?: TicketLaboratory[]
      ticketLaboratoryDestroyList?: TicketLaboratory[]
      ticketLaboratoryGroupUpsertList?: TicketLaboratoryGroup[]
      ticketLaboratoryGroupDestroyList?: TicketLaboratoryGroup[]
      ticketLaboratoryResultUpsertList?: TicketLaboratoryResult[]
      ticketLaboratoryResultDestroyList?: TicketLaboratoryResult[]
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_TICKET_CHANGE_LABORATORY, data)
  }

  socketTicketProductChange(
    oid: number,
    data: {
      ticketId: number
      ticketProductUpsertList?: TicketProduct[]
      ticketProductDestroyList?: TicketProduct[]
      ticketProductReplaceList?: TicketProduct[]
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_TICKET_CHANGE_PRODUCT, data)
  }

  socketTicketConsumableChange(
    oid: number,
    data: {
      ticketId: number
      ticketProductUpsertList?: TicketProduct[]
      ticketProductDestroyList?: TicketProduct[]
      ticketProductReplaceList?: TicketProduct[]
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_TICKET_CHANGE_CONSUMABLE, data)
  }

  socketTicketPrescriptionChange(
    oid: number,
    data: {
      ticketId: number
      ticketProductUpsertList?: TicketProduct[]
      ticketProductDestroyList?: TicketProduct[]
      ticketProductReplaceList?: TicketProduct[]
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_TICKET_CHANGE_PRESCRIPTION, data)
  }

  socketTicketBatchListChange(
    oid: number,
    data: {
      ticketId: number
      ticketBatchUpsertList?: TicketBatch[]
      ticketBatchDestroyList?: TicketBatch[]
      ticketBatchReplaceList?: TicketBatch[]
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_TICKET_CHANGE_BATCH, data)
  }
}
