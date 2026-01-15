import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers/array.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { StockCheck } from '../../../../_libs/database/entities'
import { StockCheckItemInsertType } from '../../../../_libs/database/entities/stock-check-item.entity'
import { StockCheckStatus } from '../../../../_libs/database/entities/stock-check.entity'
import { StockCheckReconcileOperation } from '../../../../_libs/database/operations'
import {
  StockCheckItemRepository,
  StockCheckRepository,
} from '../../../../_libs/database/repositories'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  StockCheckGetManyQuery,
  StockCheckGetOneQuery,
  StockCheckPaginationQuery,
  StockCheckUpsertDraftBody,
} from './request'

@Injectable()
export class ApiStockCheckService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly stockCheckRepository: StockCheckRepository,
    private readonly stockCheckItemRepository: StockCheckItemRepository,
    private readonly stockCheckReconcileOperation: StockCheckReconcileOperation
  ) { }

  async pagination(oid: number, query: StockCheckPaginationQuery) {
    const { page, limit, relation } = query
    const { createdByUserId, updatedByUserId, createdAt, status } = query.filter || {}

    const { total, data: stockCheckList } = await this.stockCheckRepository.pagination({
      relation: {
        stockCheckItemList: relation?.stockCheckItemList,
        createdByUser: relation?.createdByUser,
        updatedByUser: relation?.updatedByUser,
      },
      relationLoadStrategy: 'query',
      page: query.page,
      limit: query.limit,
      condition: {
        oid,
        status,
        createdAt,
        updatedByUserId,
        createdByUserId,
      },
      sort: query.sort || { id: 'DESC' },
    })
    return { stockCheckList, total, page, limit }
  }

  async getMany(oid: number, query: StockCheckGetManyQuery): Promise<BaseResponse> {
    const { relation, limit } = query
    const { createdByUserId, updatedByUserId, createdAt, status } = query.filter || {}

    const stockCheckList = await this.stockCheckRepository.findMany({
      relation: {
        stockCheckItemList: relation?.stockCheckItemList,
        createdByUser: relation?.createdByUser,
        updatedByUser: relation?.updatedByUser,
      },
      relationLoadStrategy: 'query',
      limit,
      condition: {
        oid,
        status,
        createdAt,
        updatedByUserId,
        createdByUserId,
      },
      sort: query.sort || { id: 'DESC' },
    })
    return { data: { stockCheckList } }
  }

  async getOne(options: {
    oid: number
    id: string
    query: StockCheckGetOneQuery
  }): Promise<BaseResponse> {
    const { oid, id, query } = options
    const { relation } = query
    const stockCheck = await this.stockCheckRepository.findOne({
      condition: { oid, id },
      relation: {
        stockCheckItemList: relation?.stockCheckItemList,
        createdByUser: relation?.createdByUser,
        updatedByUser: relation?.updatedByUser,
      },
      relationLoadStrategy: 'query',
    })
    if (!stockCheck) {
      throw new BusinessException('error.Database.NotFound')
    }
    return { data: { stockCheck } }
  }

  async upsertDraft(params: {
    oid: number
    userId: number
    body: StockCheckUpsertDraftBody
  }): Promise<BaseResponse> {
    const { oid, body, userId } = params
    const { stockCheckBody, stockCheckId, stockCheckItemBodyList } = body

    // Validate
    const duplicateBatchId = ESArray.checkDuplicate(stockCheckItemBodyList, 'batchId')
    if (duplicateBatchId.length) {
      throw new BusinessException(
        `Tạo phiếu không thành công, xuất hiện 2 sản phẩm trùng nhau` as any
      )
    }

    let stockCheck: StockCheck
    if (!stockCheckId) {
      stockCheck = await this.stockCheckRepository.insertOne({
        oid,
        createdAt: stockCheckBody.createdAt,
        createdByUserId: stockCheckBody.createdByUserId,
        note: stockCheckBody.note,
        status: StockCheckStatus.Draft,
        updatedAt: Date.now(),
        updatedByUserId: 0,
      })
    } else {
      stockCheck = await this.stockCheckRepository.updateOne(
        { oid, id: stockCheckId, status: StockCheckStatus.Draft },
        {
          createdAt: stockCheckBody.createdAt,
          createdByUserId: stockCheckBody.createdByUserId,
          note: stockCheckBody.note,
        }
      )
      await this.stockCheckItemRepository.deleteBasic({ oid, stockCheckId })
    }
    if (!stockCheck) {
      throw new BusinessException('error.Conflict')
    }

    const stockCheckItemInsertList = stockCheckItemBodyList.map((i) => {
      const insertDto: StockCheckItemInsertType = {
        oid,
        stockCheckId: stockCheck.id,
        productId: i.productId,
        batchId: i.batchId,
        systemQuantity: i.systemQuantity,
        actualQuantity: i.actualQuantity,
        systemCostAmount: i.systemCostAmount,
        actualCostAmount: i.actualCostAmount,
        note: i.note,
      }
      return insertDto
    })
    await this.stockCheckItemRepository.insertManyBasic(stockCheckItemInsertList)

    return { data: { stockCheck } }
  }

  async draftSubmit(params: {
    oid: number
    stockCheckId: string
    userId: number
  }): Promise<BaseResponse> {
    const { oid, stockCheckId, userId } = params
    const stockCheck = await this.stockCheckRepository.updateOne(
      { oid, id: stockCheckId, status: StockCheckStatus.Draft },
      {
        status: StockCheckStatus.Pending,
        updatedByUserId: userId,
      }
    )
    if (!stockCheck) {
      throw new BusinessException('error.Conflict')
    }
    return { data: { stockCheck } }
  }

  async pendingApprove(params: {
    oid: number
    stockCheckId: string
    userId: number
  }): Promise<BaseResponse> {
    const { oid, stockCheckId, userId } = params
    const stockCheck = await this.stockCheckRepository.updateOne(
      { oid, id: stockCheckId, status: StockCheckStatus.Pending },
      {
        status: StockCheckStatus.Confirmed,
        updatedByUserId: userId,
      }
    )
    if (!stockCheck) {
      throw new BusinessException('error.Conflict')
    }
    return { data: { stockCheck } }
  }

  async confirmReconcile(params: {
    oid: number
    stockCheckId: string
    userId: number
  }): Promise<BaseResponse> {
    const { oid, stockCheckId, userId } = params
    const { stockCheck, productModifiedList, batchModifiedList } =
      await this.stockCheckReconcileOperation.startReconcile({
        oid,
        stockCheckId,
        userId,
        time: Date.now(),
      })

    this.socketEmitService.productListChange(oid, {
      productUpsertedList: productModifiedList || [],
      batchUpsertedList: batchModifiedList || [],
    })
    return { data: { stockCheck } }
  }

  async void(params: { oid: number; stockCheckId: string; userId: number }): Promise<BaseResponse> {
    const { oid, stockCheckId, userId } = params
    const stockCheck = await this.stockCheckRepository.updateOne(
      {
        oid,
        id: stockCheckId,
        status: { IN: [StockCheckStatus.Pending, StockCheckStatus.Confirmed] },
      },
      {
        status: StockCheckStatus.Cancelled,
        updatedByUserId: userId,
      }
    )
    if (!stockCheck) {
      throw new BusinessException('error.Conflict')
    }
    return { data: { stockCheck } }
  }

  async destroy(params: { oid: number; stockCheckId: string }): Promise<BaseResponse> {
    const { oid, stockCheckId } = params
    const stockCheckOrigin = await this.stockCheckRepository.findOneBy({ oid, id: stockCheckId })
    if (![StockCheckStatus.Draft, StockCheckStatus.Cancelled].includes(stockCheckOrigin.status)) {
      throw new BusinessException('error.Conflict')
    }
    await this.stockCheckItemRepository.deleteBasic({ oid, stockCheckId })
    await this.stockCheckRepository.deleteBasic({ oid, id: stockCheckId })
    return { data: { stockCheckId } }
  }
}
