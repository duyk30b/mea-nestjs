import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../../../_libs/common/cache-data/cache-data.service'
import { PositionType } from '../../../../../../_libs/database/entities/position.entity'
import {
  TicketDestroyTicketRegimenOperation,
  TicketUpdateUserTicketRegimenOperation,
} from '../../../../../../_libs/database/operations'
import { ImageManagerService } from '../../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import {
  TicketUpdateMoneyTicketRegimenBody,
  TicketUpdateUserRequestTicketRegimenBody,
} from '../request'

@Injectable()
export class TicketChangeRegimenService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketDestroyTicketRegimenOperation: TicketDestroyTicketRegimenOperation,
    private readonly ticketUpdateUserTicketRegimenOperation: TicketUpdateUserTicketRegimenOperation
  ) { }

  async destroyTicketRegimen(options: { oid: number; ticketId: string; ticketRegimenId: string }) {
    const { oid, ticketId, ticketRegimenId } = options
    const result = await this.ticketDestroyTicketRegimenOperation.destroyTicketRegimen({
      oid,
      ticketId,
      ticketRegimenId,
    })

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified: result.ticketModified,
      ticketUser: { destroyedList: result.ticketUserDestroyedList || [] },
      ticketRegimen: { destroyedList: [result.ticketRegimenDestroyed] },
      ticketRegimenItem: { destroyedList: result.ticketRegimenItemDestroyedList },
      ticketProcedure: { destroyedList: result.ticketProcedureDestroyedList },
    })

    return { ticketId, ticketRegimenId }
  }

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
