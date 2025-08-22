import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, FindOptionsWhere, In, Not, Repository } from 'typeorm'
import { Laboratory } from '../entities'
import {
  LaboratoryChildUpdateType,
  LaboratoryInsertType,
  LaboratoryRelationType,
  LaboratorySortType,
  LaboratoryUpdateType,
} from '../entities/laboratory.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class LaboratoryManager extends _PostgreSqlManager<
  Laboratory,
  LaboratoryRelationType,
  LaboratoryInsertType,
  LaboratoryUpdateType,
  LaboratorySortType
> {
  constructor() {
    super(Laboratory)
  }
}

@Injectable()
export class LaboratoryRepository extends _PostgreSqlRepository<
  Laboratory,
  LaboratoryRelationType,
  LaboratoryInsertType,
  LaboratoryUpdateType,
  LaboratorySortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Laboratory) private laboratoryRepository: Repository<Laboratory>
  ) {
    super(Laboratory, laboratoryRepository)
  }

  async updateChildren(
    payload: {
      oid: number,
      laboratoryParent: Laboratory,
      laboratoryChildrenDtoList: LaboratoryChildUpdateType[]
    }
  ) {
    const { oid, laboratoryParent, laboratoryChildrenDtoList } = payload
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. DELETE OLD ===
      const whereTicketDelete: FindOptionsWhere<Laboratory> = {
        oid,
        id: Not(In(laboratoryChildrenDtoList.map((i) => i.id))),
        parentId: laboratoryParent.id,
        level: 2,
      }
      await manager.delete(Laboratory, whereTicketDelete)

      // === 2. INSERT NEW
      const laboratoryInsertList = laboratoryChildrenDtoList
        .filter((i) => i.id === 0)
        .map((i) => {
          const laboratoryInsert: LaboratoryInsertType = {
            ...i,
            oid,
            parentId: laboratoryParent.id,
            laboratoryGroupId: laboratoryParent.laboratoryGroupId,
            level: 2,
          }
          return laboratoryInsert
        })
      if (laboratoryInsertList.length) {
        await manager.insert(Laboratory, laboratoryInsertList)
      }

      // === 2. UPDATE EXIST
      const laboratoryUpdateList = laboratoryChildrenDtoList
        .filter((i) => i.id !== 0)
        .map((i) => {
          const updateDto: LaboratoryChildUpdateType = {
            ...i,
          }
          return updateDto
        })

      if (laboratoryUpdateList.length) {
        const laboratoryUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE  "Laboratory" AS "laboratory"
          SET     "priority" = temp.priority,
                  "name" = temp.name,
                  "laboratoryGroupId" = ${laboratoryParent.laboratoryGroupId},
                  "price" = temp.price,
                  "valueType" = temp."valueType",
                  "unit" = temp.unit,
                  "lowValue" = temp."lowValue",
                  "highValue" = temp."highValue",
                  "options" = temp.options
          FROM (VALUES `
          + laboratoryUpdateList.map((i) => {
            return `(${i.id}, ${i.priority}, '${i.name}', ${i.price}, 
                    ${i.valueType}, '${i.unit}', ${i.lowValue}, 
                    ${i.highValue}, '${i.options}'
                    )`
          }).join(', ')
          + `   ) AS temp("id", "priority", "name", "price", 
                          "valueType", "unit", "lowValue", 
                          "highValue", "options"
                          )
          WHERE   "laboratory"."id" = temp."id" 
              AND "laboratory"."oid" = ${oid} 
              AND "laboratory"."parentId" = ${laboratoryParent.id} 
              AND "laboratory"."level" = 2
          `
        )

        if (laboratoryUpdateResult[1] != laboratoryUpdateList.length) {
          throw new Error(`Update Laboratory children failed, 
            affected = ${laboratoryUpdateResult[1]}`)
        }
      }
      return
    })
  }
}
