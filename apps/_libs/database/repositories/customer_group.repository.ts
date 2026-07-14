import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, Not, Repository } from 'typeorm'
import { GenerateId } from '../common/generate-id'
import { CustomerGroup } from '../entities'
import {
  CustomerGroupInsertType,
  CustomerGroupRelationType,
  CustomerGroupSortType,
  CustomerGroupUpdateType,
} from '../entities/customer_group.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class CustomerGroupManager extends _PostgreSqlManager<
  CustomerGroup,
  CustomerGroupRelationType,
  CustomerGroupInsertType,
  CustomerGroupUpdateType,
  CustomerGroupSortType
> {
  constructor() {
    super(CustomerGroup)
  }
}

@Injectable()
export class CustomerGroupRepository extends _PostgreSqlRepository<
  CustomerGroup,
  CustomerGroupRelationType,
  CustomerGroupInsertType,
  CustomerGroupUpdateType,
  CustomerGroupSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(CustomerGroup) private customerGroupRepository: Repository<CustomerGroup>
  ) {
    super(CustomerGroup, customerGroupRepository)
  }

  async replaceAll(oid: number, data: { name: string; id: string }[]) {
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. DELETE OLD ===
      await manager.delete(CustomerGroup, {
        oid,
        id: Not(In(data.map((i) => i.id))),
      })

      // === 2. INSERT NEW
      const customerGroupInsertDto = data
        .filter((i) => i.id === '0')
        .map((i) => {
          const insertDto: CustomerGroupInsertType = {
            oid,
            id: GenerateId.nextId(),
            name: i.name,
          }
          return insertDto
        })
      if (customerGroupInsertDto.length) {
        await manager.insert(CustomerGroup, customerGroupInsertDto)
      }

      // === 2. UPDATE EXIST
      const customerGroupUpdateDto = data
        .filter((i) => i.id !== '0')
        .map((i) => {
          const updateDto = { id: i.id, name: i.name }
          return updateDto
        })

      if (customerGroupUpdateDto.length) {
        await manager.query(
          `
          UPDATE "CustomerGroup" AS "group"
          SET "name" = temp.name
          FROM (VALUES `
          + customerGroupUpdateDto.map(({ id, name }) => `('${id}', '${name}')`).join(', ')
          + `   ) AS temp("id", "name")
          WHERE   "group"."id" = temp."id"::bigint
              AND "group"."oid" = ${oid} 
          `
        )
      }
      return
    })
  }
}
