import { TicketStatus } from '@libs/database/entities/ticket.entity'
import {
  ImageManager,
  ImageRepository,
  OrganizationRepository,
  TicketRadiologyRepository,
  TicketRepository,
  UserRepository,
} from '@libs/database/repositories'
import { Injectable, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { TicketCancelService } from '../../api/ticket/ticket-action/ticket-cancel.service'
import { RootMigrationDataBody } from './request/root-migration-data.body'

@Injectable()
export class ApiRootDataService {
  private logger = new Logger(ApiRootDataService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly organizationRepository: OrganizationRepository,
    private readonly userRepository: UserRepository,
    private readonly imageRepository: ImageRepository,
    private readonly imageManager: ImageManager,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketCancelService: TicketCancelService,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository
  ) { }

  async startMigrationData(body: RootMigrationDataBody) {
    if (body.key !== '8aobvoyupp8') return
    // const ticketCancelList = await this.ticketRepository.findManyBy({
    //   status: TicketStatus.Cancelled,
    // })

    // for (let i = 0; i < ticketCancelList.length; i++) {
    //   const ticketCancel = ticketCancelList[i]
    //   await this.ticketCancelService.destroy({ oid: ticketCancel.oid, ticketId: ticketCancel.id })
    // }
    // return { ticketCancelList }
  }
}
