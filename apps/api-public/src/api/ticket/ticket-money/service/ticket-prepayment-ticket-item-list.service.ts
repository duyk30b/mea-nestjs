import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../../../../_libs/common/helpers'
import { BusinessError } from '../../../../../../_libs/database/common/error'
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
import { TicketChangeItemMoneyManager } from '../../../../../../_libs/database/operations'
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
import { CustomerPrepaymentTicketItemListBody } from '../request'

@Injectable()
export class TicketPrepaymentTicketItemListService {
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
    private ticketRadiologyRepository: TicketRadiologyRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async startPrepayment(data: {
    oid: number
    userId: number
    ticketId: string
    body: CustomerPrepaymentTicketItemListBody
  }) {
    const { oid, ticketId, userId, body } = data
    const {
      customerId,
      paymentMethodId,
      paidAmount,
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

    const paidAmountReduce = ticketItemList.reduce((acc, item) => {
      return acc + item.actualPrice * item.quantity
    }, 0)

    if (paidAmount !== paidAmountReduce) {
      throw new BusinessError('Tổng số tiền không khớp', { paidAmount, paidAmountReduce })
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET ===
      let ticketModified = await this.ticketRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: ticketId,
          customerId,
          status: {
            IN: [
              TicketStatus.Draft,
              TicketStatus.Schedule,
              TicketStatus.Deposited,
              TicketStatus.Executing,
            ],
          },
          isPaymentEachItem: 1,
        },
        {
          paid: () => `paid + ${paidAmount}`,
          debt: () => `debt - ${paidAmount}`,
          status: () => ` CASE
                              WHEN("status" = ${TicketStatus.Draft}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Schedule}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Deposited}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Executing}) THEN ${TicketStatus.Executing} 
                              ELSE ${TicketStatus.Executing}
                          END`,
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
        moneyDirection: MoneyDirection.In,
        paymentActionType: PaymentActionType.PrepaymentForTicketItemList,
        note: note || '',

        paidAmount,
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
        }
        return inserter
      })
      const paymentTicketItemCreatedList = await this.paymentTicketItemRepository.managerInsertMany(
        manager,
        paymentTicketItemInsertList
      )

