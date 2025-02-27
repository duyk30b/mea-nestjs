import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../../_libs/common/cache-data/cache-data.service'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { InteractType } from '../../../../../_libs/database/entities/commission.entity'
import { TicketProductType } from '../../../../../_libs/database/entities/ticket-product.entity'
import {
  TicketClinicAddTicketProductOperation,
  TicketClinicDestroyTicketProductOperation,
  TicketClinicReturnProductOperation,
  TicketClinicUpdateTicketProductListOperation,
  TicketClinicUpdateTicketProductOperation,
  TicketSendProductOperation,
} from '../../../../../_libs/database/operations'
import { TicketProductRepository } from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  TicketClinicAddTicketProductListBody,
  TicketClinicReturnProductListBody,
  TicketClinicUpdatePriorityTicketProductBody,
  TicketClinicUpdateTicketProductBody,
  TicketClinicUpdateTicketProductListBody,
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
    private readonly ticketClinicUpdateTicketProductListOperation: TicketClinicUpdateTicketProductListOperation,

    private readonly ticketSendProductOperation: TicketSendProductOperation,
    private readonly ticketClinicReturnProductOperation: TicketClinicReturnProductOperation
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
      this.socketEmitService.ticketClinicChangeTicketProductConsumableList(oid, {
        ticketId,
        ticketProductInsertList: result.ticketProductList,
      })
    }
    if (ticketProductType === TicketProductType.Prescription) {
      this.socketEmitService.ticketClinicChangeTicketProductPrescriptionList(oid, {
        ticketId,
        ticketProductInsertList: result.ticketProductList,
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
      this.socketEmitService.ticketClinicChangeTicketProductConsumableList(oid, {
        ticketId,
        ticketProductDestroy,
      })
    }
    if (ticketProductDestroy.type === TicketProductType.Prescription) {
      this.socketEmitService.ticketClinicChangeTicketProductPrescriptionList(oid, {
        ticketId,
        ticketProductDestroy,
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
      this.socketEmitService.ticketClinicChangeTicketProductConsumableList(oid, {
        ticketId,
        replace: {
          ticketProductList,
        },
      })
    }
    if (ticketProductType === TicketProductType.Prescription) {
      this.socketEmitService.ticketClinicChangeTicketProductPrescriptionList(oid, {
        ticketId,
        replace: {
          ticketProductList,
        },
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
      this.socketEmitService.ticketClinicChangeTicketProductConsumableList(oid, {
        ticketId,
        ticketProductUpdate: result.ticketProduct,
      })
    }
    if (result.ticketProduct.type === TicketProductType.Prescription) {
      this.socketEmitService.ticketClinicChangeTicketProductPrescriptionList(oid, {
        ticketId,
        ticketProductUpdate: result.ticketProduct,
      })
    }
    if (result.ticketUserChangeList) {
      this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
        ticketId,
        ticketUserDestroyList: result.ticketUserChangeList.ticketUserDestroyList,
        ticketUserInsertList: result.ticketUserChangeList.ticketUserInsertList,
      })
    }
    return { data: true }
  }

  async updateTicketProductList(options: {
    oid: number
    ticketId: number
    ticketProductType: TicketProductType
    body: TicketClinicUpdateTicketProductListBody
  }) {
    const { oid, ticketId, ticketProductType, body } = options
    const result = await this.ticketClinicUpdateTicketProductListOperation.updateTicketProductList({
      oid,
      ticketId,
      ticketProductDtoList: body.ticketProductList,
    })

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket: result.ticket })
    if (ticketProductType === TicketProductType.Consumable) {
      this.socketEmitService.ticketClinicChangeTicketProductConsumableList(oid, {
        ticketId,
        ticketProductUpdateList: result.ticketProductUpdateList,
      })
    }
    if (ticketProductType === TicketProductType.Prescription) {
      this.socketEmitService.ticketClinicChangeTicketProductPrescriptionList(oid, {
        ticketId,
        ticketProductUpdateList: result.ticketProductUpdateList,
      })
    }

    this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
      ticketId,
      replace: {
        interactType: InteractType.Product,
        ticketItemId: 0, // thay thế toàn bộ interactType
        ticketUserList: result.ticketUserList.filter((i) => {
          return i.interactType === InteractType.Product
        }),
      },
    })

    return { data: true }
  }

  async sendProduct(params: { oid: number; ticketId: number }): Promise<BaseResponse> {
    const { oid, ticketId } = params
    const time = Date.now()
    try {
      const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
      const { productList, batchList, ticket } = await this.ticketSendProductOperation.sendProduct({
        oid,
        ticketId,
        time,
        allowNegativeQuantity,
      })
      this.socketEmitService.batchListUpdate(oid, { batchList })
      this.socketEmitService.productListUpdate(oid, { productList })
      this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })

      const ticketProductList = await this.ticketProductRepository.findMany({
        // relation: { product: true, batch: true },
        condition: { oid, ticketId },
        sort: { id: 'ASC' },
      })
      this.socketEmitService.ticketClinicChangeTicketProductConsumableList(oid, {
        ticketId,
        replace: {
          ticketProductList: ticketProductList.filter((i) => {
            return i.type === TicketProductType.Consumable
          }),
        },
      })
      this.socketEmitService.ticketClinicChangeTicketProductPrescriptionList(oid, {
        ticketId,
        replace: {
          ticketProductList: ticketProductList.filter((i) => {
            return i.type === TicketProductType.Prescription
          }),
        },
      })

      return { data: { ticket } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async returnProduct(params: {
    oid: number
    ticketId: number
    body: TicketClinicReturnProductListBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body } = params
    try {
      const { ticket, productList, batchList, ticketUserList } =
        await this.ticketClinicReturnProductOperation.startReturnProduct({
          oid,
          ticketId,
          time: Date.now(),
          returnList: body.returnList,
        })

      this.socketEmitService.batchListUpdate(oid, { batchList })
      this.socketEmitService.productListUpdate(oid, { productList })
      this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })

      const ticketProductList = await this.ticketProductRepository.findMany({
        // relation: { product: true, batch: true },
        condition: { oid, ticketId },
        sort: { id: 'ASC' },
      })
      this.socketEmitService.ticketClinicChangeTicketProductConsumableList(oid, {
        ticketId,
        replace: {
          ticketProductList: ticketProductList.filter((i) => {
            return i.type === TicketProductType.Consumable
          }),
        },
      })
      this.socketEmitService.ticketClinicChangeTicketProductPrescriptionList(oid, {
        ticketId,
        replace: {
          ticketProductList: ticketProductList.filter((i) => {
            return i.type === TicketProductType.Prescription
          }),
        },
      })
      this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
        ticketId,
        replaceAll: {
          ticketUserList,
        },
      })

      return { data: { ticket } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
