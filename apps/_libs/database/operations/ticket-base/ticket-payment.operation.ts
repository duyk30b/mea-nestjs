import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { ESArray } from '../../../common/helpers'
import { BusinessError } from '../../common/error'
import { DiscountType, PaymentMoneyStatus } from '../../common/variable'
import { Customer, TicketLaboratoryGroup, TicketRegimen, TicketRegimenItem } from '../../entities'
import {
  PaymentTicketItemInsertType,
  TicketItemType,
} from '../../entities/payment-ticket-item.entity'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../entities/payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
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
  WalletRepository,
} from '../../repositories'
import { TicketChangeItemMoneyManager } from './ticket-change-item-money.manager'

export type TicketPaymentItemDto = {
  ticketItemType: TicketItemType
  ticketItemId: string
  interactId: number
  expectedPrice: number
  discountMoney: number
  discountPercent: number
  discountType: DiscountType
  actualPrice: number
  quantity: number
  sessionIndex: number
  paidAdd: number
  debtAdd: number
}

export type TicketPaymentItemMapDtoType = {
  ticketRegimenBodyList: TicketPaymentItemDto[]
  ticketProcedureNoEffectBodyList: TicketPaymentItemDto[]
  ticketProcedureHasEffectBodyList: TicketPaymentItemDto[]
  ticketProductConsumableBodyList: TicketPaymentItemDto[]
  ticketProductPrescriptionBodyList: TicketPaymentItemDto[]
  ticketLaboratoryBodyList: TicketPaymentItemDto[]
  ticketRadiologyBodyList: TicketPaymentItemDto[]
}

export type TicketPaymentOperationPropType = {
  oid: number
  ticketId: string
  userId: number
  walletId: string
  paymentActionType: PaymentActionType
  time: number
  note: string
  paidAdd: number
  paidItemAdd: number
  debtAdd: number
  debtItemAdd: number
  ticketPaymentItemMapDto?: TicketPaymentItemMapDtoType
}

