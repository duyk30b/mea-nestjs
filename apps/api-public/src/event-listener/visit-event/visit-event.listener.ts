import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { VisitBatchRepository } from '../../../../_libs/database/repository/visit-batch/visit-batch.repository'
import { VisitProcedureRepository } from '../../../../_libs/database/repository/visit-procedure/visit-procedure.repository'
import { VisitProductRepository } from '../../../../_libs/database/repository/visit-product/visit-product.repository'
import { VisitRepository } from '../../../../_libs/database/repository/visit/visit.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { OidVisitIdDataType, VISIT_EVENT } from './visit-event.constants'

@Injectable()
export class VisitEventListener {
  private logger = new Logger(VisitEventListener.name)
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly visitRepository: VisitRepository,
    private readonly visitProcedureRepository: VisitProcedureRepository,
    private readonly visitProductRepository: VisitProductRepository,
    private readonly visitBatchRepository: VisitBatchRepository
  ) {}

  @OnEvent(VISIT_EVENT.SEND_VISIT_PRODUCT_LIST)
  async listenSendProductList(payload: { data: OidVisitIdDataType }) {
    try {
      this.logger.log('VISIT_EVENT.SEND_VISIT_PRODUCT_LIST | ' + JSON.stringify(payload))
      const { visitId, oid } = payload.data
      const visitBatchList = await this.visitBatchRepository.findMany({
        condition: { visitId },
        relation: { batch: true },
        sort: { id: 'ASC' },
      })
      const visitProductList = await this.visitProductRepository.findMany({
        condition: { visitId },
        relation: { product: true },
        sort: { id: 'ASC' },
      })
      const productsMoney = visitProductList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)
      const [visit] = await this.visitRepository.updateItemsMoney({
        oid,
        visitId,
        productsMoney,
      })
      if (!visit) throw new BusinessException('error.Database.UpdateFailed')
      this.socketEmitService.visitUpdate(oid, { visitBasic: visit })
      this.socketEmitService.visitReplaceVisitProductList(oid, { visitId, visitProductList })
      this.socketEmitService.visitReplaceVisitBatchList(oid, { visitId, visitBatchList })
    } catch (error: any) {
      this.logger.error('[ERROR] VISIT_EVENT.SEND_VISIT_PRODUCT_LIST | ' + error.message)
    }
  }

  @OnEvent(VISIT_EVENT.REFUND_VISIT_PRODUCT_LIST)
  async listenRefundProductList(payload: { data: OidVisitIdDataType }) {
    try {
      this.logger.log('VISIT_EVENT.REFUND_VISIT_PRODUCT_LIST | ' + JSON.stringify(payload))
      const { visitId, oid } = payload.data
      const visitBatchList = await this.visitBatchRepository.findMany({
        condition: { visitId },
        relation: { batch: true },
        sort: { id: 'ASC' },
      })
      const visitProductList = await this.visitProductRepository.findMany({
        condition: { visitId },
        relation: { product: true },
        sort: { id: 'ASC' },
      })
      const productsMoney = visitProductList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)
      const [visit] = await this.visitRepository.updateProductMoneyWhenReturn({
        oid,
        visitId,
        productsMoney,
      })
      if (!visit) throw new BusinessException('error.Database.UpdateFailed')
      this.socketEmitService.visitUpdate(oid, { visitBasic: visit })
      this.socketEmitService.visitReplaceVisitProductList(oid, { visitId, visitProductList })
      this.socketEmitService.visitReplaceVisitBatchList(oid, { visitId, visitBatchList })
    } catch (error: any) {
      this.logger.error('[ERROR] VISIT_EVENT.REFUND_VISIT_PRODUCT_LIST | ' + error.message)
    }
  }
}
