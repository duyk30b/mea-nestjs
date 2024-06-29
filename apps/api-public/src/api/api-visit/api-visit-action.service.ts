import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import * as DOMPurify from 'isomorphic-dompurify'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyArray, checkDuplicate } from '../../../../_libs/common/helpers/object.helper'
import { VisitProcedureInsertType } from '../../../../_libs/database/entities/visit-procedure.entity'
import { VisitProductInsertType } from '../../../../_libs/database/entities/visit-product.entity'
import { VisitRadiologyInsertBasicType } from '../../../../_libs/database/entities/visit-radiology.entity'
import { VisitBatchRepository } from '../../../../_libs/database/repository/visit-batch/visit-batch.repository'
import { VisitDiagnosisRepository } from '../../../../_libs/database/repository/visit-diagnosis/visit-diagnosis.repository'
import { VisitProductRepository } from '../../../../_libs/database/repository/visit-product/visit-product.repository'
import { VisitClose } from '../../../../_libs/database/repository/visit/visit-close'
import { VisitItemsMoney } from '../../../../_libs/database/repository/visit/visit-items-money'
import { VisitPayDebt } from '../../../../_libs/database/repository/visit/visit-pay-debt'
import { VisitPrepayment } from '../../../../_libs/database/repository/visit/visit-prepayment'
import { VisitRefundOverpaid } from '../../../../_libs/database/repository/visit/visit-refund-overpaid'
import { VisitReopen } from '../../../../_libs/database/repository/visit/visit-reopen'
import { VisitReplaceVisitProcedureList } from '../../../../_libs/database/repository/visit/visit-replace-visit-procedure-list'
import { VisitReplaceVisitProductList } from '../../../../_libs/database/repository/visit/visit-replace-visit-product-list'
import { VisitReplaceVisitRadiologyList } from '../../../../_libs/database/repository/visit/visit-replace-visit-radiology-list'
import { VisitReturnProduct } from '../../../../_libs/database/repository/visit/visit-return-product'
import { VisitSendProduct } from '../../../../_libs/database/repository/visit/visit-send-product'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  VisitPaymentBody,
  VisitReplacePrescriptionBody,
  VisitReplaceVisitProcedureListBody,
  VisitReplaceVisitRadiologyListBody,
  VisitReturnProductListBody,
  VisitSendProductListBody,
  VisitUpdateVisitItemsMoneyBody,
} from './request'

