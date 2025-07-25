import { Injectable } from '@nestjs/common'
import { PrintHtmlSettingInsertType } from '../../../../_libs/database/entities/print-html-setting.entity'
import {
  PrintHtmlSettingManager,
  PrintHtmlSettingRepository,
} from '../../../../_libs/database/repositories/print-html-setting.repository'
import { PrintHtmlSettingGetManyQuery, PrintHtmlSettingReplaceAllBody } from './request'

@Injectable()
export class ApiPrintHtmlSettingService {
  constructor(
    private readonly printHtmlRepository: PrintHtmlSettingRepository,
    private readonly printHtmlManager: PrintHtmlSettingManager
  ) { }

  async getList(oid: number, query: PrintHtmlSettingGetManyQuery) {
    const { limit, filter, relation, sort } = query

    const printHtmlSettingList = await this.printHtmlRepository.findMany({
      relation,
      condition: {
        oid: { IN: [1, oid] },
      },
      limit,
      sort,
    })
    return { printHtmlSettingList }
  }

  async replaceAll(oid: number, body: PrintHtmlSettingReplaceAllBody) {
    const idAll = body.replaceAll.map((i) => i.id)
    await this.printHtmlRepository.delete({ oid, id: { NOT_IN: idAll } })

    const printHtmlInsertList = body.replaceAll
      .filter((i) => i.id === 0)
      .map((i) => {
        const insertList: PrintHtmlSettingInsertType = {
          ...i,
          oid,
        }
        return insertList
      })
    await this.printHtmlRepository.insertManyFullFieldAndReturnEntity(printHtmlInsertList)

    const replaceAll = body.replaceAll.filter((i) => !!i.id)

    await this.printHtmlManager.bulkUpdate({
      manager: this.printHtmlRepository.getManager(),
      condition: { oid },
      compare: ['id'],
      update: ['printHtmlType', 'printHtmlId'],
      tempList: replaceAll,
      options: { requireEqualLength: true },
    })

    return true
  }
}