      // === START: Cập nhật thanh toán vào item ===
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
            return `"${u}"."moneyAmountWallet" + "${t}"."moneyAmountWallet"`
          },
        },
        options: { requireEqualLength: true },
      })

      const ticketProcedurePendingModifiedList =
        await this.ticketProcedureRepository.managerBulkUpdate({
          manager,
          condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.PendingPayment },
          compare: { id: { cast: 'bigint' } },
          tempList: ticketProcedureBodyList
            .filter((i) => i.paymentMoneyStatus === PaymentMoneyStatus.PendingPayment)
            .map((i) => ({
              ...i,
              id: i.ticketItemId,
              paymentMoneyStatus: PaymentMoneyStatus.FullPaid,
            })),
          update: ['paymentMoneyStatus'],
          options: { requireEqualLength: true },
        })

      const ticketProcedureNoEffectModifiedList =
        await this.ticketProcedureRepository.managerBulkUpdate({
          manager,
          condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.NoEffect },
          compare: { id: { cast: 'bigint' } },
          tempList: ticketProcedureBodyList
            .filter((i) => i.paymentMoneyStatus === PaymentMoneyStatus.NoEffect)
            .map((i) => ({
              ...i,
              id: i.ticketItemId,
              paymentMoneyStatus: PaymentMoneyStatus.FullPaid,
            })),
          update: ['paymentMoneyStatus'],
          options: { requireEqualLength: true },
        })

      const ticketProcedureModifiedList = [
        ...ticketProcedurePendingModifiedList,
        ...ticketProcedureNoEffectModifiedList,
      ]

      // Từ NoEffect sang thanh toán thì thay đổi Actual
      const triIdList = ticketProcedureNoEffectModifiedList
        .map((i) => i.ticketRegimenItemId)
        .filter((i) => !!i && i !== '0')
      const triUpdateList = ESArray.uniqueArray(triIdList).map((triId) => {
        const tpList = ticketProcedureNoEffectModifiedList.filter((i) => {
          return i.ticketRegimenItemId === triId
        })
        return {
          id: triId,
          quantityActual: tpList.reduce((acc, item) => {
            return acc + item.quantity
          }, 0),
          moneyAmountActual: tpList.reduce((acc, item) => {
            return acc + item.quantity * item.actualPrice
          }, 0),
        }
      })
      const ticketRegimenItemModifiedList =
        await this.ticketRegimenItemRepository.managerBulkUpdate({
          manager,
          condition: { oid, ticketId },
          compare: { id: { cast: 'bigint' } },
          tempList: triUpdateList,
          update: {
            quantityActual: (t: string, u: string) => {
              return `"${u}"."quantityActual" + "${t}"."quantityActual"`
            },
            moneyAmountActual: (t: string, u: string) => {
              return `"${u}"."moneyAmountActual" + "${t}"."moneyAmountActual"`
            },
          },
          options: { requireEqualLength: true },
        })

      const trIdList = ticketProcedureModifiedList
        .map((i) => i.ticketRegimenId)
        .filter((i) => !!i && i !== '0')
      const trUpdateList = ESArray.uniqueArray(trIdList).map((trId) => {
        const tpPaidList = ticketProcedureModifiedList.filter((i) => i.ticketRegimenId === trId)
        const tpActualList = ticketProcedureNoEffectModifiedList.filter((i) => {
          return i.ticketRegimenId === trId
        })
        return {
          id: trId,
          moneyAmountActual: tpActualList.reduce((acc, item) => {
            return acc + item.quantity * item.actualPrice
          }, 0),
          moneyAmountPaid: tpPaidList.reduce((acc, item) => {
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
          moneyAmountActual: (t: string, u: string) => {
            return `"${u}"."moneyAmountActual" + "${t}"."moneyAmountActual"`
          },
          moneyAmountPaid: (t: string, u: string) => {
            return `"${u}"."moneyAmountPaid" + "${t}"."moneyAmountPaid"`
          },
        },
        options: { requireEqualLength: true },
      })

      const ticketProductModifiedList = await this.ticketProductRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.PendingPayment },
        compare: { id: { cast: 'bigint' } },
        tempList: [...ticketProductConsumableBodyList, ...ticketProductPrescriptionBodyList].map(
          (i) => ({
            ...i,
            id: i.ticketItemId,
            paymentMoneyStatus: PaymentMoneyStatus.FullPaid,
          })
        ),
        update: ['paymentMoneyStatus'],
        options: { requireEqualLength: true },
      })

      const ticketLaboratoryModifiedList = await this.ticketLaboratoryRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.PendingPayment },
        compare: { id: { cast: 'bigint' } },
        tempList: ticketLaboratoryBodyList.map((i) => ({
          ...i,
          id: i.ticketItemId,
          paymentMoneyStatus: PaymentMoneyStatus.FullPaid,
        })),
        update: ['paymentMoneyStatus'],
        options: { requireEqualLength: true },
      })

      const ticketRadiologyModifiedList = await this.ticketRadiologyRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.PendingPayment },
        compare: { id: { cast: 'bigint' } },
        tempList: ticketRadiologyBodyList.map((i) => ({
          ...i,
          id: i.ticketItemId,
          paymentMoneyStatus: PaymentMoneyStatus.FullPaid,
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
          .filter((i) => !!i && i != '0')
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

      if (ticketProcedureNoEffectModifiedList.length) {
        const procedureMoneyAdd = ticketProcedureNoEffectModifiedList.reduce((acc, item) => {
          return acc + item.quantity * item.actualPrice
        }, 0)
        if (procedureMoneyAdd !== 0) {
          ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
            manager,
            oid,
            ticketOrigin: ticketModified,
            itemMoney: {
              procedureMoneyAdd,
            },
          })
        }
      }

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        ticketRegimen: {
          upsertedList: [...ticketRegimenWalletModifiedList, ...ticketRegimenPaidModifiedList],
        },
        ticketRegimenItem: {
          upsertedList: ticketRegimenItemModifiedList,
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
