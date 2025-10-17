import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import {
  DeliveryStatus,
  PaymentMoneyStatus,
} from '../../../../../../_libs/database/common/variable'
import { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import {
  TicketCalculatorMoney,
  TicketUpdateCommissionTicketUserOperator,
} from '../../../../../../_libs/database/operations'
import {
  TicketLaboratoryRepository,
  TicketProcedureRepository,
  TicketProductRepository,
  TicketRadiologyRepository,
  TicketRepository,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { TicketChangeAllMoneyBody } from '../request'

@Injectable()
export class TicketChangeAllMoneyService {
  constructor(
    private socketEmitService: SocketEmitService,
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketRadiologyRepository: TicketRadiologyRepository,
    private ticketLaboratoryRepository: TicketLaboratoryRepository,
    private ticketCalculatorMoney: TicketCalculatorMoney,
    private ticketUpdateCommissionTicketUserOperator: TicketUpdateCommissionTicketUserOperator
  ) { }

  async changeAllMoney(params: { oid: number; ticketId: string; body: TicketChangeAllMoneyBody }) {
    const { oid, ticketId, body } = params
    const time = Date.now()

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const ticketOrigin = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )
      const ticketProductModifiedList = await this.ticketProductRepository.managerBulkUpdate({
        manager,
        condition: {
          oid,
          ticketId,
          deliveryStatus: DeliveryStatus.Pending,
          paymentMoneyStatus: {
            IN: [PaymentMoneyStatus.TicketPaid, PaymentMoneyStatus.PendingPayment],
          },
        },
        compare: { id: { cast: 'bigint' } },
        tempList: body.ticketProductList,
        update: ['quantity', 'discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: true },
      })

      const ticketProcedureModifiedList = await this.ticketProcedureRepository.managerBulkUpdate({
        manager,
        condition: {
          oid,
          ticketId,
          paymentMoneyStatus: {
            IN: [PaymentMoneyStatus.TicketPaid, PaymentMoneyStatus.PendingPayment],
          },
        },
        compare: { id: { cast: 'bigint' } },
        tempList: body.ticketProcedureList,
        update: ['quantity', 'discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: true },
      })

      const ticketLaboratoryModifiedList = await this.ticketLaboratoryRepository.managerBulkUpdate({
        manager,
        condition: {
          oid,
          ticketId,
          paymentMoneyStatus: {
            IN: [PaymentMoneyStatus.TicketPaid, PaymentMoneyStatus.PendingPayment],
          },
        },
        compare: { id: { cast: 'bigint' } },
        tempList: body.ticketLaboratoryList,
        update: ['discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: true },
      })

      const ticketRadiologyModifiedList = await this.ticketRadiologyRepository.managerBulkUpdate({
        manager,
        condition: {
          oid,
          ticketId,
          paymentMoneyStatus: {
            IN: [PaymentMoneyStatus.TicketPaid, PaymentMoneyStatus.PendingPayment],
          },
        },
        compare: { id: { cast: 'bigint' } },
        tempList: body.ticketRadiologyList,
        update: ['discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: true },
      })

      const ticketProductList = await this.ticketProductRepository.managerFindManyBy(manager, {
        oid,
        ticketId,
      })
      const ticketProcedureList = await this.ticketProcedureRepository.managerFindManyBy(manager, {
        oid,
        ticketId,
      })
      const ticketLaboratoryList = await this.ticketLaboratoryRepository.managerFindManyBy(
        manager,
        { oid, ticketId }
      )
      const ticketRadiologyList = await this.ticketRadiologyRepository.managerFindManyBy(manager, {
        oid,
        ticketId,
      })

      const { ticketUserModifiedList } =
        await this.ticketUpdateCommissionTicketUserOperator.updateCommissionTicketUser({
          manager,
          oid,
          ticketId,
          ticketOrigin,
          ticketLaboratoryList,
          ticketProcedureList,
          ticketRadiologyList,
          ticketProductList,
        })

      const ticketMoneyBody = this.ticketCalculatorMoney.reCalculatorMoney({
        oid,
        ticketOrigin,
        ticketProcedureList,
        ticketProductList,
        ticketLaboratoryList,
        ticketRadiologyList,
        ticketUserList: ticketUserModifiedList,
      })

      const ticketModified = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketOrigin.id },
        ticketMoneyBody
      )

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        ticketProcedure: { upsertedList: ticketProcedureModifiedList },
        ticketProduct: { upsertedList: ticketProductModifiedList },
        ticketLaboratory: { upsertedList: ticketLaboratoryModifiedList },
        ticketRadiology: { upsertedList: ticketRadiologyModifiedList },
      })

      return { ticketModified }
    })

    return transaction
  }
}
