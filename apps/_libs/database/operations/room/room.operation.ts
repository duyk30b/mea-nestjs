import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { BusinessError } from '../../common/error'
import { RoomManager, TicketManager } from '../../repositories'

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
      if (roomIdSourceList.length !== roomIdSourceList.length) {
        throw new BusinessError('ID phòng không phù hợp')
      }

      await this.ticketManager.update(
        manager,
        { oid, roomId: { IN: roomIdSourceList } },
        { roomId: roomIdTarget }
      )

      return { roomDestroyedList: roomSourceList }
    })
  }
}