@Injectable()
export class ApiVisitActionService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly visitDiagnosisRepository: VisitDiagnosisRepository,
    private readonly visitProductRepository: VisitProductRepository,
    private readonly visitSendProduct: VisitSendProduct,
    private readonly visitReplaceVisitProcedureList: VisitReplaceVisitProcedureList,
    private readonly visitReplaceVisitRadiologyList: VisitReplaceVisitRadiologyList,
    private readonly visitReplaceVisitProductList: VisitReplaceVisitProductList,
    private readonly visitReturnProduct: VisitReturnProduct,
    private readonly visitPrepayment: VisitPrepayment,
    private readonly visitClose: VisitClose,
    private readonly visitReopen: VisitReopen,
    private readonly visitItemsMoney: VisitItemsMoney,
    private readonly visitRefundOverpaid: VisitRefundOverpaid,
    private readonly visitPayDebt: VisitPayDebt,
    private readonly visitBatchRepository: VisitBatchRepository
  ) {}

  async replaceVisitProcedureList(oid: number, body: VisitReplaceVisitProcedureListBody) {
    const { visitId, customerId } = body
    const result = await this.visitReplaceVisitProcedureList.replaceVisitProcedureList({
      oid,
      visitId,
      visitProcedureListInsert: body.visitProcedureList.map((i) => {
        const data: VisitProcedureInsertType = { ...i, oid, visitId, customerId }
        return data
      }),
    })

    const { visitBasic, visitProcedureList } = result

    this.socketEmitService.visitUpdate(oid, { visitBasic })
    this.socketEmitService.visitReplaceVisitProcedureList(oid, { visitId, visitProcedureList })

    return { data: true }
  }

  async replaceVisitPrescription(oid: number, body: VisitReplacePrescriptionBody) {
    const { visitId } = body
    if (body.advice) {
      const [visitDiagnosis] = await this.visitDiagnosisRepository.updateAndReturnEntity(
        { oid, visitId },
        { advice: DOMPurify.sanitize(body.advice) }
      )
      this.socketEmitService.visitUpdateVisitDiagnosis(oid, { visitId, visitDiagnosis })
    }

    const result = await this.visitReplaceVisitProductList.replaceVisitProductList({
      oid,
      visitId,
      visitProductListInsert: body.visitProductList.map((i) => {
        const data: VisitProductInsertType = { ...i, oid, visitId, isSent: 0 }
        return data
      }),
    })

    const { visitBasic, visitProductList } = result

    this.socketEmitService.visitUpdate(oid, { visitBasic })
    this.socketEmitService.visitReplaceVisitProductList(oid, { visitId, visitProductList })

    return { data: true }
  }

  async replaceVisitRadiologyList(oid: number, body: VisitReplaceVisitRadiologyListBody) {
    const { visitId, customerId } = body
    const result = await this.visitReplaceVisitRadiologyList.replaceVisitRadiologyList({
      oid,
      visitId,
      visitRadiologyListInsert: body.visitRadiologyList.map((i) => {
        const data: VisitRadiologyInsertBasicType = {
          ...i,
          oid,
          visitId,
          customerId,
        }
        return data
      }),
    })

    const { visitBasic, visitRadiologyList } = result

    this.socketEmitService.visitUpdate(oid, { visitBasic })
    this.socketEmitService.visitReplaceVisitRadiologyList(oid, { visitId, visitRadiologyList })

    return { data: true }
  }

  async updateVisitItemsMoney(oid: number, body: VisitUpdateVisitItemsMoneyBody) {
    const { visitId } = body
    const result = await this.visitItemsMoney.updateItemsMoney({
      oid,
      visitId,
      visitProductUpdateList: body.visitProductList,
      visitProcedureUpdateList: body.visitProcedureList,
      visitRadiologyUpdateList: body.visitRadiologyList,
    })

    const { visitBasic, visitProductList, visitProcedureList, visitRadiologyList } = result
    this.socketEmitService.visitUpdate(oid, { visitBasic })
    this.socketEmitService.visitReplaceVisitProductList(oid, { visitId, visitProductList })
    this.socketEmitService.visitReplaceVisitProcedureList(oid, { visitId, visitProcedureList })
    this.socketEmitService.visitReplaceVisitRadiologyList(oid, { visitId, visitRadiologyList })
    return { data: true }
  }

  async sendProductList(oid: number, body: VisitSendProductListBody) {
    if ('Validate') {
      if (checkDuplicate(body.visitProductSendList, 'visitProductId')) {
        throw new BusinessException('error.ValidateFailed', { obj: 'Duplicate visitProductId' })
      }

      const visitBatchSendListMap = arrayToKeyArray(body.visitBatchSendList, 'visitProductId')
      const visitProductListHasBatches = body.visitProductSendList.filter((i) => i.hasManageBatches)

      if (Object.keys(visitBatchSendListMap).length !== visitProductListHasBatches.length) {
        throw new BusinessException('error.ValidateFailed', { obj: 'visitBatchSend length error' })
      }

      body.visitProductSendList.forEach((i) => {
        if (!i.hasManageBatches) return // nếu không quản lý batch thì chẳng có gì để check
        if (i.hasManageBatches && !i.hasManageQuantity) {
          throw new BusinessException('error.ValidateFailed', {
            obj: `${i.brandName} noManageQuantity but hasManageBatches`,
          })
        }
        const sumQuantityBatch = visitBatchSendListMap[i.visitProductId].reduce((acc, item) => {
          return acc + item.quantitySend
        }, 0)
        if (sumQuantityBatch !== i.quantitySend) {
          throw new BusinessException('error.ValidateFailed', {
            obj: `${i.brandName} visitBatchSend sum quantity error`,
          })
        }
      })
    }

    try {
      const { visitId } = body
      const result = await this.visitSendProduct.sendProductList({
        oid,
        visitId: body.visitId,
        time: Date.now(),
        visitProductSendList: body.visitProductSendList,
        visitBatchSendList: body.visitBatchSendList,
      })

      const { visitBasic, productList } = result

      const [visitBatchList, visitProductList] = await Promise.all([
        this.visitBatchRepository.findMany({
          condition: { visitId },
          relation: { batch: true },
          sort: { id: 'ASC' },
        }),
        await this.visitProductRepository.findMany({
          condition: { visitId },
          relation: { product: true },
          sort: { id: 'ASC' },
        }),
      ])
      this.socketEmitService.productListUpdate(oid, { productList })
      this.socketEmitService.visitUpdate(oid, { visitBasic })
      this.socketEmitService.visitReplaceVisitProductList(oid, { visitId, visitProductList })
      this.socketEmitService.visitReplaceVisitBatchList(oid, { visitId, visitBatchList })
      return { data: true }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async returnProductList(oid: number, body: VisitReturnProductListBody) {
    if ('Validate') {
      if (checkDuplicate(body.visitProductReturnList, 'visitProductId')) {
        throw new BusinessException('error.ValidateFailed', { obj: 'Duplicate visitProductId' })
      }

      const visitBatchReturnListMap = arrayToKeyArray(body.visitBatchReturnList, 'visitProductId')
      const visitProductListHasBatches = body.visitProductReturnList.filter(
        (i) => i.hasManageBatches
      )

      if (Object.keys(visitBatchReturnListMap).length !== visitProductListHasBatches.length) {
        throw new BusinessException('error.ValidateFailed', {
          obj: 'visitBatchReturn length error',
        })
      }

      body.visitProductReturnList.forEach((i) => {
        if (!i.hasManageBatches) return // nếu không quản lý batch thì chẳng có gì để check
        if (i.hasManageBatches && !i.hasManageQuantity) {
          throw new BusinessException('error.ValidateFailed', {
            obj: `${i.brandName} noManageQuantity but hasManageBatches`,
          })
        }
        const sumQuantityBatch = visitBatchReturnListMap[i.visitProductId].reduce((acc, item) => {
          return acc + item.quantityReturn
        }, 0)
        if (sumQuantityBatch !== i.quantityReturn) {
          throw new BusinessException('error.ValidateFailed', {
            obj: `${i.brandName} visitBatchReturn sum quantity error`,
          })
        }
      })
    }
    try {
      const { visitId } = body
      const result = await this.visitReturnProduct.returnProductList({
        oid,
        visitId: body.visitId,
        time: Date.now(),
        visitProductReturnList: body.visitProductReturnList,
        visitBatchReturnList: body.visitBatchReturnList,
      })
      const { visitBasic, productList } = result

      const [visitBatchList, visitProductList] = await Promise.all([
        this.visitBatchRepository.findMany({
          condition: { visitId },
          relation: { batch: true },
          sort: { id: 'ASC' },
        }),
        await this.visitProductRepository.findMany({
          condition: { visitId },
          relation: { product: true },
          sort: { id: 'ASC' },
        }),
      ])

      this.socketEmitService.productListUpdate(oid, { productList })
      this.socketEmitService.visitUpdate(oid, { visitBasic })
      this.socketEmitService.visitReplaceVisitProductList(oid, { visitId, visitProductList })
      this.socketEmitService.visitReplaceVisitBatchList(oid, { visitId, visitBatchList })
      return { data: true }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async prepayment(oid: number, body: VisitPaymentBody) {
    try {
      const { visitBasic } = await this.visitPrepayment.prepayment({
        oid,
        visitId: body.visitId,
        time: Date.now(),
        money: body.money,
      })

      this.socketEmitService.visitUpdate(oid, { visitBasic })
      return { data: true }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async refundOverpaid(oid: number, body: VisitPaymentBody) {
    try {
      const { visitBasic } = await this.visitRefundOverpaid.refundOverpaid({
        oid,
        visitId: body.visitId,
        time: Date.now(),
        money: body.money,
      })

      this.socketEmitService.visitUpdate(oid, { visitBasic })
      return { data: { visitBasic } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async close(oid: number, visitId: number) {
    try {
      const { visitBasic, customer } = await this.visitClose.close({
        oid,
        visitId,
        time: Date.now(),
      })

      this.socketEmitService.visitUpdate(oid, { visitBasic })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: true }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async payDebt(oid: number, body: VisitPaymentBody) {
    try {
      const { visitBasic, customer } = await this.visitPayDebt.payDebt({
        oid,
        visitId: body.visitId,
        time: Date.now(),
        money: body.money,
      })

      this.socketEmitService.visitUpdate(oid, { visitBasic })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: true }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async reopen(oid: number, visitId: number) {
    try {
      const { visitBasic, customer } = await this.visitReopen.reopen({
        oid,
        visitId,
        time: Date.now(),
      })

      this.socketEmitService.visitUpdate(oid, { visitBasic })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: true }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
