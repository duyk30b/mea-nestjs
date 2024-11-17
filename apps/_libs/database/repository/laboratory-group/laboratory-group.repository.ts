import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, Not, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { LaboratoryGroup } from '../../entities'
import {
  LaboratoryGroupInsertType,
  LaboratoryGroupRelationType,
  LaboratoryGroupSortType,
  LaboratoryGroupUpdateType,
} from '../../entities/laboratory-group.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class LaboratoryGroupRepository extends PostgreSqlRepository<
  LaboratoryGroup,
  { [P in keyof LaboratoryGroupSortType]?: 'ASC' | 'DESC' },
  { [P in keyof LaboratoryGroupRelationType]?: boolean },
  LaboratoryGroupInsertType,
  LaboratoryGroupUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(LaboratoryGroup)
    private laboratoryGroupRepository: Repository<LaboratoryGroup>
  ) {
    super(laboratoryGroupRepository)
  }

  F
  async insertOneAndReturnEntity<X extends Partial<LaboratoryGroupInsertType>>(
    data: NoExtra<Partial<LaboratoryGroupInsertType>, X>
  ): Promise<LaboratoryGroup> {
    const raw = await this.insertOneAndReturnRaw(data)
    return LaboratoryGroup.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends LaboratoryGroupInsertType>(
    data: NoExtra<LaboratoryGroupInsertType, X>
  ): Promise<LaboratoryGroup> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return LaboratoryGroup.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<LaboratoryGroupUpdateType>>(
    condition: BaseCondition<LaboratoryGroup>,
    data: NoExtra<Partial<LaboratoryGroupUpdateType>, X>
  ): Promise<LaboratoryGroup[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return LaboratoryGroup.fromRaws(raws)
  }

  async replaceAll(oid: number, data: { name: string; id: number }[]) {
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. DELETE OLD ===
      await manager.delete(LaboratoryGroup, {
        oid,
        id: Not(In(data.map((i) => i.id))),
      })

      // === 2. INSERT NEW
      const laboratoryGroupInsertDto = data
        .filter((i) => i.id === 0)
        .map((i) => {
          const insertDto: LaboratoryGroupInsertType = { oid, name: i.name }
          return insertDto
        })
      if (laboratoryGroupInsertDto.length) {
        await manager.insert(LaboratoryGroup, laboratoryGroupInsertDto)
      }

      // === 2. UPDATE EXIST
      const laboratoryGroupUpdateDto = data
        .filter((i) => i.id !== 0)
        .map((i) => {
          const updateDto = { id: i.id, name: i.name }
          return updateDto
        })

      if (laboratoryGroupUpdateDto.length) {
        await manager.query(
          `
          UPDATE "LaboratoryGroup" AS "group"
          SET "name" = temp.name
          FROM (VALUES `
          + laboratoryGroupUpdateDto
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
