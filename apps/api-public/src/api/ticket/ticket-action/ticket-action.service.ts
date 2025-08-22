import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { DeliveryStatus } from '../../../../../_libs/database/common/variable'
import { Customer, Payment } from '../../../../../_libs/database/entities'
import TicketProduct, {
  TicketProductType,
} from '../../../../../_libs/database/entities/ticket-product.entity'
import { TicketRadiologyStatus } from '../../../../../_libs/database/entities/ticket-radiology.entity'
import { TicketStatus } from '../../../../../_libs/database/entities/ticket.entity'
import {
  CustomerRefundMoneyOperation,
  TicketChangeAllMoneyOperator,
  TicketChangeDiscountOperation,
  TicketCloseOperation,
  TicketReopenOperation,
  TicketReturnProductOperation,
  TicketSendProductOperation,
} from '../../../../../_libs/database/operations'
import { TicketRepository } from '../../../../../_libs/database/repositories'
import { ImageManagerService } from '../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketClinicChangeDiscountBody, TicketReturnProductListBody } from './request'
import { TicketChangeAllMoneyBody } from './request/ticket-change-all-money.body'

@Injectable()
export class TicketActionService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketReopenOperation: TicketReopenOperation,
    private readonly ticketSendProductOperation: TicketSendProductOperation,
    private readonly ticketReturnProductOperation: TicketReturnProductOperation,
    private readonly ticketChangeAllMoneyOperator: TicketChangeAllMoneyOperator,
    private readonly ticketCloseOperation: TicketCloseOperation,
    private readonly ticketChangeDiscountOperation: TicketChangeDiscountOperation,
    private readonly customerRefundMoneyOperation: CustomerRefundMoneyOperation
  ) { }

  async startExecuting(options: { oid: number; ticketId: number }) {
    const { oid, ticketId } = options
    const ticketModified = await this.ticketRepository.updateOneAndReturnEntity(
      {
        oid,
        id: ticketId,
        status: { IN: [TicketStatus.Schedule, TicketStatus.Draft, TicketStatus.Deposited] },
      },
      {
        status: TicketStatus.Executing,
        startedAt: Date.now(),
      }
    )
    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: ticketModified })
    return { ticketModified }
  }

  async changeDiscount(params: {
    oid: number
    ticketId: number
    body: TicketClinicChangeDiscountBody
  }) {
    const { oid, ticketId, body } = params
    const { ticket } = await this.ticketChangeDiscountOperation.changeDiscount({
      oid,
      ticketId,
      discountType: body.discountType,
      discountMoney: body.discountMoney,
      discountPercent: body.discountPercent,
    })
    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })

    return { ticket }
  }

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
    return { ticket }
  }

  async sendProduct(params: {
    oid: number
    ticketId: number
    sendAll: boolean
    ticketProductIdList: number[]
    options?: { noEmitTicket?: boolean }
  }) {
    const { oid, ticketId, sendAll, ticketProductIdList, options } = params
    const time = Date.now()

    const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
    const sendProductResult = await this.ticketSendProductOperation.sendProduct({
      oid,
      ticketId,
      ticketProductIdList,
      time,
      sendAll,
      allowNegativeQuantity,
    })
    const { ticketModified, ticketProductModifiedAll } = sendProductResult
    if (!options?.noEmitTicket) {
      this.socketEmitService.socketTicketListChange(oid, {
        ticketUpsertedList: [ticketModified],
      })
    }
    if (sendProductResult.productModifiedList) {
      this.socketEmitService.productListChange(oid, {
        productUpsertedList: sendProductResult.productModifiedList,
      })
      this.socketEmitService.batchListChange(oid, {
        batchUpsertedList: sendProductResult.batchModifiedList,
      })
    }
    if (ticketProductModifiedAll) {
      this.socketEmitService.socketTicketProductChange(oid, {
        ticketId,
        ticketProductUpsertList: ticketProductModifiedAll.filter((i) => {
          return i.type === TicketProductType.Product
        }),
      })
      this.socketEmitService.socketTicketConsumableChange(oid, {
        ticketId,
        ticketProductUpsertList: ticketProductModifiedAll.filter((i) => {
          return i.type === TicketProductType.Consumable
        }),
      })
      this.socketEmitService.socketTicketPrescriptionChange(oid, {
        ticketId,
        ticketProductUpsertList: ticketProductModifiedAll.filter((i) => {
          return i.type === TicketProductType.Prescription
        }),
      })
    }

    return {
      ticketModified,
      ticketProductModifiedAll: ticketProductModifiedAll as TicketProduct[] | undefined,
    }
  }

  async returnProduct(params: {
    oid: number
    ticketId: number
    returnList: TicketReturnProductListBody['returnList']
    returnAll: boolean
  }) {
    const { oid, ticketId, returnAll, returnList } = params

    const returnProductResult = await this.ticketReturnProductOperation.returnProduct({
      oid,
      ticketId,
      time: Date.now(),
      returnList,
      returnAll,
    })
    const ticketProductModifiedAll = returnProductResult.ticketProductModifiedAll

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
    this.socketEmitService.socketTicketProductChange(oid, {
      ticketId,
      ticketProductReplaceList: ticketProductModifiedAll.filter((i) => {
        return i.type === TicketProductType.Product
      }),
    })
    this.socketEmitService.socketTicketConsumableChange(oid, {
      ticketId,
      ticketProductReplaceList: ticketProductModifiedAll.filter((i) => {
        return i.type === TicketProductType.Consumable
      }),
    })
    this.socketEmitService.socketTicketPrescriptionChange(oid, {
      ticketId,
      ticketProductReplaceList: ticketProductModifiedAll.filter((i) => {
        return i.type === TicketProductType.Prescription
      }),
    })

    return { ticketModified: returnProductResult.ticket, ticketProductModifiedAll }
  }

  async close(params: {
    oid: number
    userId: number
    ticketId: number
    options?: { noEmitTicket?: boolean; noEmitCustomer?: boolean }
  }) {
    const { oid, userId, ticketId, options } = params
    const closeResult = await this.ticketCloseOperation.startClose({
      oid,
      ticketId,
      time: Date.now(),
      userId,
      note: '',
    })
    const { ticketModified, customerModified, paymentCreatedList } = closeResult

    if (!options?.noEmitTicket) {
      this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    }
    if (customerModified && !options?.noEmitCustomer) {
      this.socketEmitService.customerUpsert(oid, { customer: customerModified })
    }
    if (closeResult.ticketUserDeletedList?.length || closeResult.ticketUserModifiedList?.length) {
      this.socketEmitService.socketTicketUserListChange(oid, {
        ticketId,
        ticketUserDestroyList: closeResult.ticketUserDeletedList,
        ticketUserUpsertList: [...closeResult.ticketUserModifiedList],
      })
    }
    return { ticketModified, customerModified, paymentCreatedList }
  }

  async reopen(params: { oid: number; userId: number; ticketId: number }) {
    const { oid, userId, ticketId } = params
    const reopenResult = await this.ticketReopenOperation.reopen({
      oid,
      userId,
      ticketId,
      time: Date.now(),
      note: '',
    })
    const { ticketModified, customerModified, paymentCreatedList } = reopenResult

    this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })

    if (customerModified) {
      this.socketEmitService.customerUpsert(oid, { customer: customerModified })
    }
    return { ticketModified, customerModified, paymentCreatedList }
  }

  async terminate(options: { oid: number; userId: number; ticketId: number }) {
    const { oid, userId, ticketId } = options
    const time = Date.now()

    let ticketModified = await this.ticketRepository.findOneBy({ oid, id: ticketId })
    const paymentCreatedList: Payment[] = []
    let ticketProductModifiedAll: TicketProduct[]
    let customerModified: Customer
    if ([TicketStatus.Debt, TicketStatus.Completed].includes(ticketModified.status)) {
      const reopenResult = await this.ticketReopenOperation.reopen({
        oid,
        userId,
        ticketId,
        time,
        note: 'Hủy phiếu',
      })
      if (reopenResult.customerModified) {
        customerModified = reopenResult.customerModified
      }
      paymentCreatedList.push(...reopenResult.paymentCreatedList)
      ticketModified = reopenResult.ticketModified
    }

    if (ticketModified.paid > 0) {
      const refundOverpaidResult = await this.customerRefundMoneyOperation.startRefundMoney({
        oid,
        customerId: ticketModified.customerId,
        cashierId: userId,
        ticketId,
        refundAmount: ticketModified.paid,
        time,
        paymentMethodId: 0,
        note: 'Hủy phiếu',
      })
      customerModified = refundOverpaidResult.customer
      paymentCreatedList.push(refundOverpaidResult.paymentCreated)
      ticketModified = refundOverpaidResult.ticketModified
    }

    if (ticketModified.deliveryStatus === DeliveryStatus.Delivered) {
      const returnProductResult = await this.returnProduct({
        oid,
        ticketId,
        returnAll: true,
        returnList: [],
      })
      ticketModified = returnProductResult.ticketModified
      ticketProductModifiedAll = returnProductResult.ticketProductModifiedAll
    }

    ticketModified = await this.ticketRepository.updateOneAndReturnEntity(
      { oid, id: ticketId },
      {
        status: TicketStatus.Cancelled,
        discountMoney: ticketModified.discountMoney - ticketModified.discountMoney,
        discountPercent: 0,
        profit: 0,
        totalMoney: ticketModified.totalMoney + ticketModified.discountMoney, // bỏ hết khuyến mãi thôi
        debt: ticketModified.debt + ticketModified.discountMoney, // bỏ hết khuyến mãi thôi
      }
    )

    if (customerModified) {
      this.socketEmitService.customerUpsert(oid, { customer: customerModified })
    }
    return { ticketModified, customerModified, paymentCreatedList, ticketProductModifiedAll }
  }

  async destroy(params: { oid: number; ticketId: number }) {
    const { oid, ticketId } = params
    const ticket = await this.ticketRepository.findOne({
      relationLoadStrategy: 'query',
      relation: { ticketProductList: {}, ticketRadiologyList: {} },
      condition: {
        id: ticketId,
        oid,
        // status: { IN: [TicketStatus.Draft, TicketStatus.Schedule, TicketStatus.Cancelled] },
      },
    })

    if (!ticket) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (ticket.paid) {
      throw new BusinessError('Không thể hủy phiếu đã thanh toán, cần hoàn trả thanh toán trước')
    }

    if (ticket.ticketProductList.find((i) => i.deliveryStatus === DeliveryStatus.Delivered)) {
      throw new BusinessError('Không thể hủy phiếu đã gửi hàng, cần hoàn trả hàng trước khi hủy')
    }

    if (ticket.ticketRadiologyList.find((i) => i.status === TicketRadiologyStatus.Completed)) {
      throw new BusinessError('Không thể hủy phiếu CĐHA đã có kết quả, cần hủy kết quả trước')
    }

    await this.imageManagerService.removeImageList({
      oid,
      idRemoveList: JSON.parse(ticket.imageIds || '[]'),
    })
    await this.ticketRepository.update({ oid, id: ticketId }, { status: TicketStatus.Cancelled })
    await this.ticketRepository.destroy({ oid, ticketId })
    this.socketEmitService.socketTicketChange(oid, { type: 'DESTROY', ticket })
    return { ticketId }
  }
}
