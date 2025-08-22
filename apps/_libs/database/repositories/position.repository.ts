import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Position } from '../entities'
import {
  PositionInsertType,
  PositionRelationType,
  PositionSortType,
  PositionUpdateType,
} from '../entities/position.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PositionManager extends _PostgreSqlManager<
  Position,
  PositionRelationType,
  PositionInsertType,
  PositionUpdateType,
  PositionSortType
> {
  constructor() {
    super(Position)
  }
}

@Injectable()
export class PositionRepository extends _PostgreSqlRepository<
  Position,
  PositionRelationType,
  PositionInsertType,
  PositionUpdateType,
  PositionSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Position) private positionRepository: Repository<Position>
  ) {
    super(Position, positionRepository)
  }
}
