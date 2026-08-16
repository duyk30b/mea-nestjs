import { DeliveryStatus } from '@libs/database/common/variable'
import { TicketStatus } from '@libs/database/entities/ticket.entity'
import { TicketRepository } from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../common/error'

@Injectable()
export class TicketOpenCloseOperation {
  constructor(
    private dataSource: DataSource,
    private ticketRepository: TicketRepository
  ) {}

  async startClose(params: { oid: number; ticketId: string; userId: number; time: number }) {
    const { oid, ticketId, userId, time } = params

    const PREFIX = `ticketId=${ticketId} close failed`

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction('READ UNCOMMITTED')
    try {
      const manager = queryRunner.manager
      // === 1. TICKET: Update status để tạo transaction ===
      const ticketModified = await this.ticketRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: ticketId,
          status: {
            IN: [TicketStatus.Draft, TicketStatus.Schedule, TicketStatus.Executing],
          },
        },
        {
          status: () => `CASE 
                              WHEN("paidTotal" < "totalMoney") THEN ${TicketStatus.Debt} 
                              WHEN("paidTotal" = "totalMoney") THEN ${TicketStatus.Completed} 
                              ELSE ${TicketStatus.Executing}
                          END
                          `,
          updatedAt: time,
          endedAt: time,
        }
      )
      if (ticketModified.paidTotal + ticketModified.debtTotal !== ticketModified.totalMoney) {
        throw new BusinessError(PREFIX, 'Cần điều chỉnh nợ và tiền trước khi đóng phiếu')
      }
      if (
        [DeliveryStatus.Pending, DeliveryStatus.Partial].includes(ticketModified.deliveryStatus)
      ) {
        throw new BusinessError(PREFIX, 'Cần nhập hàng trước khi đóng phiếu')
      }

      await queryRunner.commitTransaction()

      return {
        ticketModified,
      }
    } catch (error: any) {
      console.error('error:', error)
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async reopen(props: { oid: number; ticketId: string }) {
    const { oid, ticketId } = props
    const ticketModified = await this.ticketRepository.updateOne(
      { oid, id: ticketId, status: { IN: [TicketStatus.Debt, TicketStatus.Completed] } },
      { endedAt: null, status: TicketStatus.Executing }
    )
    return { ticketModified }
  }

  async startTerminal(props: { oid: number; ticketId: string }) {
    const { oid, ticketId } = props

    const PREFIX = `ticketId=${ticketId} startTerminal failed`

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction('READ UNCOMMITTED')
    try {
      const manager = queryRunner.manager
      // === 1. TICKET: Update status để tạo transaction ===
      const ticketModified = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId },
        {
          updatedAt: Date.now(),
          endedAt: null,
          status: TicketStatus.Cancelled,
        }
      )

      if (
        [DeliveryStatus.Partial, DeliveryStatus.Delivered].includes(ticketModified.deliveryStatus)
      ) {
        throw new BusinessError(PREFIX, 'Hàng đã được giao, không thể hủy phiếu')
      }

      if (ticketModified.paidTotal > 0) {
        throw new BusinessError(PREFIX, 'Phiếu đã được thanh toán, không thể hủy phiếu')
      }

      if (ticketModified.debtTotal > 0) {
        throw new BusinessError(PREFIX, 'Phiếu đã có nợ, không thể hủy phiếu')
      }

      await queryRunner.commitTransaction()

      return { ticketModified }
    } catch (error: any) {
      console.error('error:', error)
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
