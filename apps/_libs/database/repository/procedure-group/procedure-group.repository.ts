import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, Not, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { ProcedureGroup } from '../../entities'
import {
  ProcedureGroupInsertType,
  ProcedureGroupRelationType,
  ProcedureGroupSortType,
  ProcedureGroupUpdateType,
} from '../../entities/procedure-group.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ProcedureGroupRepository extends PostgreSqlRepository<
  ProcedureGroup,
  { [P in keyof ProcedureGroupSortType]?: 'ASC' | 'DESC' },
  { [P in keyof ProcedureGroupRelationType]?: boolean },
  ProcedureGroupInsertType,
  ProcedureGroupUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(ProcedureGroup) private procedureGroupRepository: Repository<ProcedureGroup>
  ) {
    super(procedureGroupRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<ProcedureGroupInsertType>>(
    data: NoExtra<Partial<ProcedureGroupInsertType>, X>
  ): Promise<ProcedureGroup> {
    const raw = await this.insertOneAndReturnRaw(data)
    return ProcedureGroup.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends ProcedureGroupInsertType>(
    data: NoExtra<ProcedureGroupInsertType, X>
  ): Promise<ProcedureGroup> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return ProcedureGroup.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<ProcedureGroupUpdateType>>(
    condition: BaseCondition<ProcedureGroup>,
    data: NoExtra<Partial<ProcedureGroupUpdateType>, X>
  ): Promise<ProcedureGroup[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return ProcedureGroup.fromRaws(raws)
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
          + procedureGroupUpdateDto
            .map(({ id, name }) => `(${id}, '${name}')`)
            .join(', ')
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
