import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../../_libs/common/cache-data/cache-data.service'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { PositionInteractType } from '../../../../../_libs/database/entities/position.entity'
import { TicketProductType } from '../../../../../_libs/database/entities/ticket-product.entity'
import {
  TicketClinicAddTicketProductOperation,
  TicketClinicDestroyTicketProductOperation,
  TicketClinicUpdateTicketProductOperation,
  TicketReturnProductOperation,
  TicketSendProductOperation,
} from '../../../../../_libs/database/operations'
import { TicketProductRepository } from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketReturnProductListBody, TicketSendProductListBody } from '../../ticket/request'
import { ApiTicketClinicUserService } from '../api-ticket-clinic-user/api-ticket-clinic-user.service'
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

    private readonly ticketClinicAddTicketProductOperation: TicketClinicAddTicketProductOperation,
    private readonly ticketClinicDestroyTicketProductOperation: TicketClinicDestroyTicketProductOperation,
    private readonly ticketClinicUpdateTicketProductOperation: TicketClinicUpdateTicketProductOperation,

    private readonly ticketSendProductOperation: TicketSendProductOperation,
    private readonly ticketReturnProductOperation: TicketReturnProductOperation,
    private readonly apiTicketClinicUserService: ApiTicketClinicUserService
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

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    if (ticketProductType === TicketProductType.Consumable) {
      this.socketEmitService.socketTicketConsumableChange(oid, {
        ticketId,
        ticketProductUpsertList: result.ticketProductList,
      })
    }
    if (ticketProductType === TicketProductType.Prescription) {
      this.socketEmitService.socketTicketPrescriptionChange(oid, {
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

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    if (ticketProductDestroy.type === TicketProductType.Consumable) {
      this.socketEmitService.socketTicketConsumableChange(oid, {
        ticketId,
        ticketProductDestroyList: [ticketProductDestroy],
      })
    }
    if (ticketProductDestroy.type === TicketProductType.Prescription) {
      this.socketEmitService.socketTicketPrescriptionChange(oid, {
        ticketId,
        ticketProductDestroyList: [ticketProductDestroy],
      })
    }
    if (result.ticketUserDestroyList) {
      this.socketEmitService.socketTicketUserListChange(oid, {
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
      this.socketEmitService.socketTicketConsumableChange(oid, {
        ticketId,
        ticketProductReplaceList: ticketProductList,
      })
    }
    if (ticketProductType === TicketProductType.Prescription) {
      this.socketEmitService.socketTicketPrescriptionChange(oid, {
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
    })
    const { ticket, ticketProduct } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    if (ticketProduct.type === TicketProductType.Consumable) {
      this.socketEmitService.socketTicketConsumableChange(oid, {
        ticketId,
        ticketProductUpsertList: [ticketProduct],
      })
    }
    if (ticketProduct.type === TicketProductType.Prescription) {
      this.socketEmitService.socketTicketPrescriptionChange(oid, {
        ticketId,
        ticketProductUpsertList: [ticketProduct],
      })
    }
    if (body.ticketUserList) {
      this.apiTicketClinicUserService.changeTicketUserList({
        oid,
        ticketId,
        body: {
          positionType: PositionInteractType.Product,
          positionInteractId: ticketProduct.productId,
          ticketItemId: ticketProduct.id,
          quantity: ticketProduct.quantity,
          ticketUserList: body.ticketUserList,
        },
      })
    }
    return { data: true }
  }

  async sendProduct(params: {
    oid: number
    ticketId: number
    body: TicketSendProductListBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body } = params
    const time = Date.now()

    const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
    const sendProductResult = await this.ticketSendProductOperation.sendProduct({
      oid,
      ticketId,
      ticketProductIdList: body.ticketProductIdList,
      time,
      allowNegativeQuantity,
    })

    this.socketEmitService.socketTicketChange(oid, {
      type: 'UPDATE',
      ticket: sendProductResult.ticket,
    })

    if (sendProductResult.productModifiedList) {
      this.socketEmitService.productListChange(oid, {
        productUpsertedList: sendProductResult.productModifiedList,
      })
      this.socketEmitService.batchListChange(oid, {
        batchUpsertedList: sendProductResult.batchModifiedList,
      })
    }
    if (sendProductResult.ticketProductModifiedList) {
      this.socketEmitService.socketTicketConsumableChange(oid, {
        ticketId,
        ticketProductUpsertList: sendProductResult.ticketProductModifiedList.filter((i) => {
          return i.type === TicketProductType.Consumable
        }),
      })
      this.socketEmitService.socketTicketPrescriptionChange(oid, {
        ticketId,
        ticketProductUpsertList: sendProductResult.ticketProductModifiedList.filter((i) => {
          return i.type === TicketProductType.Prescription
        }),
      })
    }

    return { data: true }
  }

  async returnProduct(params: {
    oid: number
    ticketId: number
    body: TicketReturnProductListBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body } = params
    try {
      const returnProductResult = await this.ticketReturnProductOperation.returnProduct({
        oid,
        ticketId,
        time: Date.now(),
        returnList: body.returnList,
      })

      this.socketEmitService.productListChange(oid, {
        productUpsertedList: returnProductResult.productModifiedList || [],
      })
      this.socketEmitService.batchListChange(oid, {
        batchUpsertedList: returnProductResult.batchModifiedList || [],
      })

      this.socketEmitService.socketTicketChange(oid, {
        type: 'UPDATE',
        ticket: returnProductResult.ticket,
      })

      this.socketEmitService.socketTicketUserListChange(oid, {
        ticketId,
        ticketUserUpsertList: returnProductResult.ticketUserModifiedList || [],
      })

      const [ticketProductList] = await Promise.all([
        this.ticketProductRepository.findMany({
          condition: { oid, ticketId },
          sort: { id: 'ASC' },
        }),
      ])
      this.socketEmitService.socketTicketConsumableChange(oid, {
        ticketId,
        ticketProductReplaceList: ticketProductList.filter((i) => {
          return i.type === TicketProductType.Consumable
        }),
      })
      this.socketEmitService.socketTicketPrescriptionChange(oid, {
        ticketId,
        ticketProductReplaceList: ticketProductList.filter((i) => {
          return i.type === TicketProductType.Prescription
        }),
      })

      return { data: { ticket: returnProductResult.ticket } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
