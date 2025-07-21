import { Injectable } from '@nestjs/common'
import { PositionInteractType } from '../../../../../_libs/database/entities/position.entity'
import { TicketProductType } from '../../../../../_libs/database/entities/ticket-product.entity'
import {
  TicketClinicAddTicketProductOperation,
  TicketClinicDestroyTicketProductOperation,
  TicketClinicUpdateTicketProductOperation,
} from '../../../../../_libs/database/operations'
import { TicketProductRepository } from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
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
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketClinicAddTicketProductOperation: TicketClinicAddTicketProductOperation,
    private readonly ticketClinicDestroyTicketProductOperation: TicketClinicDestroyTicketProductOperation,
    private readonly ticketClinicUpdateTicketProductOperation: TicketClinicUpdateTicketProductOperation,

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
}
