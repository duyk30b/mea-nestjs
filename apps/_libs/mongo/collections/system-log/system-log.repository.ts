import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { BaseMongoRepository } from '../../base-mongo.repository'
import {
  SystemLog,
  SystemLogInsertType,
  SystemLogType,
  SystemLogUpdateType,
} from './system-log.schema'

@Injectable()
export class SystemLogRepository extends BaseMongoRepository<
  SystemLog,
  SystemLogType,
  { [P in '_id']?: 'ASC' | 'DESC' },
  { [P in never]?: boolean },
  SystemLogInsertType,
  SystemLogUpdateType
> {
  constructor(
    @InjectModel(SystemLog.name)
    private readonly systemLogModel: Model<SystemLog>
  ) {
    super(systemLogModel)
  }
}
