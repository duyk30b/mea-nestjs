import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../../../../_libs/common/helpers'
import { PaymentMoneyStatus } from '../../../../../../_libs/database/common/variable'
import { TicketLaboratoryGroup } from '../../../../../../_libs/database/entities'
import { PaymentTicketItemInsertType } from '../../../../../../_libs/database/entities/payment-ticket-item.entity'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../../../../../_libs/database/entities/payment.entity'
import { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import {
  CustomerRepository,
  PaymentRepository,
  PaymentTicketItemRepository,
  TicketLaboratoryGroupRepository,
  TicketLaboratoryRepository,
  TicketProcedureRepository,
  TicketProductRepository,
  TicketRadiologyRepository,
  TicketRegimenItemRepository,
  TicketRegimenRepository,
  TicketRepository,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { CustomerRefundTicketItemListBody } from '../request'

@Injectable()
export class TicketRefundTicketItemListService {
  constructor(
    private socketEmitService: SocketEmitService,
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private customerRepository: CustomerRepository,
    private paymentRepository: PaymentRepository,
    private paymentTicketItemRepository: PaymentTicketItemRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketRegimenItemRepository: TicketRegimenItemRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketLaboratoryRepository: TicketLaboratoryRepository,
    private ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private ticketRadiologyRepository: TicketRadiologyRepository
  ) { }

  async startRefund(data: {
    oid: number
    userId: number
    ticketId: string
    body: CustomerRefundTicketItemListBody
  }) {
    const { oid, ticketId, userId, body } = data
    const {
      customerId,
      paymentMethodId,
      refundAmount,
      note,
      ticketRegimenBodyList,
      ticketProcedureBodyList,
      ticketProductConsumableBodyList,
      ticketProductPrescriptionBodyList,
      ticketLaboratoryBodyList,
      ticketRadiologyBodyList,
    } = body

    const time = Date.now()

    const ticketItemList = [
      ...ticketRegimenBodyList,
      ...ticketProcedureBodyList,
      ...ticketProductConsumableBodyList,
      ...ticketProductPrescriptionBodyList,
      ...ticketLaboratoryBodyList,
      ...ticketRadiologyBodyList,
    ]

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET ===
      const ticketModified = await this.ticketRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: ticketId,
          customerId,
          status: { IN: [TicketStatus.Deposited, TicketStatus.Executing] },
          paid: { GTE: refundAmount },
          isPaymentEachItem: 1,
        },
        {
          paid: () => `paid - ${refundAmount}`,
          debt: () => `debt + ${refundAmount}`,
        }
      )

      const customer = await this.customerRepository.managerFindOneBy(manager, {
        oid,
        id: customerId,
      })
      if (!customer) {
        throw new Error(`Khách hàng không tồn tại trên hệ thống`)
      }

      const customerCloseDebt = customer.debt
      const customerOpenDebt = customer.debt

      const paymentInsert: PaymentInsertType = {
        oid,
        voucherType: PaymentVoucherType.Ticket,
        voucherId: ticketModified.id,
        personType: PaymentPersonType.Customer,
        personId: customerId,

        createdAt: time,
        paymentMethodId,
        cashierId: userId,
        moneyDirection: MoneyDirection.Out,
        paymentActionType: PaymentActionType.RefundForTicketItemList,
        note: note || '',

        paidAmount: refundAmount,
        debtAmount: 0,
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
      }
      const paymentCreated = await this.paymentRepository.managerInsertOne(manager, paymentInsert)

      const paymentTicketItemInsertList = ticketItemList.map((i) => {
        const inserter: PaymentTicketItemInsertType = {
          oid,
          paymentId: paymentCreated.id,

          ticketId: ticketModified.id,
          ticketItemType: i.ticketItemType,
          ticketItemId: i.ticketItemId,
          interactId: i.interactId,

          expectedPrice: i.expectedPrice,
          discountMoney: i.discountMoney,
          discountPercent: i.discountPercent,
          discountType: i.discountType,
          actualPrice: i.actualPrice,
          quantity: i.quantity,

          sessionIndex: i.sessionIndex,
        }
        return inserter
      })
      const paymentTicketItemCreatedList = await this.paymentTicketItemRepository.managerInsertMany(
        manager,
        paymentTicketItemInsertList
      )

      // Cập nhật thanh toán vào item
      const ticketRegimenWalletModifiedList = await this.ticketRegimenRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId },
        compare: { id: { cast: 'bigint' } },
        tempList: ticketRegimenBodyList.map((i) => ({
          ...i,
          id: i.ticketItemId,
          moneyAmountWallet: i.actualPrice,
        })),
        update: {
          moneyAmountWallet: (t: string, u: string) => {
            return `"${u}"."moneyAmountWallet" - "${t}"."moneyAmountWallet"`
          },
        },
        options: { requireEqualLength: true },
      })
      ticketRegimenWalletModifiedList.forEach((tr) => {
        if (tr.moneyAmountWallet < 0) {
          throw new Error('Tiền trong ví liệu trình không đủ, không thể hoàn trả')
        }
      })

      const ticketProcedureModifiedList = await this.ticketProcedureRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.FullPaid },
        compare: { id: { cast: 'bigint' } },
        tempList: ticketProcedureBodyList.map((i) => ({
          ...i,
          id: i.ticketItemId,
          paymentMoneyStatus: PaymentMoneyStatus.PendingPayment,
        })),
        update: ['paymentMoneyStatus'],
        options: { requireEqualLength: true },
      })

      // chỉ update sang PendingPayment, nên thay đổi moneyAmountPaid mà không thay đổi moneyAmountActual
      const trIdList = ticketProcedureModifiedList
        .map((i) => i.ticketRegimenId)
        .filter((i) => !!i && i != '0')
      const trUpdateList = ESArray.uniqueArray(trIdList).map((trId) => {
        const tpList = ticketProcedureModifiedList.filter((i) => i.ticketRegimenId === trId)
        return {
          id: trId,
          quantityPaid: tpList.reduce((acc, item) => {
            return acc + item.quantity
          }, 0),
          moneyAmountPaid: tpList.reduce((acc, item) => {
            return acc + item.quantity * item.actualPrice
          }, 0),
        }
      })
      const ticketRegimenPaidModifiedList = await this.ticketRegimenRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId },
        compare: { id: { cast: 'bigint' } },
        tempList: trUpdateList,
        update: {
          moneyAmountPaid: (t: string, u: string) => {
            return `"${u}"."moneyAmountPaid" - "${t}"."moneyAmountPaid"`
          },
        },
        options: { requireEqualLength: true },
      })

      const ticketProductModifiedList = await this.ticketProductRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.FullPaid },
        compare: { id: { cast: 'bigint' } },
        tempList: [...ticketProductConsumableBodyList, ...ticketProductPrescriptionBodyList].map(
          (i) => ({
            ...i,
            id: i.ticketItemId,
            paymentMoneyStatus: PaymentMoneyStatus.PendingPayment,
          })
        ),
        update: ['paymentMoneyStatus'],
        options: { requireEqualLength: true },
      })

      const ticketLaboratoryModifiedList = await this.ticketLaboratoryRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.FullPaid },
        compare: { id: { cast: 'bigint' } },
        tempList: ticketLaboratoryBodyList.map((i) => ({
          ...i,
          id: i.ticketItemId,
          paymentMoneyStatus: PaymentMoneyStatus.PendingPayment,
        })),
        update: ['paymentMoneyStatus'],
        options: { requireEqualLength: true },
      })

      const ticketRadiologyModifiedList = await this.ticketRadiologyRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.FullPaid },
        compare: { id: { cast: 'bigint' } },
        tempList: ticketRadiologyBodyList.map((i) => ({
          ...i,
          id: i.ticketItemId,
          paymentMoneyStatus: PaymentMoneyStatus.PendingPayment,
        })),
        update: ['paymentMoneyStatus'],
        options: { requireEqualLength: true },
      })

      // update lại ticketLaboratoryGroup
      let ticketLaboratoryGroupModifiedList: TicketLaboratoryGroup[] = []
      if (ticketLaboratoryModifiedList.length) {
        const tlgIdList = ticketLaboratoryModifiedList.map((i) => i.ticketLaboratoryGroupId)
        const ticketLaboratoryList = await this.ticketLaboratoryRepository.managerFindManyBy(
          manager,
          { oid, ticketLaboratoryGroupId: { IN: tlgIdList } }
        )

        const tlgUpdateList = ESArray.uniqueArray(tlgIdList)
          .filter((i) => !!i)
          .map((tlgId) => {
            const tlList = ticketLaboratoryList.filter((i) => i.ticketLaboratoryGroupId === tlgId)
            const { paymentMoneyStatus } = TicketLaboratoryGroup.calculatorPaymentMoneyStatus({
              ticketLaboratoryList: tlList,
            })
            return {
              id: tlgId,
              paymentMoneyStatus,
            }
          })
        ticketLaboratoryGroupModifiedList =
          await this.ticketLaboratoryGroupRepository.managerBulkUpdate({
            manager,
            compare: { id: { cast: 'bigint' } },
            condition: { oid },
            tempList: tlgUpdateList,
            update: ['paymentMoneyStatus'],
            options: { requireEqualLength: true },
          })
      }

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        ticketRegimen: {
          upsertedList: [...ticketRegimenWalletModifiedList, ...ticketRegimenPaidModifiedList],
        },
        ticketProcedure: { upsertedList: ticketProcedureModifiedList },
        ticketProduct: { upsertedList: ticketProductModifiedList },
        ticketLaboratory: { upsertedList: ticketLaboratoryModifiedList },
        ticketLaboratoryGroup: { upsertedList: ticketLaboratoryGroupModifiedList },
        ticketRadiology: { upsertedList: ticketRadiologyModifiedList },
      })

      return {
        ticketModified,
        customer,
        paymentCreated,
        paymentTicketItemCreatedList,
        ticketProcedureModifiedList,
        ticketProductModifiedList,
        ticketLaboratoryModifiedList,
        ticketRadiologyModifiedList,
        ticketLaboratoryGroupModifiedList,
      }
    })

    return transaction
  }
}
