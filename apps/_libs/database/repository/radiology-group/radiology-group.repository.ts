import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, Not, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { RadiologyGroup } from '../../entities'
import {
  RadiologyGroupInsertType,
  RadiologyGroupRelationType,
  RadiologyGroupSortType,
  RadiologyGroupUpdateType,
} from '../../entities/radiology-group.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class RadiologyGroupRepository extends PostgreSqlRepository<
  RadiologyGroup,
  { [P in keyof RadiologyGroupSortType]?: 'ASC' | 'DESC' },
  { [P in keyof RadiologyGroupRelationType]?: boolean },
  RadiologyGroupInsertType,
  RadiologyGroupUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(RadiologyGroup)
    private radiologyGroupRepository: Repository<RadiologyGroup>
  ) {
    super(radiologyGroupRepository)
  }

  F
  async insertOneAndReturnEntity<X extends Partial<RadiologyGroupInsertType>>(
    data: NoExtra<Partial<RadiologyGroupInsertType>, X>
  ): Promise<RadiologyGroup> {
    const raw = await this.insertOneAndReturnRaw(data)
    return RadiologyGroup.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends RadiologyGroupInsertType>(
    data: NoExtra<RadiologyGroupInsertType, X>
  ): Promise<RadiologyGroup> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return RadiologyGroup.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<RadiologyGroupUpdateType>>(
    condition: BaseCondition<RadiologyGroup>,
    data: NoExtra<Partial<RadiologyGroupUpdateType>, X>
  ): Promise<RadiologyGroup[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return RadiologyGroup.fromRaws(raws)
  }

  async replaceAll(oid: number, data: { name: string; id: number }[]) {
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. DELETE OLD ===
      await manager.delete(RadiologyGroup, {
        oid,
        id: Not(In(data.map((i) => i.id))),
      })

      // === 2. INSERT NEW
      const radiologyGroupInsertDto = data
        .filter((i) => i.id === 0)
        .map((i) => {
          const insertDto: RadiologyGroupInsertType = { oid, name: i.name }
          return insertDto
        })
      if (radiologyGroupInsertDto.length) {
        await manager.insert(RadiologyGroup, radiologyGroupInsertDto)
      }

      // === 2. UPDATE EXIST
      const radiologyGroupUpdateDto = data
        .filter((i) => i.id !== 0)
        .map((i) => {
          const updateDto = { id: i.id, name: i.name }
          return updateDto
        })

      if (radiologyGroupUpdateDto.length) {
        await manager.query(
          `
          UPDATE "RadiologyGroup" AS "group"
          SET "name" = temp.name
          FROM (VALUES `
          + radiologyGroupUpdateDto
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
