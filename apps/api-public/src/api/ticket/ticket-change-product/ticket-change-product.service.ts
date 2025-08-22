import { Injectable } from '@nestjs/common'
import { PositionInteractType } from '../../../../../_libs/database/entities/position.entity'
import { TicketProductType } from '../../../../../_libs/database/entities/ticket-product.entity'
import {
  TicketAddTicketProductOperation,
  TicketDestroyTicketProductOperation,
  TicketUpdateTicketProductOperation,
} from '../../../../../_libs/database/operations'
import {
  TicketProductManager,
  TicketProductRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketChangeUserService } from '../ticket-change-user/ticket-change-user.service'
import {
  TicketAddTicketProductListBody,
  TicketUpdatePriorityTicketProductBody,
  TicketUpdateTicketProductBody,
} from './request'

@Injectable()
export class TicketChangeProductService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketProductManager: TicketProductManager,
    private readonly ticketAddTicketProductOperation: TicketAddTicketProductOperation,
    private readonly ticketDestroyTicketProductOperation: TicketDestroyTicketProductOperation,
    private readonly ticketUpdateTicketProductOperation: TicketUpdateTicketProductOperation,

    private readonly ticketChangeUserService: TicketChangeUserService
  ) { }

  async addTicketProductList(options: {
    oid: number
    ticketId: number
    ticketProductType: TicketProductType
    body: TicketAddTicketProductListBody
  }) {
    const { oid, ticketId, ticketProductType, body } = options
    const result = await this.ticketAddTicketProductOperation.addTicketProductList({
      oid,
      ticketId,
      ticketProductType,
      ticketProductDtoList: body.ticketProductList,
    })

    const { ticket } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    if (ticketProductType === TicketProductType.Product) {
      this.socketEmitService.socketTicketProductChange(oid, {
        ticketId,
        ticketProductUpsertList: result.ticketProductList,
      })
    }
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

    return true
  }

  async destroyTicketProduct(options: {
    oid: number
    ticketId: number
    ticketProductId: number
    ticketProductType: TicketProductType
  }) {
    const { oid, ticketId, ticketProductId, ticketProductType } = options
    const result = await this.ticketDestroyTicketProductOperation.destroyTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      ticketProductType,
    })

    const { ticket, ticketProductDestroy } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    if (ticketProductDestroy.type === TicketProductType.Product) {
      this.socketEmitService.socketTicketProductChange(oid, {
        ticketId,
        ticketProductDestroyList: [ticketProductDestroy],
      })
    }
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

    return true
  }

  async updatePriorityTicketProduct(options: {
    oid: number
    ticketId: number
    ticketProductType: TicketProductType
    body: TicketUpdatePriorityTicketProductBody
  }) {
    const { oid, ticketId, body, ticketProductType } = options
    const ticketProductList = await this.ticketProductManager.bulkUpdate({
      manager: this.ticketProductRepository.getManager(),
      condition: { oid, ticketId },
      update: ['priority'],
      compare: ['id'],
      tempList: body.ticketProductList,
      options: { requireEqualLength: true },
    })

    ticketProductList.sort((a, b) => (a.priority < b.priority ? -1 : 1))

    if (ticketProductType === TicketProductType.Product) {
      this.socketEmitService.socketTicketProductChange(oid, {
        ticketId,
        ticketProductReplaceList: ticketProductList,
      })
    }
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

    return true
  }

  async updateTicketProduct(options: {
    oid: number
    ticketId: number
    ticketProductId: number
    ticketProductType: TicketProductType
    body: TicketUpdateTicketProductBody
  }) {
    const { oid, ticketId, ticketProductId, ticketProductType, body } = options
    const result = await this.ticketUpdateTicketProductOperation.updateTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      ticketProductType,
      ticketProductUpdateDto: body.ticketProduct,
    })
    const { ticket, ticketProduct } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    if (ticketProduct.type === TicketProductType.Product) {
      this.socketEmitService.socketTicketProductChange(oid, {
        ticketId,
        ticketProductUpsertList: [ticketProduct],
      })
    }
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
      this.ticketChangeUserService.updateTicketUserPositionList({
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
    return true
  }
}
