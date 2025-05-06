import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../../_libs/common/cache-data/cache-data.service'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { TicketProductType } from '../../../../../_libs/database/entities/ticket-product.entity'
import {
  TicketClinicAddTicketProductOperation,
  TicketClinicDestroyTicketProductOperation,
  TicketClinicUpdateTicketProductListOperation,
  TicketClinicUpdateTicketProductOperation,
  TicketReturnProductOperation,
  TicketSendProductOperation,
} from '../../../../../_libs/database/operations'
import {
  TicketBatchRepository,
  TicketProductRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketReturnProductListBody } from '../../api-ticket/request'
import {
  TicketClinicAddTicketProductListBody,
  TicketClinicUpdatePriorityTicketProductBody,
  TicketClinicUpdateTicketProductBody,
} from './request'

@Injectable()
export class ApiTicketClinicProductService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,

    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketBatchRepository: TicketBatchRepository,

    private readonly ticketClinicAddTicketProductOperation: TicketClinicAddTicketProductOperation,
    private readonly ticketClinicDestroyTicketProductOperation: TicketClinicDestroyTicketProductOperation,
    private readonly ticketClinicUpdateTicketProductOperation: TicketClinicUpdateTicketProductOperation,
    private readonly ticketClinicUpdateTicketProductListOperation: TicketClinicUpdateTicketProductListOperation,

    private readonly ticketSendProductOperation: TicketSendProductOperation,
    private readonly ticketReturnProductOperation: TicketReturnProductOperation
  ) { }

  async addTicketProductList(options: {
    oid: number
    ticketId: number
    ticketProductType: TicketProductType
    body: TicketClinicAddTicketProductListBody
  }) {
    const { oid, ticketId, ticketProductType, body } = options
    const result = await this.ticketClinicAddTicketProductOperation.addTicketProductList({
      oid,
      ticketId,
      ticketProductType,
      ticketProductDtoList: body.ticketProductList,
    })

    const { ticket } = result

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    if (ticketProductType === TicketProductType.Consumable) {
      this.socketEmitService.ticketClinicChangeConsumable(oid, {
        ticketId,
        ticketProductUpsertList: result.ticketProductList,
      })
    }
    if (ticketProductType === TicketProductType.Prescription) {
      this.socketEmitService.ticketClinicChangePrescription(oid, {
        ticketId,
        ticketProductUpsertList: result.ticketProductList,
      })
    }

    return { data: true }
  }

  async destroyTicketProduct(options: {
    oid: number
    ticketId: number
    ticketProductId: number
    ticketProductType: TicketProductType
  }) {
    const { oid, ticketId, ticketProductId, ticketProductType } = options
    const result = await this.ticketClinicDestroyTicketProductOperation.destroyTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      ticketProductType,
    })

    const { ticket, ticketProductDestroy } = result

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    if (ticketProductDestroy.type === TicketProductType.Consumable) {
      this.socketEmitService.ticketClinicChangeConsumable(oid, {
        ticketId,
        ticketProductDestroyList: [ticketProductDestroy],
      })
    }
    if (ticketProductDestroy.type === TicketProductType.Prescription) {
      this.socketEmitService.ticketClinicChangePrescription(oid, {
        ticketId,
        ticketProductDestroyList: [ticketProductDestroy],
      })
    }
    if (result.ticketUserDestroyList) {
      this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
        ticketId,
        ticketUserDestroyList: result.ticketUserDestroyList,
      })
    }

    return { data: true }
  }

  async updatePriorityTicketProduct(options: {
    oid: number
    ticketId: number
    ticketProductType: TicketProductType
    body: TicketClinicUpdatePriorityTicketProductBody
  }) {
    const { oid, ticketId, body, ticketProductType } = options
    const ticketProductList = await this.ticketProductRepository.updatePriorityList({
      oid,
      ticketId,
      updateData: body.ticketProductList,
    })
    ticketProductList.sort((a, b) => (a.priority < b.priority ? -1 : 1))

    if (ticketProductType === TicketProductType.Consumable) {
      this.socketEmitService.ticketClinicChangeConsumable(oid, {
        ticketId,
        ticketProductReplaceList: ticketProductList,
      })
    }
    if (ticketProductType === TicketProductType.Prescription) {
      this.socketEmitService.ticketClinicChangePrescription(oid, {
        ticketId,
        ticketProductReplaceList: ticketProductList,
      })
    }

    return { data: true }
  }

  async updateTicketProduct(options: {
    oid: number
    ticketId: number
    ticketProductId: number
    ticketProductType: TicketProductType
    body: TicketClinicUpdateTicketProductBody
  }) {
    const { oid, ticketId, ticketProductId, ticketProductType, body } = options
    const result = await this.ticketClinicUpdateTicketProductOperation.updateTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      ticketProductType,
      ticketProductUpdateDto: body.ticketProduct,
      ticketUserDto: body.ticketUserList,
    })

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket: result.ticket })
    if (result.ticketProduct.type === TicketProductType.Consumable) {
      this.socketEmitService.ticketClinicChangeConsumable(oid, {
        ticketId,
        ticketProductUpsertList: [result.ticketProduct],
      })
    }
    if (result.ticketProduct.type === TicketProductType.Prescription) {
      this.socketEmitService.ticketClinicChangePrescription(oid, {
        ticketId,
        ticketProductUpsertList: [result.ticketProduct],
      })
    }
    if (result.ticketUserChangeList) {
      this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
        ticketId,
        ticketUserDestroyList: result.ticketUserChangeList.ticketUserDestroyList,
        ticketUserUpsertList: result.ticketUserChangeList.ticketUserInsertList,
      })
    }
    return { data: true }
  }

  async sendProduct(params: { oid: number; ticketId: number }): Promise<BaseResponse> {
    const { oid, ticketId } = params
    const time = Date.now()
    try {
      const { productModifiedList, ticket } = await this.ticketSendProductOperation.sendProduct({
        oid,
        ticketId,
        time,
      })
      this.socketEmitService.productListUpdate(oid, { productList: productModifiedList })
      this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })

      const [ticketProductList] = await Promise.all([
        this.ticketProductRepository.findMany({
          condition: { oid, ticketId },
          sort: { id: 'ASC' },
        }),
      ])
      this.socketEmitService.ticketClinicChangeConsumable(oid, {
        ticketId,
        ticketProductReplaceList: ticketProductList.filter((i) => {
          return i.type === TicketProductType.Consumable
        }),
      })
      this.socketEmitService.ticketClinicChangePrescription(oid, {
        ticketId,
        ticketProductReplaceList: ticketProductList.filter((i) => {
          return i.type === TicketProductType.Prescription
        }),
      })

      return { data: true }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async returnProduct(params: {
    oid: number
    ticketId: number
    body: TicketReturnProductListBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body } = params
    try {
      const result = await this.ticketReturnProductOperation.returnProduct({
        oid,
        ticketId,
        time: Date.now(),
        tpReturnList: body.tpReturnList,
      })

      this.socketEmitService.productListUpdate(oid, { productList: result.productModifiedList })
      this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket: result.ticket })

      if (result.ticketUserModifiedList) {
        this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
          ticketId,
          ticketUserDestroyList: result.ticketUserDestroyedList,
          ticketUserUpsertList: result.ticketUserModifiedList,
        })
      }

      const [ticketProductList] = await Promise.all([
        this.ticketProductRepository.findMany({
          condition: { oid, ticketId },
          sort: { id: 'ASC' },
        }),
      ])
      this.socketEmitService.ticketClinicChangeConsumable(oid, {
        ticketId,
        ticketProductReplaceList: ticketProductList.filter((i) => {
          return i.type === TicketProductType.Consumable
        }),
      })
      this.socketEmitService.ticketClinicChangePrescription(oid, {
        ticketId,
        ticketProductReplaceList: ticketProductList.filter((i) => {
          return i.type === TicketProductType.Prescription
        }),
      })

      return { data: { ticket: result.ticket } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
