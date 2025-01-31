/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { InteractType } from '../../../../../_libs/database/entities/commission.entity'
import { TicketProductType } from '../../../../../_libs/database/entities/ticket-product.entity'
import {
  TicketClinicAddTicketProductOperation,
  TicketClinicDestroyTicketProductOperation,
  TicketClinicUpdateTicketProductListOperation,
  TicketClinicUpdateTicketProductOperation,
} from '../../../../../_libs/database/operations'
import { TicketProductRepository } from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  TicketClinicAddTicketProductListBody,
  TicketClinicUpdateTicketProductBody,
  TicketClinicUpdateTicketProductListBody,
} from './request'

@Injectable()
export class ApiTicketClinicProductService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketClinicAddTicketProductOperation: TicketClinicAddTicketProductOperation,
    private readonly ticketClinicDestroyTicketProductOperation: TicketClinicDestroyTicketProductOperation,
    private readonly ticketClinicUpdateTicketProductOperation: TicketClinicUpdateTicketProductOperation,
    private readonly ticketClinicUpdateTicketProductListOperation: TicketClinicUpdateTicketProductListOperation
  ) { }

  async addTicketProductList(options: {
    oid: number
    ticketId: number
    ticketProductType: TicketProductType
    body: TicketClinicAddTicketProductListBody
  }) {
    const { oid, ticketId, ticketProductType, body } = options
    const result = await this.ticketClinicAddTicketProductOperation.addTicketProduct({
      oid,
      ticketId,
      ticketProductType,
      ticketProductDtoList: body.ticketProductList,
    })

    const { ticket } = result

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.ticketClinicChangeTicketProductList(oid, {
      ticketId,
      ticketProductType,
      ticketProductInsertList: result.ticketProductList,
    })

    return { data: true }
  }

  async destroyTicketProduct(options: { oid: number; ticketId: number; ticketProductId: number }) {
    const { oid, ticketId, ticketProductId } = options
    const result = await this.ticketClinicDestroyTicketProductOperation.destroyTicketProduct({
      oid,
      ticketId,
      ticketProductId,
    })

    const { ticket, ticketProductDestroy } = result

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.ticketClinicChangeTicketProductList(oid, {
      ticketId,
      ticketProductType: ticketProductDestroy.type,
      ticketProductDestroy,
    })
    if (result.ticketUserDestroyList) {
      this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
        ticketId,
        ticketUserDestroyList: result.ticketUserDestroyList,
      })
    }

    return { data: true }
  }

  async updateTicketProduct(options: {
    oid: number
    ticketId: number
    ticketProductId: number
    body: TicketClinicUpdateTicketProductBody
  }) {
    const { oid, ticketId, ticketProductId, body } = options
    const result = await this.ticketClinicUpdateTicketProductOperation.updateTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      ticketProductUpdateDto: body.ticketProduct,
      ticketUserDto: body.ticketUserList,
    })

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket: result.ticket })
    this.socketEmitService.ticketClinicChangeTicketProductList(oid, {
      ticketId,
      ticketProductType: result.ticketProduct.type,
      ticketProductUpdate: result.ticketProduct,
    })
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
    const ticketProductList = result.ticketProductList.filter((i) => {
      return i.type === ticketProductType
    })
    ticketProductList.sort((a, b) => (a.priority < b.priority ? -1 : 1))
    this.socketEmitService.ticketClinicChangeTicketProductList(oid, {
      ticketId,
      ticketProductType,
      ticketProductList,
    })

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
}
