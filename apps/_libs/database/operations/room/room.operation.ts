import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import {
  RoomManager,
  TicketManager,
} from '../../repositories'

@Injectable()
export class RoomOperation {
  constructor(
    private dataSource: DataSource,
    private roomManager: RoomManager,
    private ticketManager: TicketManager,
    @InjectEntityManager() private manager: EntityManager
  ) { }

  async mergeRoom(options: {
    oid: number
    userId: number
    roomIdSourceList: number[]
    roomIdTarget: number
  }) {
    const { oid, userId, roomIdSourceList, roomIdTarget } = options

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const roomSourceList = await this.roomManager.deleteAndReturnEntity(manager, {
        oid,
        id: { IN: roomIdSourceList },
      })

      await this.ticketManager.update(
        manager,
        { oid, roomId: { IN: roomIdSourceList } },
        { roomId: roomIdTarget }
      )

      return { roomDestroyedList: roomSourceList }
    })
  }
}
