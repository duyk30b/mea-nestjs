import { PrintSettingInsertType } from '@libs/database/entities/print-setting.entity'
import {
    PrintSettingManager,
    PrintSettingRepository,
} from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { PrintSettingGetManyQuery, PrintSettingReplaceAllBody } from './request'

@Injectable()
export class PrintSettingService {
  constructor(
    private readonly templateHtmlRepository: PrintSettingRepository,
    private readonly templateHtmlManager: PrintSettingManager
  ) { }

  async getList(oid: number, query: PrintSettingGetManyQuery) {
    const { limit, filter, relation, sort } = query

    const printSettingList = await this.templateHtmlRepository.findMany({
      relation,
      condition: {
        oid: { IN: [1, oid] },
      },
      limit,
      sort,
    })
    return { printSettingList }
  }

  async replaceAll(oid: number, body: PrintSettingReplaceAllBody) {
    const idAll = body.replaceAll.map((i) => i.id)
    await this.templateHtmlRepository.deleteBasic({ oid, id: { NOT_IN: idAll } })

    const templateHtmlInsertList = body.replaceAll
      .filter((i) => i.id === 0)
      .map((i) => {
        const insertList: PrintSettingInsertType = {
          ...i,
          oid,
        }
        return insertList
      })
    await this.templateHtmlRepository.insertMany(templateHtmlInsertList)

    const replaceAll = body.replaceAll.filter((i) => !!i.id)

    await this.templateHtmlManager.bulkUpdate({
      manager: this.templateHtmlRepository.getManager(),
      condition: { oid },
      compare: ['id'],
      update: ['templateHtmlType', 'templateHtmlId'],
      tempList: replaceAll,
      options: { requireEqualLength: true },
    })

    return true
  }
}
