import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, Not, Repository } from 'typeorm'
import { LaboratoryGroup } from '../entities'
import {
  LaboratoryGroupInsertType,
  LaboratoryGroupRelationType,
  LaboratoryGroupReplaceType,
  LaboratoryGroupSortType,
  LaboratoryGroupUpdateType,
} from '../entities/laboratory-group.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class LaboratoryGroupRepository extends _PostgreSqlRepository<
  LaboratoryGroup,
  LaboratoryGroupRelationType,
  LaboratoryGroupInsertType,
  LaboratoryGroupUpdateType,
  LaboratoryGroupSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(LaboratoryGroup)
    private laboratoryGroupRepository: Repository<LaboratoryGroup>
  ) {
    super(LaboratoryGroup, laboratoryGroupRepository)
  }

  async replaceAll(
    oid: number,
    laboratoryGroupListDto: { name: string; printHtmlId: number; id: number }[]
  ) {
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. DELETE OLD ===
      await manager.delete(LaboratoryGroup, {
        oid,
        id: Not(In(laboratoryGroupListDto.map((i) => i.id))),
      })

      // === 2. INSERT NEW
      const laboratoryGroupInsertDto = laboratoryGroupListDto
        .filter((i) => i.id === 0)
        .map((i) => {
          const insertDto: LaboratoryGroupInsertType = {
            oid,
            name: i.name,
            printHtmlId: i.printHtmlId,
          }
          return insertDto
        })
      if (laboratoryGroupInsertDto.length) {
        await manager.insert(LaboratoryGroup, laboratoryGroupInsertDto)
      }

      // === 2. UPDATE EXIST
      const laboratoryGroupUpdateDto = laboratoryGroupListDto
        .filter((i) => i.id !== 0)
        .map((i) => {
          const updateDto: LaboratoryGroupReplaceType = {
            id: i.id,
            name: i.name,
            printHtmlId: i.printHtmlId,
          }
          return updateDto
        })

      if (laboratoryGroupUpdateDto.length) {
        await manager.query(
          `
          UPDATE  "LaboratoryGroup" AS "group"
          SET     "name"        = temp.name,
                  "printHtmlId" = temp."printHtmlId"
          FROM (VALUES `
          + laboratoryGroupUpdateDto.map(({ id, name, printHtmlId }) => {
            return `(${id}, '${name}', ${printHtmlId})`
          }).join(', ')
          + `   ) AS temp("id", "name", "printHtmlId")
          WHERE   "group"."id" = temp."id" 
              AND "group"."oid" = ${oid} 
          `
        )
      }
      return
    })
  }
}
