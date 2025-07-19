import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../../_libs/common/cache-data/cache-data.service'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { DeliveryStatus } from '../../../../../_libs/database/common/variable'
import { TicketProductType } from '../../../../../_libs/database/entities/ticket-product.entity'
import { TicketRadiologyStatus } from '../../../../../_libs/database/entities/ticket-radiology.entity'
import { TicketStatus } from '../../../../../_libs/database/entities/ticket.entity'
import {
  TicketChangeAllMoneyOperator,
  TicketPaymentAndCloseOperation,
  TicketReopenOperation,
  TicketReturnProductOperation,
  TicketSendProductOperation,
} from '../../../../../_libs/database/operations'
import {
  TicketProductRepository,
  TicketRepository,
} from '../../../../../_libs/database/repositories'
import { ImageManagerService } from '../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketReturnProductListBody, TicketSendProductListBody } from '../request'
import { TicketChangeAllMoneyBody } from '../request/ticket-change-all-money.body'

@Injectable()
export class TicketActionService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketPaymentAndCloseOperation: TicketPaymentAndCloseOperation,
    private readonly ticketReopenOperation: TicketReopenOperation,

    private readonly cacheDataService: CacheDataService,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketSendProductOperation: TicketSendProductOperation,
    private readonly ticketReturnProductOperation: TicketReturnProductOperation,
    private readonly ticketChangeAllMoneyOperator: TicketChangeAllMoneyOperator
  ) { }

  async changeAllMoney(params: { oid: number; ticketId: number; body: TicketChangeAllMoneyBody }) {
    const { oid, ticketId, body } = params
    const time = Date.now()

    const { ticket } = await this.ticketChangeAllMoneyOperator.changeItemMoney({
      oid,
      ticketUpdate: { id: ticketId },
      ticketProductUpdate: body.ticketProductList,
      ticketProcedureUpdate: body.ticketProcedureList,
      ticketLaboratoryUpdate: body.ticketLaboratoryList,
      ticketRadiologyUpdate: body.ticketRadiologyList,
    })

    // Còn tất cả các item khác cũng cần bắn, nhưng mệt, làm sau
    this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticket] })
    return { data: { ticket } }
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

  async close(params: { oid: number; userId: number; ticketId: number }) {
    const { oid, userId, ticketId } = params
    try {
      const closeResult = await this.ticketPaymentAndCloseOperation.paymentAndClose({
        oid,
        cashierId: userId,
        ticketId,
        time: Date.now(),
        money: 0,
        paymentMethodId: 0,
        note: '',
      })

      this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: closeResult.ticket })
      if (closeResult.customer) {
        this.socketEmitService.customerUpsert(oid, { customer: closeResult.customer })
      }
      if (closeResult.ticketUserDeletedList || closeResult.ticketUserModifiedList) {
        this.socketEmitService.socketTicketUserListChange(oid, {
          ticketId,
          ticketUserDestroyList: closeResult.ticketUserDeletedList,
          ticketUserUpsertList: [...closeResult.ticketUserModifiedList],
        })
      }
      return { data: { ticket: closeResult.ticket } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async reopen(params: { oid: number; userId: number; ticketId: number }) {
    const { oid, userId, ticketId } = params
    try {
      const reopenResult = await this.ticketReopenOperation.reopen({
        oid,
        cashierId: userId,
        ticketId,
        time: Date.now(),
        description: '',
        paymentMethodId: 0,
        note: '',
        newPaid: null,
      })

      this.socketEmitService.socketTicketChange(oid, {
        type: 'UPDATE',
        ticket: reopenResult.ticket,
      })
      if (reopenResult.customer) {
        this.socketEmitService.customerUpsert(oid, { customer: reopenResult.customer })
      }
      return { data: { ticket: reopenResult.ticket } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async destroy(params: { oid: number; ticketId: number }): Promise<BaseResponse> {
    const { oid, ticketId } = params
    const ticket = await this.ticketRepository.findOne({
      condition: {
        id: ticketId,
        oid,
        // status: { IN: [TicketStatus.Draft, TicketStatus.Schedule, TicketStatus.Cancelled] },
      },
      relation: { ticketProductList: {}, ticketRadiologyList: {} },
    })

    if (ticket.paid) {
      throw new BusinessError('Không thể hủy phiếu đã thanh toán, cần hoàn trả thanh toán trước')
    }

    if (ticket.ticketProductList.find((i) => i.deliveryStatus === DeliveryStatus.Delivered)) {
      throw new BusinessError('Không thể hủy phiếu đã gửi hàng, cần hoàn trả hàng trước khi hủy')
    }

    if (ticket.ticketRadiologyList.find((i) => i.status === TicketRadiologyStatus.Completed)) {
      throw new BusinessError('Không thể hủy phiếu CĐHA đã có kết quả, cần hủy kết quả trước')
    }

    await this.imageManagerService.changeImageList({
      oid,
      customerId: ticket.customerId,
      files: [],
      filesPosition: [],
      imageIdsKeep: [],
      imageIdsOld: JSON.parse(ticket.imageIds || '[]'),
    })
    await this.ticketRepository.update({ oid, id: ticketId }, { status: TicketStatus.Cancelled })
    await this.ticketRepository.destroy({ oid, ticketId })
    this.socketEmitService.socketTicketChange(oid, { type: 'DESTROY', ticket })
    return { data: { ticketId } }
  }
}
