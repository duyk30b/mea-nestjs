import { CacheDataService } from '@libs/common/cache-data/cache-data.service'
import { TicketActionType } from '@libs/database/common/variable'
import { Customer, PaymentTicket } from '@libs/database/entities'
import { PaymentActionType } from '@libs/database/entities/payment.entity'
import TicketProduct from '@libs/database/entities/ticket-product.entity'
import { TicketSurchargeInsertType } from '@libs/database/entities/ticket-surcharge.entity'
import { TicketStatus } from '@libs/database/entities/ticket.entity'
import {
  ReturnBatchExecuteType,
  ShipProductExecuteType,
  TicketChangeDebtOperation,
  TicketChangeDiscountOperation,
  TicketChangeItemMoneyManager,
  TicketOpenCloseOperation,
  TicketPaymentMoneyOperation,
  TicketReturnProductOperation,
  TicketShipProductOperation,
} from '@libs/database/operations'
import { TicketRepository, TicketSurchargeRepository } from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketChangeSurchargeListBody, TicketClinicChangeDiscountBody } from './request'

@Injectable()
export class TicketActionService {
  constructor(
    private socketEmitService: SocketEmitService,
    private cacheDataService: CacheDataService,
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketSurchargeRepository: TicketSurchargeRepository,
    private ticketShipProductOperation: TicketShipProductOperation,
    private ticketReturnProductOperation: TicketReturnProductOperation,
    private ticketOpenCloseOperation: TicketOpenCloseOperation,
    private ticketChangeDiscountOperation: TicketChangeDiscountOperation,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketPaymentMoneyOperation: TicketPaymentMoneyOperation,
    private ticketChangeDebtOperation: TicketChangeDebtOperation
  ) {}

  async startExecuting(options: { oid: number; ticketId: string }) {
    const { oid, ticketId } = options
    const ticketModified = await this.ticketRepository.updateOne(
      {
        oid,
        id: ticketId,
        status: { IN: [TicketStatus.Draft, TicketStatus.Schedule] },
      },
      { status: TicketStatus.Executing, receptionAt: Date.now() }
    )
    this.socketEmitService.socketTicketChange(oid, { ticketId, ticketModified })
    return { ticketModified }
  }

  async changeDiscount(props: {
    oid: number
    ticketId: string
    body: TicketClinicChangeDiscountBody
  }) {
    const { oid, ticketId, body } = props
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

  async changeSurchargeList(props: {
    oid: number
    ticketId: string
    body: TicketChangeSurchargeListBody
  }) {
    const { oid, ticketId, body } = props

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

  async shipProduct(
    props: {
      oid: number
      ticketId: string
      options?: { noEmitTicket?: boolean }
    } & (
      | { shipType: 'ALL' }
      | {
          shipType: 'PARTIAL'
          shipList: ShipProductExecuteType[]
        }
    )
  ) {
    const { oid, ticketId, options } = props
    const time = Date.now()

    const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
    const sendProductResult = await this.ticketShipProductOperation.startShip({
      oid,
      ticketId,
      shipType: props.shipType,
      shipList: 'shipList' in props ? props.shipList : undefined,
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
      ticketProductModifiedAll,
    }
  }

  async returnProduct(
    props: {
      oid: number
      ticketId: string
      options?: { changePendingIfNoStock?: boolean }
    } & (
      | { returnType: 'ALL' }
      | {
          returnType: 'PARTIAL'
          returnList: ReturnBatchExecuteType[]
        }
    )
  ) {
    const { oid, ticketId } = props

    const returnProductResult = await this.ticketReturnProductOperation.returnProduct({
      oid,
      ticketId,
      time: Date.now(),
      returnType: props.returnType,
      returnList: 'returnList' in props ? props.returnList : undefined,
      options: props.options,
    })
    const ticketProductModifiedAll = returnProductResult.ticketProductModifiedAll

    this.socketEmitService.productListChange(oid, {
      productUpsertedList: returnProductResult.productModifiedList || [],
      batchUpsertedList: returnProductResult.batchModifiedList || [],
    })

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified: returnProductResult.ticketModified,
      ticketUser: { upsertedList: returnProductResult.ticketUserModifiedList || [] },
      ticketProduct: { upsertedList: ticketProductModifiedAll },
    })

    return {
      ticketModified: returnProductResult.ticketModified,
      ticketProductModifiedAll,
    }
  }

  async close(props: { oid: number; userId: number; ticketId: string }) {
    const { oid, userId, ticketId } = props
    const ticketOrigin = await this.ticketRepository.findOneBy({ oid, id: ticketId })
    if ([TicketStatus.Completed, TicketStatus.Debt].includes(ticketOrigin.status)) {
      throw new Error('Ticket is not in a state that can be closed')
    }

    const debtFix = ticketOrigin.totalMoney - ticketOrigin.paidTotal - ticketOrigin.debtTotal
    const paymentTicketCreatedList: PaymentTicket[] = []
    let customerModified: Customer = null

    if (debtFix !== 0) {
      const changeDebtResult = await this.ticketChangeDebtOperation.startChangeDebt({
        oid,
        customerId: ticketOrigin.customerId,
        cashierId: userId,
        walletId: '0',
        time: Date.now(),
        note: '',
        paymentActionType: debtFix > 0 ? PaymentActionType.Debit : PaymentActionType.RefundDebt,
        changeDebtList: [
          { ticketId, ticketActionType: TicketActionType.Close, paid: 0, debt: debtFix },
        ],
      })
      paymentTicketCreatedList.push(changeDebtResult.paymentTicketCreatedList[0])
      customerModified = changeDebtResult.customerModified
    }

    const closeResult = await this.ticketOpenCloseOperation.startClose({
      oid,
      ticketId,
      time: Date.now(),
      userId,
    })

    const { ticketModified } = closeResult

    if (customerModified) {
      ticketModified.customer = customerModified
      this.socketEmitService.customerUpsert(oid, { customer: customerModified })
    }
    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified,
      paymentTicketCreatedList,
    })
    return { ticketModified }
  }

  async reopen(props: { oid: number; ticketId: string }) {
    const { oid, ticketId } = props

    const reopenResult = await this.ticketOpenCloseOperation.reopen({
      oid,
      ticketId,
    })

    const { ticketModified } = reopenResult
    this.socketEmitService.socketTicketChange(oid, { ticketId, ticketModified })
    return { ticketModified }
  }
}
