import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Attribute } from '../entities'
import {
  AttributeInsertType,
  AttributeRelationType,
  AttributeSortType,
  AttributeUpdateType,
} from '../entities/attribute.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class AttributeManager extends _PostgreSqlManager<
  Attribute,
  AttributeRelationType,
  AttributeInsertType,
  AttributeUpdateType,
  AttributeSortType
> {
  constructor() {
    super(Attribute)
  }
}

@Injectable()
export class AttributeRepository extends _PostgreSqlRepository<
  Attribute,
  AttributeRelationType,
  AttributeInsertType,
  AttributeUpdateType,
  AttributeSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Attribute) private attributeRepository: Repository<Attribute>
  ) {
    super(Attribute, attributeRepository)
  }
}
