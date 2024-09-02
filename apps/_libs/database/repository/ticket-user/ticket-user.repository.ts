import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { TicketUser } from '../../entities'
import {
  TicketUserInsertType,
  TicketUserRelationType,
  TicketUserSortType,
  TicketUserUpdateType,
} from '../../entities/ticket-user.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class TicketUserRepository extends PostgreSqlRepository<
  TicketUser,
  { [P in keyof TicketUserSortType]?: 'ASC' | 'DESC' },
  { [P in keyof TicketUserRelationType]?: boolean },
  TicketUserInsertType,
  TicketUserUpdateType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketUser)
    private ticketUserRepository: Repository<TicketUser>
  ) {
    super(ticketUserRepository)
  }

  async insertOneFullFieldAndReturnEntity<X extends TicketUserInsertType>(
    data: NoExtra<TicketUserInsertType, X>
  ): Promise<TicketUser> {
    const raw = await this.insertOneAndReturnRaw(data)
    return TicketUser.fromRaw(raw)
  }

  async insertManyAndReturnEntity<X extends Partial<TicketUserInsertType>>(
    data: NoExtra<Partial<TicketUserInsertType>, X>[]
  ): Promise<TicketUser[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return TicketUser.fromRaws(raws)
  }

  async insertManyFullFieldAndReturnEntity<X extends TicketUserInsertType>(
    data: NoExtra<TicketUserInsertType, X>[]
  ): Promise<TicketUser[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return TicketUser.fromRaws(raws)
  }

  async updateAndReturnEntity<X extends Partial<TicketUserUpdateType>>(
    condition: BaseCondition<TicketUser>,
    data: NoExtra<Partial<TicketUserUpdateType>, X>
  ): Promise<TicketUser[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return TicketUser.fromRaws(raws)
  }
}
