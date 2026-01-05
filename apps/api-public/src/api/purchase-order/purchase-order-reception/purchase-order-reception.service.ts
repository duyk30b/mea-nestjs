import { Injectable } from '@nestjs/common'
import { Distributor, PurchaseOrder } from '../../../../../_libs/database/entities'
import {
  PurchaseOrderDebtSuccessInsertBody,
  PurchaseOrderDepositedUpdateBody,
  PurchaseOrderDraftInsertBody,
  PurchaseOrderDraftUpdateBody,
} from './request'
import { PurchaseOrderBasicUpsertService } from './service/purchase-order-basic-upsert.service'

@Injectable()
export class ApiPurchaseOrderReceptionService {
  constructor(private purchaseOrderBasicUpsertService: PurchaseOrderBasicUpsertService) { }

  async draftInsert(props: {
    oid: number
    purchaseOrderId?: string
    body: PurchaseOrderDraftInsertBody
  }) {
    const { oid, body } = props

    const result = await this.purchaseOrderBasicUpsertService.startUpsert({
      oid,
      purchaseOrderId: props.purchaseOrderId,
      distributorId: body.distributorId,
      body,
    })

    return { purchaseOrderCreated: result.purchaseOrder }
  }

  async draftUpdate(props: {
    oid: number
    purchaseOrderId?: string
    body: PurchaseOrderDraftUpdateBody
  }) {
    const { oid, body } = props

    const result = await this.purchaseOrderBasicUpsertService.startUpsert({
      oid,
      purchaseOrderId: props.purchaseOrderId,
      distributorId: 0, // không truyền distributorId vì không cho sửa
      body,
    })

    return { purchaseOrderModified: result.purchaseOrder }
  }

  async depositedUpdate(params: {
    oid: number
    purchaseOrderId: string
    body: PurchaseOrderDepositedUpdateBody
  }) {
    const { oid, body, purchaseOrderId } = params

    const result = await this.purchaseOrderBasicUpsertService.startUpsert({
      oid,
      purchaseOrderId,
      distributorId: 0, // không truyền distributorId vì không cho sửa
      body,
    })

    return { purchaseOrderModified: result.purchaseOrder }
  }

  async debtSuccessCreate(props: {
    oid: number
    userId: number
    body: PurchaseOrderDebtSuccessInsertBody
  }) {
    const { oid, userId, body } = props

    const { purchaseOrder: purchaseOrderCreated } =
      await this.purchaseOrderBasicUpsertService.startUpsert({
        oid,
        purchaseOrderId: '',
        distributorId: body.distributorId,
        body,
      })

    const { paidTotal } = body
    const debtTotal = purchaseOrderCreated.totalMoney - paidTotal
    const time = body.purchaseOrderBasic.startedAt
    const purchaseOrderId = purchaseOrderCreated.id
    const distributorId = purchaseOrderCreated.distributorId

    let purchaseOrderModified: PurchaseOrder
    let distributor: Distributor

    // CONTINUE ...
  }
}
