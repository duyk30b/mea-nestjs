import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { OidVisitIdDataType, VISIT_EVENT } from './visit-event.constants'

@Injectable()
export class VisitEventListener {
  private logger = new Logger(VisitEventListener.name)
  constructor() {}

  @OnEvent(VISIT_EVENT.SEND_VISIT_PRODUCT_LIST)
  async listenSendProductList(payload: { data: OidVisitIdDataType }) {
    // try {
    //   this.logger.log('VISIT_EVENT.SEND_VISIT_PRODUCT_LIST | ' + JSON.stringify(payload))
    //   const { visitId, oid } = payload.data
    //   const visitBatchList = await this.visitBatchRepository.findMany({
    //     condition: { visitId },
    //     relation: { batch: true },
    //     sort: { id: 'ASC' },
    //   })
    //   const visitProductList = await this.visitProductRepository.findMany({
    //     condition: { visitId },
    //     relation: { product: true },
    //     sort: { id: 'ASC' },
    //   })
    //   const productsMoney = visitProductList.reduce((acc, item) => {
    //     return acc + item.actualPrice * item.quantity
    //   }, 0)
    //   const [visit] = await this.visitRepository.updateItemsMoney({
    //     oid,
    //     visitId,
    //     productsMoney,
    //   })
    //   if (!visit) throw new BusinessException('error.Database.UpdateFailed')
    //   this.socketEmitService.visitUpdate(oid, { visitBasic: visit })
    //   this.socketEmitService.visitReplaceVisitProductList(oid, { visitId, visitProductList })
    //   this.socketEmitService.visitReplaceVisitBatchList(oid, { visitId, visitBatchList })
    // } catch (error: any) {
    //   this.logger.error('[ERROR] VISIT_EVENT.SEND_VISIT_PRODUCT_LIST | ' + error.message)
    // }
  }

  @OnEvent(VISIT_EVENT.REFUND_VISIT_PRODUCT_LIST)
  async listenRefundProductList(payload: { data: OidVisitIdDataType }) {
    // try {
    //   this.logger.log('VISIT_EVENT.REFUND_VISIT_PRODUCT_LIST | ' + JSON.stringify(payload))
    //   const { visitId, oid } = payload.data
    //   const visitBatchList = await this.visitBatchRepository.findMany({
    //     condition: { visitId },
    //     relation: { batch: true },
    //     sort: { id: 'ASC' },
    //   })
    //   const visitProductList = await this.visitProductRepository.findMany({
    //     condition: { visitId },
    //     relation: { product: true },
    //     sort: { id: 'ASC' },
    //   })
    //   const productsMoney = visitProductList.reduce((acc, item) => {
    //     return acc + item.actualPrice * item.quantity
    //   }, 0)
    //   const [visit] = await this.visitRepository.updateProductMoneyWhenReturn({
    //     oid,
    //     visitId,
    //     productsMoneyReturn: productsMoney,
    //   })
    //   if (!visit) throw new BusinessException('error.Database.UpdateFailed')
    //   this.socketEmitService.visitUpdate(oid, { visitBasic: visit })
    //   this.socketEmitService.visitReplaceVisitProductList(oid, { visitId, visitProductList })
    //   this.socketEmitService.visitReplaceVisitBatchList(oid, { visitId, visitBatchList })
    // } catch (error: any) {
    //   this.logger.error('[ERROR] VISIT_EVENT.REFUND_VISIT_PRODUCT_LIST | ' + error.message)
    // }
  }
}
