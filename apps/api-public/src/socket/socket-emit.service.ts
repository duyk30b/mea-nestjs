import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import {
  Batch,
  Customer,
  Image,
  Organization,
  Product,
  PurchaseOrder,
  Ticket,
  TicketAttribute,
  TicketBatch,
  TicketExpense,
  TicketLaboratory,
  TicketLaboratoryGroup,
  TicketLaboratoryResult,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
  TicketReception,
  TicketRegimen,
  TicketRegimenItem,
  TicketSurcharge,
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

  socketTicketChange(
    oid: number,
    data: {
      ticketId: string
      ticketDestroyedId?: string
      ticketModified?: Ticket
      imageList?: { destroyedList?: Image[]; upsertedList?: Image[] }
      ticketAttribute?: { destroyedList?: TicketAttribute[]; upsertedList?: TicketAttribute[] }
      ticketUser?: { destroyedList?: TicketUser[]; upsertedList?: TicketUser[] }
      ticketReception?: { destroyedList?: TicketReception[]; upsertedList?: TicketReception[] }
      ticketProduct?: { destroyedList?: TicketProduct[]; upsertedList?: TicketProduct[] }
      ticketBatch?: { destroyedList?: TicketBatch[]; upsertedList?: TicketBatch[] }
      ticketProcedure?: { destroyedList?: TicketProcedure[]; upsertedList?: TicketProcedure[] }
      ticketRegimen?: { destroyedList?: TicketRegimen[]; upsertedList?: TicketRegimen[] }
      ticketRegimenItem?: {
        destroyedList?: TicketRegimenItem[]
        upsertedList?: TicketRegimenItem[]
      }
      ticketLaboratoryGroup?: {
        destroyedList?: TicketLaboratoryGroup[]
        upsertedList?: TicketLaboratoryGroup[]
      }
      ticketLaboratory?: { destroyedList?: TicketLaboratory[]; upsertedList?: TicketLaboratory[] }
      ticketLaboratoryResult?: {
        destroyedList?: TicketLaboratoryResult[]
        upsertedList?: TicketLaboratoryResult[]
      }
      ticketRadiology?: { destroyedList?: TicketRadiology[]; upsertedList?: TicketRadiology[] }
      ticketSurcharge?: { destroyedList?: TicketSurcharge[]; upsertedList?: TicketSurcharge[] }
      ticketExpense?: { destroyedList?: TicketExpense[]; upsertedList?: TicketExpense[] }
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_TICKET_CHANGE, data)
  }

  socketMasterDataChange(
    oid: number,
    data: {
      distributor?: boolean
      procedure?: boolean
      regimen?: boolean
      laboratory?: boolean
      radiology?: boolean
      position?: boolean
      discount?: boolean
      surcharge?: boolean
      expense?: boolean
    }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SOCKET_MASTER_DATA_CHANGE, data)
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
}
