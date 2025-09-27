import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../../../_libs/common/cache-data/cache-data.service'
import { TicketUpdateMoneyTicketProcedureOperation } from '../../../../../../_libs/database/operations'
import { ImageManagerService } from '../../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { TicketUpdateMoneyTicketProcedureBody } from '../request'

@Injectable()
export class TicketChangeProcedureService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketUpdateMoneyTicketProcedureOperation: TicketUpdateMoneyTicketProcedureOperation
  ) { }

  async updateMoneyTicketProcedure(options: {
    oid: number
    ticketId: string
    ticketProcedureId: string
    body: TicketUpdateMoneyTicketProcedureBody
  }) {
    const { oid, ticketId, ticketProcedureId, body } = options
    const updateResult =
      await this.ticketUpdateMoneyTicketProcedureOperation.updateMoneyTicketProcedure({
        oid,
        ticketId,
        ticketProcedureId,
        ticketProcedureUpdateDto: body,
      })
    const { ticketModified, ticketProcedureModified } = updateResult

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified,
      ticketUser: {
        destroyedList: updateResult.ticketUserDestroyedList || [],
        upsertedList: updateResult.ticketUserCreatedList || [],
      },
      ticketProcedure: { upsertedList: [ticketProcedureModified] },
    })

    return { ticketProcedureModified }
  }
}
