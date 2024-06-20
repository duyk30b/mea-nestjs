import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { OidVisitIdDataType, VISIT_EVENT } from './visit-event.constants'

@Injectable()
export class VisitEventEmit {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async emitSendProductList(payload: { data: OidVisitIdDataType }) {
    this.eventEmitter.emit(VISIT_EVENT.SEND_VISIT_PRODUCT_LIST, payload)
  }

  async emitRefundProductList(payload: { data: OidVisitIdDataType }) {
    this.eventEmitter.emit(VISIT_EVENT.REFUND_VISIT_PRODUCT_LIST, payload)
  }
}