@Injectable()
export class TicketPaymentOperation {
  constructor(
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private customerRepository: CustomerRepository,
    private walletRepository: WalletRepository,
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

  async managerPaymentMoney(manager: EntityManager, props: TicketPaymentOperationPropType) {
    const {
      oid,
      ticketId,
      userId,
      paymentActionType,
      paidAdd,
      paidItemAdd,
      debtAdd,
      // debtItemAdd,
      ticketPaymentItemMapDto,
      time,
      note,
    } = props
    const walletId = props.walletId || '0'
    const PREFIX = `ticketId=${ticketId} startPayment failed`

    const ticketItemList = [
      ...(ticketPaymentItemMapDto?.ticketRegimenBodyList || []),
      ...(ticketPaymentItemMapDto?.ticketProcedureNoEffectBodyList || []),
      ...(ticketPaymentItemMapDto?.ticketProcedureHasEffectBodyList || []),
      ...(ticketPaymentItemMapDto?.ticketProductConsumableBodyList || []),
      ...(ticketPaymentItemMapDto?.ticketProductPrescriptionBodyList || []),
      ...(ticketPaymentItemMapDto?.ticketLaboratoryBodyList || []),
      ...(ticketPaymentItemMapDto?.ticketRadiologyBodyList || []),
    ]
    const paidItemAddReduce = ticketItemList.reduce((acc, item) => {
      return acc + item.paidAdd
    }, 0)
    const debtItemAddReduce = ticketItemList.reduce((acc, item) => {
      return acc + item.debtAdd
    }, 0)

    const debtItemAdd = debtItemAddReduce // Do ở front-end không tính được debtItemAdd
    if (paidAdd + paidItemAdd == 0 && debtAdd + debtItemAdd < 0) {
      throw new BusinessError(PREFIX, 'Số tiền thanh toán phải > 0')
    }
    if (paidItemAdd !== paidItemAddReduce || debtItemAdd !== debtItemAddReduce) {
      throw new BusinessError(PREFIX, 'Số tiền thanh toán trong Item không đúng', {
        paidItemAdd,
        paidItemAddReduce,
        debtItemAdd,
        debtItemAddReduce,
      })
    }

    // === 1. TICKET: Update status để tạo transaction ===
    const ticketUpdated = await this.ticketRepository.managerUpdateOne(
      manager,
      {
        oid,
        id: ticketId,
        status: {
          IN: [
            TicketStatus.Draft,
            TicketStatus.Schedule,
            TicketStatus.Deposited,
            TicketStatus.Executing,
            TicketStatus.Debt,
          ],
        },
      },
      {
        paid: () => `"paid" + ${paidAdd}`,
        paidItem: () => `"paidItem" + ${paidItemAdd}`,
        debt: () => `"debt" + ${debtAdd}`,
        debtItem: () => `"debtItem" + ${debtItemAdd}`,
        status: () => ` CASE
                              WHEN("status" = ${TicketStatus.Draft}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Schedule}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Deposited}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Executing}) THEN ${TicketStatus.Executing} 
                              WHEN("status" = ${TicketStatus.Debt} 
                                AND "paid" + "paidItem" + ${paidAdd + paidItemAdd} = "totalMoney") 
                                THEN ${TicketStatus.Completed} 
                              WHEN("status" = ${TicketStatus.Debt} 
                                AND "paid" + "paidItem" + ${paidAdd + paidItemAdd} < "totalMoney") 
                                THEN ${TicketStatus.Debt} 
                              ELSE "status"
                          END`,
      }
    )

    if (
      ticketUpdated.status === TicketStatus.Debt
      && ticketUpdated.paid > ticketUpdated.totalMoney
    ) {
      throw new BusinessError(PREFIX, 'Số tiền thanh toán không đúng')
    }
    if (ticketUpdated.debt < 0) {
      throw new BusinessError(PREFIX, 'Số tiền trả nợ không đúng')
    }

    const { customerId } = ticketUpdated

    let customerModified: Customer
    let walletOpenMoney = 0
    let walletCloseMoney = 0
    let customerOpenDebt = 0
    let customerCloseDebt = 0

    if (debtAdd + debtItemAdd != 0) {
      customerModified = await this.customerRepository.managerUpdateOne(
        manager,
        { oid, id: customerId },
        { updatedAt: time, debt: () => `debt + ${debtAdd + debtItemAdd}` }
      )
      customerOpenDebt = customerModified.debt - (debtAdd + debtItemAdd)
      customerCloseDebt = customerModified.debt
    } else {
      customerModified = await this.customerRepository.managerFindOneBy(manager, {
        oid,
        id: customerId,
      })
      customerOpenDebt = customerModified.debt
      customerCloseDebt = customerModified.debt
    }

    if (paidAdd + paidItemAdd) {
      if (walletId && walletId !== '0') {
        const walletModified = await this.walletRepository.managerUpdateOne(
          manager,
          { oid, id: walletId },
          { money: () => `money + ${paidAdd + paidItemAdd}` }
        )
        walletCloseMoney = walletModified.money
        walletOpenMoney = walletModified.money - (paidAdd + paidItemAdd)
      } else {
        // validate wallet
        const walletList = await this.walletRepository.managerFindManyBy(manager, { oid })
        if (walletList.length) {
          throw new BusinessError(PREFIX, 'Chưa chọn phương thức thanh toán')
        }
      }
    }

    let moneyDirection = MoneyDirection.Other
    if (paidAdd + paidItemAdd > 0) {
      moneyDirection = MoneyDirection.In
    }
    if (paidAdd + paidItemAdd < 0) {
      moneyDirection = MoneyDirection.Out
    }

    const paymentInsert: PaymentInsertType = {
      oid,
      voucherType: PaymentVoucherType.Ticket,
      voucherId: ticketId,
      personType: PaymentPersonType.Customer,
      personId: customerId,

      cashierId: userId,
      walletId,
      createdAt: time,
      paymentActionType,
      moneyDirection,
      note,

      paid: paidAdd,
      paidItem: paidItemAdd,
      debt: debtAdd,
      debtItem: debtItemAdd,
      personOpenDebt: customerOpenDebt,
      personCloseDebt: customerCloseDebt,
      walletOpenMoney,
      walletCloseMoney,
    }

    const paymentCreated = await this.paymentRepository.managerInsertOne(manager, paymentInsert)

    const paymentTicketItemInsertList = ticketItemList.map((i) => {
      const inserter: PaymentTicketItemInsertType = {
        oid,
        paymentId: paymentCreated.id,

        ticketId,
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
        paidItem: i.paidAdd,
        debtItem: i.debtAdd,
      }
      return inserter
    })
    const paymentTicketItemCreatedList = await this.paymentTicketItemRepository.managerInsertMany(
      manager,
      paymentTicketItemInsertList
    )

    // === START: Cập nhật thanh toán vào item ===
    const ticketRegimenModifiedList = await this.ticketRegimenRepository.managerBulkUpdate({
      manager,
      condition: { oid, ticketId },
      compare: { id: { cast: 'bigint' } },
      tempList: (ticketPaymentItemMapDto?.ticketRegimenBodyList || []).map((i) => ({
        ...i,
        id: i.ticketItemId,
        paidAdd: i.paidAdd,
        debtAdd: i.debtAdd,
      })),
      update: {
        paid: () => `"paid" + "paidAdd"`,
        debt: () => `"debt" + "debtAdd"`,
      },
      options: { requireEqualLength: true },
    })

    const ticketProcedureNoEffectModifiedList =
      await this.ticketProcedureRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.NoEffect },
        compare: { id: { cast: 'bigint' } },
        tempList: (ticketPaymentItemMapDto?.ticketProcedureNoEffectBodyList || []).map((i) => ({
          ...i,
          id: i.ticketItemId,
          paidAdd: i.paidAdd,
          debtAdd: i.debtAdd,
        })),
        update: {
          paid: () => `"paid" + "paidAdd"`,
          debt: () => `"debt" + "debtAdd"`,
          paymentMoneyStatus: (t: string, u: string) => {
            return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."quantity" * "${u}"."actualPrice" 
                            AND "debt" + "debtAdd" = 0) THEN ${PaymentMoneyStatus.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."quantity" * "${u}"."actualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${PaymentMoneyStatus.PartialPaid} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" > 0) 
                            THEN ${PaymentMoneyStatus.Debt} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" = 0) 
                            THEN ${PaymentMoneyStatus.PendingPayment} 
                          ELSE "paymentMoneyStatus"
                      END`
          },
        },
        options: { requireEqualLength: true },
      })

    const ticketProcedureHasEffectModifiedList =
      await this.ticketProcedureRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: { NOT: PaymentMoneyStatus.NoEffect } },
        compare: { id: { cast: 'bigint' } },
        tempList: (ticketPaymentItemMapDto?.ticketProcedureHasEffectBodyList || []).map((i) => ({
          ...i,
          id: i.ticketItemId,
          paidAdd: i.paidAdd,
          debtAdd: i.debtAdd,
        })),
        update: {
          paid: () => `"paid" + "paidAdd"`,
          debt: () => `"debt" + "debtAdd"`,
          paymentMoneyStatus: (t: string, u: string) => {
            return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."quantity" * "${u}"."actualPrice" 
                            AND "debt" + "debtAdd" = 0) THEN ${PaymentMoneyStatus.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."quantity" * "${u}"."actualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${PaymentMoneyStatus.PartialPaid} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" > 0) 
                            THEN ${PaymentMoneyStatus.Debt} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" = 0) 
                            THEN ${PaymentMoneyStatus.PendingPayment} 
                          ELSE "paymentMoneyStatus"
                      END`
          },
        },
        options: { requireEqualLength: true },
      })

    const ticketProductModifiedList = await this.ticketProductRepository.managerBulkUpdate({
      manager,
      condition: { oid, ticketId },
      compare: { id: { cast: 'bigint' } },
      tempList: [
        ...(ticketPaymentItemMapDto?.ticketProductConsumableBodyList || []),
        ...(ticketPaymentItemMapDto?.ticketProductPrescriptionBodyList || []),
      ].map((i) => ({
        ...i,
        id: i.ticketItemId,
        paidAdd: i.paidAdd,
        debtAdd: i.debtAdd,
      })),
      update: {
        paid: () => `"paid" + "paidAdd"`,
        debt: () => `"debt" + "debtAdd"`,
        paymentMoneyStatus: (t: string, u: string) => {
          return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."quantity" * "${u}"."actualPrice" 
                            AND "debt" + "debtAdd" = 0) THEN ${PaymentMoneyStatus.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."quantity" * "${u}"."actualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${PaymentMoneyStatus.PartialPaid} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" > 0) 
                            THEN ${PaymentMoneyStatus.Debt} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" = 0) 
                            THEN ${PaymentMoneyStatus.PendingPayment} 
                          ELSE "paymentMoneyStatus"
                      END`
        },
      },
      options: { requireEqualLength: true },
    })

    const ticketLaboratoryModifiedList = await this.ticketLaboratoryRepository.managerBulkUpdate({
      manager,
      condition: { oid, ticketId },
      compare: { id: { cast: 'bigint' } },
      tempList: (ticketPaymentItemMapDto?.ticketLaboratoryBodyList || []).map((i) => ({
        ...i,
        id: i.ticketItemId,
        paidAdd: i.paidAdd,
        debtAdd: i.debtAdd,
      })),
      update: {
        paid: () => `"paid" + "paidAdd"`,
        debt: () => `"debt" + "debtAdd"`,
        paymentMoneyStatus: (t: string, u: string) => {
          return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."actualPrice" 
                            AND "debt" + "debtAdd" = 0) THEN ${PaymentMoneyStatus.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."actualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${PaymentMoneyStatus.PartialPaid} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" > 0) 
                            THEN ${PaymentMoneyStatus.Debt} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" = 0) 
                            THEN ${PaymentMoneyStatus.PendingPayment} 
                          ELSE "paymentMoneyStatus"
                      END`
        },
      },
      options: { requireEqualLength: true },
    })

    const ticketRadiologyModifiedList = await this.ticketRadiologyRepository.managerBulkUpdate({
      manager,
      condition: { oid, ticketId },
      compare: { id: { cast: 'bigint' } },
      tempList: (ticketPaymentItemMapDto?.ticketRadiologyBodyList || []).map((i) => ({
        ...i,
        id: i.ticketItemId,
        paidAdd: i.paidAdd,
        debtAdd: i.debtAdd,
      })),
      update: {
        paid: () => `"paid" + "paidAdd"`,
        debt: () => `"debt" + "debtAdd"`,
        paymentMoneyStatus: (t: string, u: string) => {
          return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."actualPrice" 
                            AND "debt" + "debtAdd" = 0) THEN ${PaymentMoneyStatus.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."actualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${PaymentMoneyStatus.PartialPaid} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" > 0) 
                            THEN ${PaymentMoneyStatus.Debt} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" = 0) 
                            THEN ${PaymentMoneyStatus.PendingPayment} 
                          ELSE "paymentMoneyStatus"
                      END`
        },
      },
      options: { requireEqualLength: true },
    })

    // === Validate Update
    const validate = [
      ...ticketProcedureNoEffectModifiedList,
      ...ticketProcedureHasEffectModifiedList,
      ...ticketProductModifiedList,
      ...ticketLaboratoryModifiedList,
      ...ticketRadiologyModifiedList,
    ].forEach((i) => {
      const quantity = i['quantity'] || 1
      if (i.paid + i.debt > quantity * i.actualPrice) {
        throw new BusinessError(PREFIX, i, 'i.paid + i.debt > i.quantity * i.actualPrice')
      }
      if (i.paid < 0) throw new BusinessError(PREFIX, 'i.paid < 0')
      if (i.debt < 0) throw new BusinessError(PREFIX, 'i.debt < 0')
    })

    // === Update lại TicketProcedureNoEffect => Từ NoEffect sang HasEffect thì thay đổi Actual
    let ticketModified = ticketUpdated
    let ticketRegimenItemModifiedList: TicketRegimenItem[] = []
    let ticketRegimenFixList: TicketRegimen[] = []

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

    if (ticketProcedureNoEffectModifiedList.length) {
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
      ticketRegimenItemModifiedList = await this.ticketRegimenItemRepository.managerBulkUpdate({
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
    }

    if (ticketProcedureNoEffectModifiedList.length || ticketProcedureHasEffectModifiedList.length) {
      const trIdList = [
        ...(ticketProcedureNoEffectModifiedList || []),
        ...(ticketProcedureHasEffectModifiedList || []),
      ]
        .map((i) => i.ticketRegimenId)
        .filter((i) => !!i && i !== '0')
      const trIdListUnique = ESArray.uniqueArray(trIdList)
      const trUpdateList = trIdListUnique.map((trId) => {
        const tpNoEffectList = ticketProcedureNoEffectModifiedList
          .filter((i) => i.ticketRegimenId === trId)
          .map((i) => {
            return {
              moneyAmountActualAdd: i.quantity * i.actualPrice,
              paidItemAdd: i.paid,
              debtItemAdd: i.debt,
            }
          })
        const tpHasEffectList = ticketProcedureHasEffectModifiedList
          .filter((i) => i.ticketRegimenId === trId)
          .map((i) => {
            const tpBody = ticketPaymentItemMapDto.ticketProcedureHasEffectBodyList.find((j) => {
              return j.ticketItemId === i.id
            })
            return {
              paidItemAdd: tpBody.paidAdd,
              debtItemAdd: tpBody.debtAdd,
            }
          })
        return {
          id: trId,
          moneyAmountActualAdd: tpNoEffectList.reduce((acc, item) => {
            return acc + item.moneyAmountActualAdd
          }, 0),
          paidItemAdd: [...tpNoEffectList, ...tpHasEffectList].reduce((acc, item) => {
            return acc + item.paidItemAdd
          }, 0),
          debtItemAdd: [...tpNoEffectList, ...tpHasEffectList].reduce((acc, item) => {
            return acc + item.debtItemAdd
          }, 0),
        }
      })
      ticketRegimenFixList = await this.ticketRegimenRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId },
        compare: { id: { cast: 'bigint' } },
        tempList: trUpdateList,
        update: {
          moneyAmountActual: (t: string, u: string) => {
            return `"${u}"."moneyAmountActual" + "${t}"."moneyAmountActualAdd"`
          },
          paidItem: (t: string, u: string) => {
            return `"${u}"."paidItem" + "${t}"."paidItemAdd"`
          },
          debtItem: (t: string, u: string) => {
            return `"${u}"."debtItem" + "${t}"."debtItemAdd"`
          },
        },
        options: { requireEqualLength: true },
      })
    }

    // === Update lại TicketLaboratoryGroup
    let ticketLaboratoryGroupModifiedList: TicketLaboratoryGroup[] = []
    if (ticketLaboratoryModifiedList.length) {
      const tlgIdList = ticketLaboratoryModifiedList.map((i) => i.ticketLaboratoryGroupId)
      const tlgIdListUnique = ESArray.uniqueArray(tlgIdList)
      const ticketLaboratoryList = await this.ticketLaboratoryRepository.managerFindManyBy(
        manager,
        { oid, ticketLaboratoryGroupId: { IN: tlgIdListUnique } }
      )

      const tlgUpdateList = tlgIdListUnique
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

    return {
      ticketModified,
      customerModified,
      paymentCreated,
      paymentTicketItemCreatedList,
      ticketRegimentList: [...ticketRegimenModifiedList, ...ticketRegimenFixList],
      ticketRegimenItemModifiedList,
      ticketProcedureModifiedList: [
        ...ticketProcedureNoEffectModifiedList,
        ...ticketProcedureHasEffectModifiedList,
      ],
      ticketProductModifiedList,
      ticketLaboratoryModifiedList,
      ticketRadiologyModifiedList,
      ticketLaboratoryGroupModifiedList,
    }
  }

  async startPaymentMoney(prop: TicketPaymentOperationPropType) {
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const managerPayment = await this.managerPaymentMoney(manager, prop)
      return managerPayment
    })

    return transaction
  }

  async startPaymentMoneyList(propList: TicketPaymentOperationPropType[]) {
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const managerPaymentList: Awaited<ReturnType<typeof this.managerPaymentMoney>>[] = []
      for (let i = 0; i < propList.length; i++) {
        const prop = propList[i]
        const managerPayment = await this.managerPaymentMoney(manager, prop)
        managerPaymentList.push(managerPayment)
      }
      return managerPaymentList
    })

    return transaction
  }
}
