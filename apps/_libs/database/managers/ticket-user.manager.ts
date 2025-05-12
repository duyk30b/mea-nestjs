import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { TicketUser } from '../entities'
import { InteractType } from '../entities/commission.entity'
import {
  TicketUserInsertType,
  TicketUserRelationType,
  TicketUserSortType,
  TicketUserUpdateType,
} from '../entities/ticket-user.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class TicketUserManager extends _PostgreSqlManager<
  TicketUser,
  TicketUserRelationType,
  TicketUserInsertType,
  TicketUserUpdateType,
  TicketUserSortType
> {
  constructor() {
    super(TicketUser)
  }

  async changeQuantityByTicketItem(options: {
    manager: EntityManager
    information: {
      oid: number
      ticketId: number
      interactType: InteractType
    }
    dataChange?: { ticketItemId: number; quantity: number }[]
  }) {
    const { manager, information, dataChange } = options
    const { oid, ticketId } = information

    const modifiedRaw: [any[], number] = await manager.query(
      `
        UPDATE  "TicketUser"
        SET     "quantity"  = temp."quantity"
        FROM (VALUES `
      + dataChange
        .map(({ ticketItemId, quantity }) => {
          return `(${ticketItemId}, ${quantity})`
        })
        .join(', ')
      + `   ) AS temp("ticketItemId", "quantity")
        WHERE   "TicketUser"."oid"          = ${oid}
            AND "TicketUser"."ticketId"     = ${ticketId}
            AND "TicketUser"."interactType" = ${information.interactType}
            AND "TicketUser"."ticketItemId" = temp."ticketItemId"
        RETURNING "TicketUser".*;
        `
    )
    const modifiedList = TicketUser.fromRaws(modifiedRaw[0])
    const ticketUserModifiedList = modifiedList.filter((i) => i.quantity > 0)
    const emptyList = modifiedList.filter((i) => i.quantity === 0)
    let ticketUserDestroyedList: TicketUser[] = []
    if (emptyList.length) {
      ticketUserDestroyedList = await this.deleteAndReturnEntity(manager, {
        oid,
        ticketId,
        id: { IN: emptyList.map((i) => i.id) },
      })
    }
    return { ticketUserModifiedList, ticketUserDestroyedList }
  }
}
