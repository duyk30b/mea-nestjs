import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { CacheDataService } from '../../../../../_libs/common/cache-data/cache-data.service'
import { DeliveryStatus } from '../../../../../_libs/database/common/variable'
import TicketProduct from '../../../../../_libs/database/entities/ticket-product.entity'
import { TicketSurchargeInsertType } from '../../../../../_libs/database/entities/ticket-surcharge.entity'
import { TicketStatus } from '../../../../../_libs/database/entities/ticket.entity'
import {
  TicketChangeDiscountOperation,
  TicketChangeItemMoneyManager,
  TicketCloseOperation,
  TicketReopenOperation,
  TicketReturnProductOperation,
  TicketSendProductOperation,
  TicketTerminalOperation,
} from '../../../../../_libs/database/operations'
import {
  TicketRepository,
  TicketSurchargeRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  TicketChangeSurchargeListBody,
  TicketClinicChangeDiscountBody,
  TicketReturnProductListBody,
  TicketSendProductListBody,
  TicketTerminalBody,
} from './request'

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
    private ticketCloseOperation: TicketCloseOperation,
    private ticketTerminalOperation: TicketTerminalOperation,
    private ticketChangeDiscountOperation: TicketChangeDiscountOperation,
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

  async sendProduct(params: {
    oid: number
    ticketId: string
    body: TicketSendProductListBody
    options?: { noEmitTicket?: boolean }
  }) {
    const { oid, ticketId, body, options } = params
    const time = Date.now()

    const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
    const sendProductResult = await this.ticketSendProductOperation.sendProduct({
      oid,
      ticketId,
      sendType: { ticketProductIdList: body.ticketProductIdList },
      time,
      allowNegativeQuantity,
    })
    const { ticketModified, ticketProductModifiedAll } = sendProductResult
    if (!options?.noEmitTicket) {
      this.socketEmitService.socketTicketChange(oid, { ticketId, ticketModified })
    }
    if (sendProductResult.productModifiedList) {
      this.socketEmitService.productListChange(oid, {
        productUpsertedList: sendProductResult.productModifiedList,
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
    body: TicketReturnProductListBody
  }) {
    const { oid, ticketId, body } = params

    const returnProductResult = await this.ticketReturnProductOperation.returnProduct({
      oid,
      ticketId,
      time: Date.now(),
      returnType: body.returnList,
    })
    const ticketProductModifiedAll = returnProductResult.ticketProductModifiedAll

    this.socketEmitService.productListChange(oid, {
      productUpsertedList: returnProductResult.productModifiedList || [],
      batchUpsertedList: returnProductResult.batchModifiedList || [],
    })

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified: returnProductResult.ticket,
      ticketUser: { upsertedList: returnProductResult.ticketUserModifiedList || [] },
      ticketProduct: { upsertedList: ticketProductModifiedAll },
    })

    return {
      ticketModified: returnProductResult.ticket,
      ticketProductModifiedAll,
    }
  }

  async close(props: { oid: number; userId: number; ticketId: string }) {
    const { oid, userId, ticketId } = props
    const closeResult = await this.ticketCloseOperation.startClose({
      oid,
      ticketId,
      time: Date.now(),
      userId,
    })

    const { ticketModified, paymentCreated } = closeResult
    this.socketEmitService.socketTicketChange(oid, { ticketId, ticketModified })
    return { ticketModified, paymentCreated }
  }

  async reopen(params: { oid: number; userId: number; ticketId: string }) {
    const { oid, userId, ticketId } = params
    const reopenResult = await this.ticketReopenOperation.reopen({
      oid,
      ticketId,
    })

    const { ticketModified } = reopenResult
    this.socketEmitService.socketTicketChange(oid, { ticketId, ticketModified })
    return { ticketModified }
  }

  async terminate(options: {
    oid: number
    userId: number
    ticketId: string
    body: TicketTerminalBody
  }) {
    const { oid, userId, ticketId, body } = options
    const time = Date.now()

    const ticketOrigin = await this.ticketRepository.findOneBy({ oid, id: ticketId })

    let ticketProductModifiedAll: TicketProduct[]
    let ticketModified = ticketOrigin

    if ([TicketStatus.Debt, TicketStatus.Completed].includes(ticketOrigin.status)) {
      const reopenResult = await this.ticketReopenOperation.reopen({
        oid,
        ticketId,
      })
      ticketModified = reopenResult.ticketModified || ticketModified
    }
    if (ticketModified.deliveryStatus === DeliveryStatus.Delivered) {
      const returnProductResult = await this.ticketReturnProductOperation.returnProduct({
        oid,
        ticketId,
        time,
        returnType: 'ALL',
        options: { changePendingIfNoStock: true },
      })
      ticketProductModifiedAll = returnProductResult.ticketProductModifiedAll

      this.socketEmitService.productListChange(oid, {
        productUpsertedList: returnProductResult.productModifiedList || [],
        batchUpsertedList: returnProductResult.batchModifiedList || [],
      })

      ticketModified = returnProductResult.ticketModified
    }

    const terminalResult = await this.ticketTerminalOperation.startTerminal({
      oid,
      ticketId,
      userId,
      time,
      note: 'Hủy phiếu',
      walletId: body.walletId,
    })
    const customerModified = terminalResult.customerModified
    const paymentCreated = terminalResult.paymentCreated
    ticketModified = terminalResult.ticketModified || ticketModified

    this.socketEmitService.customerUpsert(oid, { customer: customerModified })

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified,
      ticketProduct: { upsertedList: ticketProductModifiedAll },
    })
    return { ticketModified, customerModified, paymentCreated, ticketProductModifiedAll }
  }
}
