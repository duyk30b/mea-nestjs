import { TicketProductRepository } from '@libs/database/repositories/ticket-product.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class TicketProductService {
  constructor(private readonly ticketProductRepository: TicketProductRepository) {}

  async destroyZero(oid: number, ticketProductId: string) {
    await this.ticketProductRepository.deleteBasic({
      oid,
      id: ticketProductId,
      quantity: 0,
    })
    return { ticketProductId }
  }
}
