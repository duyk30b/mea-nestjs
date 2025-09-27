import { Injectable } from '@nestjs/common'
import { TicketProductType } from '../../../../../_libs/database/entities/ticket-product.entity'
import {
  TicketDestroyTicketProductOperation,
  TicketUpdateTicketProductOperation,
} from '../../../../../_libs/database/operations'
import {
  TicketProductManager,
  TicketProductRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  TicketUpdatePriorityTicketProductBody,
  TicketUpdateTicketProductBody,
} from './request'

@Injectable()
export class TicketChangeProductService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketProductManager: TicketProductManager,
    private readonly ticketDestroyTicketProductOperation: TicketDestroyTicketProductOperation,
    private readonly ticketUpdateTicketProductOperation: TicketUpdateTicketProductOperation
  ) { }

  async destroyTicketProduct(options: {
    oid: number
    ticketId: string
    ticketProductId: string
    ticketProductType: TicketProductType
  }) {
    const { oid, ticketId, ticketProductId, ticketProductType } = options
    const result = await this.ticketDestroyTicketProductOperation.destroyTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      ticketProductType,
    })

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified: result.ticketModified,
      ticketProduct: { destroyedList: [result.ticketProductDestroy] },
      ticketUser: { destroyedList: result.ticketUserDestroyList },
    })

    return true
  }

  async updatePriorityTicketProduct(options: {
    oid: number
    ticketId: string
    ticketProductType: TicketProductType
    body: TicketUpdatePriorityTicketProductBody
  }) {
    const { oid, ticketId, body, ticketProductType } = options
    const ticketProductList = await this.ticketProductRepository.managerBulkUpdate({
      manager: this.ticketProductRepository.getManager(),
      condition: { oid, ticketId },
      update: ['priority'],
      compare: { id: { cast: 'bigint' } },
      tempList: body.ticketProductList,
      options: { requireEqualLength: true },
    })

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketProduct: { upsertedList: ticketProductList },
    })

    return true
  }

  async updateTicketProduct(options: {
    oid: number
    ticketId: string
    ticketProductId: string
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
      ticketUserRequestList: body.ticketUserRequestList,
    })

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified: result.ticketModified,
      ticketProduct: { upsertedList: [result.ticketProductModified] },
      ticketUser: {
        upsertedList: result.ticketUserCreatedList,
        destroyedList: result.ticketUserDestroyList,
      },
    })

    return true
  }
}
