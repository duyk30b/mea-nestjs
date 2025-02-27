/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { TicketAttributeInsertType } from '../../../../../_libs/database/entities/ticket-attribute.entity'
import {
  TicketAttributeRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  TicketClinicUpdateTicketAttributeListBody,
} from './request'

@Injectable()
export class ApiTicketClinicAttributeService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketAttributeRepository: TicketAttributeRepository
  ) { }

  async updateTicketAttributeList(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateTicketAttributeListBody
  }) {
    const { oid, ticketId, body } = options
    const ticketAttributeKeyList = body.ticketAttributeList.map((i) => i.key)

    await this.ticketAttributeRepository.delete({
      oid,
      ticketId,
      key: { IN: ticketAttributeKeyList },
    })

    const ticketAttributeInsertList = body.ticketAttributeList
      .filter((i) => !!i.value)
      .map((i) => {
        const dto: TicketAttributeInsertType = {
          oid,
          ticketId,
          key: i.key,
          value: i.value,
        }
        return dto
      })
    const ticketAttributeList =
      await this.ticketAttributeRepository.insertManyAndReturnEntity(ticketAttributeInsertList)

    this.socketEmitService.ticketClinicUpdateTicketAttributeList(oid, {
      ticketId,
      ticketAttributeList,
    })

    return { data: true }
  }
}
