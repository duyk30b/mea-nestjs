import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { CacheDataService } from '../../../../../_libs/common/cache-data/cache-data.service'
import { DeliveryStatus } from '../../../../../_libs/database/common/variable'
import { Customer, Payment } from '../../../../../_libs/database/entities'
import TicketProduct from '../../../../../_libs/database/entities/ticket-product.entity'
import { TicketSurchargeInsertType } from '../../../../../_libs/database/entities/ticket-surcharge.entity'
import { TicketStatus } from '../../../../../_libs/database/entities/ticket.entity'
import {
  CustomerRefundMoneyOperation,
  TicketChangeAllMoneyOperator,
  TicketChangeDiscountOperation,
  TicketChangeItemMoneyManager,
  TicketCloseOperation,
  TicketReopenOperation,
  TicketReturnProductOperation,
  TicketSendProductOperation,
} from '../../../../../_libs/database/operations'
import {
  TicketRepository,
  TicketSurchargeRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketClinicChangeDiscountBody, TicketReturnProductListBody } from './request'
import { TicketChangeAllMoneyBody } from './request/ticket-change-all-money.body'
import { TicketChangeSurchargeListBody } from './request/ticket-change-surcharge-list.body'

@Injectable()
export class TicketActionService {
  constructor(
    private socketEmitService: SocketEmitService,
    private cacheDataService: CacheDataService,
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketSurchargeRepository: TicketSurchargeRepository,
    private ticketReopenOperation: TicketReopenOperation,
    private ticketSendProductOperation: TicketSendProductOperation,
    private ticketReturnProductOperation: TicketReturnProductOperation,
    private ticketChangeAllMoneyOperator: TicketChangeAllMoneyOperator,
    private ticketCloseOperation: TicketCloseOperation,
    private ticketChangeDiscountOperation: TicketChangeDiscountOperation,
    private customerRefundMoneyOperation: CustomerRefundMoneyOperation,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async startExecuting(options: { oid: number; ticketId: string }) {
    const { oid, ticketId } = options
    const ticketModified = await this.ticketRepository.updateOneAndReturnEntity(
      {
        oid,
        id: ticketId,
        status: { IN: [TicketStatus.Schedule, TicketStatus.Draft, TicketStatus.Deposited] },
      },
      { status: TicketStatus.Executing, receptionAt: Date.now() }
    )
    this.socketEmitService.socketTicketChange(oid, { ticketId, ticketModified })
    return { ticketModified }
  }

  async changeDiscount(params: {
    oid: number
    ticketId: string
    body: TicketClinicChangeDiscountBody
  }) {
    const { oid, ticketId, body } = params
    const { ticketModified } = await this.ticketChangeDiscountOperation.changeDiscount({
      oid,
      ticketId,
      discountType: body.discountType,
      discountMoney: body.discountMoney,
      discountPercent: body.discountPercent,
    })
    this.socketEmitService.socketTicketChange(oid, { ticketId, ticketModified })

    return { ticketModified }
  }

  async changeSurchargeList(params: {
    oid: number
    ticketId: string
    body: TicketChangeSurchargeListBody
  }) {
    const { oid, ticketId, body } = params

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const ticketOrigin = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      const ticketSurchargeDestroy = await this.ticketSurchargeRepository.managerDelete(manager, {
        oid,
        ticketId,
      })
      const ticketSurchargeInsert = body.ticketSurchargeBodyList.map((i) => {
        const insert: TicketSurchargeInsertType = {
          oid,
          ticketId,
          surchargeId: i.surchargeId,
          money: i.money,
        }
        return insert
      })

      const ticketSurchargeCreated = await this.ticketSurchargeRepository.managerInsertMany(
        manager,
        ticketSurchargeInsert
      )

      const surchargeMoneyAdd =
        ticketSurchargeCreated.reduce((acc, item) => acc + item.money, 0)
        - ticketSurchargeDestroy.reduce((acc, item) => acc + item.money, 0)

      let ticketModified = ticketOrigin
      if (surchargeMoneyAdd) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: { surchargeMoneyAdd },
        })
      }
      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        ticketSurcharge: {
          destroyedList: ticketSurchargeDestroy,
          upsertedList: ticketSurchargeCreated,
        },
      })

      return { ticketModified }
    })

    return transaction
  }

  async changeAllMoney(params: { oid: number; ticketId: string; body: TicketChangeAllMoneyBody }) {
    const { oid, ticketId, body } = params
    const time = Date.now()

    const { ticketModified } = await this.ticketChangeAllMoneyOperator.changeItemMoney({
      oid,
      ticketUpdate: { id: ticketId },
      ticketProductUpdate: body.ticketProductList,
      ticketProcedureUpdate: body.ticketProcedureList,
      ticketLaboratoryUpdate: body.ticketLaboratoryList,
      ticketRadiologyUpdate: body.ticketRadiologyList,
    })

    // Còn tất cả các item khác cũng cần bắn, nhưng mệt, làm sau
    this.socketEmitService.socketTicketChange(oid, { ticketId, ticketModified })
    return { ticketModified }
  }

  async sendProduct(params: {
    oid: number
    ticketId: string
    sendAll: boolean
    ticketProductIdList: string[]
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
      this.socketEmitService.socketTicketChange(oid, { ticketId, ticketModified })
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
      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketProduct: { upsertedList: ticketProductModifiedAll },
      })
    }

    return {
      ticketModified,
      ticketProductModifiedAll: ticketProductModifiedAll as TicketProduct[] | undefined,
    }
  }

  async returnProduct(params: {
    oid: number
    ticketId: string
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
      ticketId,
      ticketModified: returnProductResult.ticket,
      ticketUser: { upsertedList: returnProductResult.ticketUserModifiedList || [] },
      ticketProduct: { upsertedList: ticketProductModifiedAll },
    })

    return { ticketModified: returnProductResult.ticket, ticketProductModifiedAll }
  }

  async close(params: {
    oid: number
    userId: number
    ticketId: string
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
      this.socketEmitService.socketTicketChange(oid, { ticketId, ticketModified })
    }
    if (customerModified && !options?.noEmitCustomer) {
      this.socketEmitService.customerUpsert(oid, { customer: customerModified })
    }
    if (closeResult.ticketUserDeletedList?.length || closeResult.ticketUserModifiedList?.length) {
      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketUser: {
          destroyedList: closeResult.ticketUserDeletedList,
          upsertedList: [...closeResult.ticketUserModifiedList],
        },
      })
    }
    return { ticketModified, customerModified, paymentCreatedList }
  }

  async reopen(params: { oid: number; userId: number; ticketId: string }) {
    const { oid, userId, ticketId } = params
    const reopenResult = await this.ticketReopenOperation.reopen({
      oid,
      userId,
      ticketId,
      time: Date.now(),
      note: '',
    })
    const { ticketModified, customerModified, paymentCreatedList } = reopenResult

    this.socketEmitService.socketTicketChange(oid, { ticketId, ticketModified })

    if (customerModified) {
      this.socketEmitService.customerUpsert(oid, { customer: customerModified })
    }
    return { ticketModified, customerModified, paymentCreatedList }
  }

  async terminate(options: { oid: number; userId: number; ticketId: string }) {
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

    this.socketEmitService.socketTicketChange(oid, { ticketId, ticketModified })
    return { ticketModified, customerModified, paymentCreatedList, ticketProductModifiedAll }
  }
}
