import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESTimer } from '../../../../../../_libs/common/helpers'
import { GenerateId } from '../../../../../../_libs/database/common/generate-id'
import {
  DeliveryStatus,
  PaymentMoneyStatus,
} from '../../../../../../_libs/database/common/variable'
import { TicketAttributeInsertType } from '../../../../../../_libs/database/entities/ticket-attribute.entity'
import { TicketExpenseInsertType } from '../../../../../../_libs/database/entities/ticket-expense.entity'
import {
  TicketProcedureInsertType,
  TicketProcedureStatus,
  TicketProcedureType,
} from '../../../../../../_libs/database/entities/ticket-procedure.entity'
import {
  TicketProductInsertType,
  TicketProductType,
} from '../../../../../../_libs/database/entities/ticket-product.entity'
import { TicketSurchargeInsertType } from '../../../../../../_libs/database/entities/ticket-surcharge.entity'
import Ticket, {
  TicketInsertType,
  TicketStatus,
} from '../../../../../../_libs/database/entities/ticket.entity'
import {
  TicketAttributeRepository,
  TicketExpenseRepository,
  TicketProcedureRepository,
  TicketProductRepository,
  TicketRepository,
  TicketSurchargeRepository,
} from '../../../../../../_libs/database/repositories'
import { TicketOrderBasicBody } from '../request'

@Injectable()
export class TicketOrderBasicUpsertService {
  constructor(
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketAttributeRepository: TicketAttributeRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketSurchargeRepository: TicketSurchargeRepository,
    private ticketExpenseRepository: TicketExpenseRepository
  ) { }

  async startUpsert(props: {
    oid: number
    ticketId: string
    customerId?: number
    body: TicketOrderBasicBody
  }) {
    const { oid, body } = props
    let { ticketId } = props
    const createdAt = body.ticketOrderBasic.createdAt

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      let ticket: Ticket
      if (!ticketId) {
        const ticketInsert: TicketInsertType = {
          ...body.ticketOrderBasic,
          oid,
          customerId: props.customerId || 0,
          status: TicketStatus.Draft,
          deliveryStatus: body.ticketOrderProductBodyList.length
            ? DeliveryStatus.Pending
            : DeliveryStatus.NoStock,
          itemsCostAmount: 0, // costAmount chỉ tính toán khi gửi hàng
          profit: body.ticketOrderBasic.totalMoney - body.ticketOrderBasic.expense - 0,
          paid: 0,
          paidItem: 0,
          debt: 0,
          debtItem: 0,
          createdAt,
          receptionAt: createdAt,
          year: ESTimer.info(createdAt, 7).year,
          month: ESTimer.info(createdAt, 7).month + 1,
          date: ESTimer.info(createdAt, 7).date,
          dailyIndex: 0,
          endedAt: null,
          imageDiagnosisIds: '[]',
          isPaymentEachItem: 0,
          customerSourceId: 0,
          radiologyMoney: 0,
          laboratoryMoney: 0,
          commissionMoney: 0,
        }
        ticket = await this.ticketRepository.managerInsertOne(manager, ticketInsert)
      } else {
        await this.ticketAttributeRepository.managerDeleteBasic(manager, { oid, ticketId })
        await this.ticketProductRepository.managerDeleteBasic(manager, { oid, ticketId })
        await this.ticketProcedureRepository.managerDeleteBasic(manager, { oid, ticketId })
        await this.ticketSurchargeRepository.managerDeleteBasic(manager, { oid, ticketId })
        await this.ticketExpenseRepository.managerDeleteBasic(manager, { oid, ticketId })

        ticket = await this.ticketRepository.managerUpdateOne(
          manager,
          { id: ticketId, oid },
          body.ticketOrderBasic
        )
      }

      const customerId = ticket.customerId
      ticketId = ticket.id

      if (body.ticketOrderProductBodyList.length) {
        const ticketProductListInsert = body.ticketOrderProductBodyList.map((i) => {
          const ticketProduct: TicketProductInsertType = {
            ...i,
            id: GenerateId.nextId(),
            oid,
            ticketId: ticket.id,
            customerId,
            deliveryStatus: DeliveryStatus.Pending,
            quantityPrescription: i.quantity,
            quantity: i.quantity,
            type: TicketProductType.Prescription,
            paymentMoneyStatus: PaymentMoneyStatus.TicketPaid,
            costAmount: 0, // costAmount chỉ tính toán khi gửi hàng
            ticketProcedureId: '0',
            createdAt,
            printPrescription: 1,
            paid: 0,
            debt: 0,
          }
          return ticketProduct
        })
        ticket.ticketProductList = await this.ticketProductRepository.managerInsertMany(
          manager,
          ticketProductListInsert
        )
      }

      if (body.ticketOrderProcedureBodyList.length) {
        const ticketProcedureListInsert = body.ticketOrderProcedureBodyList.map((i) => {
          const ticketProcedure: TicketProcedureInsertType = {
            ...i,
            id: GenerateId.nextId(),
            oid,
            ticketId,
            customerId,
            createdAt,
            status: TicketProcedureStatus.NoAction,
            imageIds: JSON.stringify([]),
            result: '',
            completedAt: null,
            costAmount: 0,
            ticketRegimenId: '0',
            ticketRegimenItemId: '0',
            indexSession: 0,
            commissionAmount: 0,
            ticketProcedureType: TicketProcedureType.Normal,
            paymentMoneyStatus: PaymentMoneyStatus.TicketPaid,
            paid: i.actualPrice * i.quantity,
            debt: 0,
          }
          return ticketProcedure
        })
        ticket.ticketProcedureList = await this.ticketProcedureRepository.managerInsertMany(
          manager,
          ticketProcedureListInsert
        )
      }

      if (body.ticketOrderSurchargeBodyList.length) {
        const ticketSurchargeListInsert = body.ticketOrderSurchargeBodyList.map((i) => {
          const ticketSurcharge: TicketSurchargeInsertType = {
            ...i,
            oid,
            ticketId,
          }
          return ticketSurcharge
        })
        await this.ticketSurchargeRepository.managerInsertMany(manager, ticketSurchargeListInsert)
      }

      if (body.ticketOrderExpenseBodyList.length) {
        const ticketExpenseListInsert = body.ticketOrderExpenseBodyList.map((i) => {
          const ticketExpense: TicketExpenseInsertType = {
            ...i,
            oid,
            ticketId: ticket.id,
          }
          return ticketExpense
        })
        await this.ticketExpenseRepository.managerInsertMany(manager, ticketExpenseListInsert)
      }

      if (body.ticketOrderAttributeDaftList?.length) {
        const ticketAttributeListInsert = body.ticketOrderAttributeDaftList.map((i) => {
          const ticketAttribute: TicketAttributeInsertType = {
            ...i,
            oid,
            ticketId: ticket.id,
          }
          return ticketAttribute
        })
        await this.ticketAttributeRepository.managerInsertMany(manager, ticketAttributeListInsert)
      }

      return { ticket }
    })

    return transaction
  }
}
