import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import {
  Batch,
  Customer,
  Distributor,
  Procedure,
  Product,
  Visit,
  VisitBatch,
  VisitDiagnosis,
  VisitProcedure,
  VisitProduct,
} from '../../../_libs/database/entities'
import { SOCKET_EVENT } from './socket.variable'

@Injectable()
export class SocketEmitService {
  public connections: Record<string, any[]> = null
  public io: Server = null

  demo(oid: number) {
    if (!this.io) return
    const dataDemo = new Date().toISOString()
    this.io.in(oid.toString()).emit(SOCKET_EVENT.SERVER_EMIT_DEMO, { dataDemo })
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
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.PRODUCT_LIST_UPDATE, data)
  }

  batchUpsert(oid: number, data: { batch: Batch }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.BATCH_UPSERT, data)
  }

  batchListUpdate(oid: number, data: { batchList: Batch[] }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.BATCH_LIST_UPDATE, data)
  }

  procedureUpsert(oid: number, data: { procedure: Procedure }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.PROCEDURE_UPSERT, data)
  }

  visitCreate(oid: number, data: { visit: Visit }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.VISIT_CREATE, data)
  }

  visitUpdate(oid: number, data: { visitBasic: Visit }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.VISIT_UPDATE, data)
  }

  visitUpdateVisitDiagnosis(
    oid: number,
    data: { visitId: number; visitDiagnosis: VisitDiagnosis }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.VISIT_UPDATE_VISIT_DIAGNOSIS, data)
  }

  visitReplaceVisitProductList(
    oid: number,
    data: { visitId: number; visitProductList: VisitProduct[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.VISIT_REPLACE_VISIT_PRODUCT_LIST, data)
  }

  visitReplaceVisitBatchList(oid: number, data: { visitId: number; visitBatchList: VisitBatch[] }) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.VISIT_REPLACE_VISIT_BATCH_LIST, data)
  }

  visitReplaceVisitProcedureList(
    oid: number,
    data: { visitId: number; visitProcedureList: VisitProcedure[] }
  ) {
    if (!this.io) return
    this.io.in(oid.toString()).emit(SOCKET_EVENT.VISIT_REPLACE_VISIT_PROCEDURE_LIST, data)
  }
}
