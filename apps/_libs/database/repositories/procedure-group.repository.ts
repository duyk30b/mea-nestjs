import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, Not, Repository } from 'typeorm'
import { ProcedureGroup } from '../entities'
import {
  ProcedureGroupInsertType,
  ProcedureGroupRelationType,
  ProcedureGroupSortType,
  ProcedureGroupUpdateType,
} from '../entities/procedure-group.entity'
import { _PostgreSqlManager } from '../managers/_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class ProcedureGroupManager extends _PostgreSqlManager<
  ProcedureGroup,
  ProcedureGroupRelationType,
  ProcedureGroupInsertType,
  ProcedureGroupUpdateType,
  ProcedureGroupSortType
> {
  constructor() {
    super(ProcedureGroup)
  }
}

@Injectable()
export class ProcedureGroupRepository extends _PostgreSqlRepository<
  ProcedureGroup,
  ProcedureGroupRelationType,
  ProcedureGroupInsertType,
  ProcedureGroupUpdateType,
  ProcedureGroupSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(ProcedureGroup) private procedureGroupRepository: Repository<ProcedureGroup>
  ) {
    super(ProcedureGroup, procedureGroupRepository)
  }

  async replaceAll(oid: number, data: { name: string; id: number }[]) {
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. DELETE OLD ===
      await manager.delete(ProcedureGroup, {
        oid,
        id: Not(In(data.map((i) => i.id))),
      })

      // === 2. INSERT NEW
      const procedureGroupInsertDto = data
        .filter((i) => i.id === 0)
        .map((i) => {
          const insertDto: ProcedureGroupInsertType = { oid, name: i.name }
          return insertDto
        })
      if (procedureGroupInsertDto.length) {
        await manager.insert(ProcedureGroup, procedureGroupInsertDto)
      }

      // === 2. UPDATE EXIST
      const procedureGroupUpdateDto = data
        .filter((i) => i.id !== 0)
        .map((i) => {
          const updateDto = { id: i.id, name: i.name }
          return updateDto
        })

      if (procedureGroupUpdateDto.length) {
        await manager.query(
          `
          UPDATE "ProcedureGroup" AS "group"
          SET "name" = temp.name
          FROM (VALUES `
          + procedureGroupUpdateDto.map(({ id, name }) => `(${id}, '${name}')`).join(', ')
          + `   ) AS temp("id", "name")
          WHERE   "group"."id" = temp."id" 
              AND "group"."oid" = ${oid} 
          `
        )
      }
      return
    })
  }
}
