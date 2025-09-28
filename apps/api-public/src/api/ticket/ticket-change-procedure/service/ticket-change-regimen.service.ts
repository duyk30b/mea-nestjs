import { Injectable } from '@nestjs/common'
import { PositionType } from '../../../../../../_libs/database/entities/position.entity'
import {
  TicketUpdateUserTicketRegimenOperation,
} from '../../../../../../_libs/database/operations'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import {
  TicketUpdateMoneyTicketRegimenBody,
  TicketUpdateUserRequestTicketRegimenBody,
} from '../request'

@Injectable()
export class TicketChangeRegimenService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketUpdateUserTicketRegimenOperation: TicketUpdateUserTicketRegimenOperation
  ) { }

  async updateMoneyTicketRegimen(options: {
    oid: number
    ticketId: string
    ticketRegimenId: string
    body: TicketUpdateMoneyTicketRegimenBody
  }) {
    const { oid, ticketId, ticketRegimenId, body } = options
    // const updateResult =
    //   await this.ticketUpdateMoneyTicketRegimenOperation.updateMoneyTicketRegimen({
    //     oid,
    //     ticketId,
    //     ticketRegimenId,
    //     ticketRegimenUpdate: body.ticketRegimenUpdate,
    //     ticketRegimenItemUpdateList: body.ticketRegimenItemUpdateList,
    //   })
    // const { ticketRegimenModified } = updateResult

    // this.socketEmitService.socketTicketChange(oid, {
    //   ticketId,
    //   ticketModified: updateResult.ticketModified,
    //   ticketRegimen: { upsertedList: [updateResult.ticketRegimenModified] },
    //   ticketRegimenItem: { upsertedList: updateResult.ticketRegimenItemModifiedList },
    //   ticketUser: {
    //     upsertedList: updateResult.ticketUserCreatedList,
    //     destroyedList: updateResult.ticketUserDestroyedList,
    //   },
    // })

    // return { ticketRegimenModified }
  }

  async updateUserRequestTicketRegimen(options: {
    oid: number
    ticketId: string
    ticketRegimenId: string
    body: TicketUpdateUserRequestTicketRegimenBody
  }) {
    const { oid, ticketId, ticketRegimenId, body } = options
    const updateResult = await this.ticketUpdateUserTicketRegimenOperation.updateUserTicketRegimen({
      oid,
      ticketId,
      ticketRegimenId,
      positionType: PositionType.RegimenRequest,
      ticketUserRequestList: body.ticketUserRequestList,
    })
    const { ticketModified, ticketRegimenModified } = updateResult

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified: updateResult.ticketModified,
      ticketRegimen: { upsertedList: [updateResult.ticketRegimenModified] },
      ticketUser: {
        upsertedList: updateResult.ticketUserCreatedList,
        destroyedList: updateResult.ticketUserDestroyedList,
      },
    })

    return { ticketRegimenModified }
  }
}
