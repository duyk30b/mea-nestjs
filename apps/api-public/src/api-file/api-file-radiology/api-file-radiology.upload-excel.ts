import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { ESArray } from '../../../../_libs/common/helpers'
import { BusinessError } from '../../../../_libs/database/common/error'
import { RadiologyInsertType } from '../../../../_libs/database/entities/radiology.entity'
import { RadiologyGroupRepository, RadiologyManager } from '../../../../_libs/database/repositories'
import { RadiologyGroupService } from '../../api/master-data/radiology-group/radiology-group.service'
import { ExcelProcess } from '../common/excel-process'
import { RadiologyExcelRules } from './radiology-excel.rule'

const dataPlainExample = {
  _num: 0,
  radiologyCode: '',
  name: '',
  radiologyGroupName: '',
  price: 0,
  costPrice: 0,
} satisfies Record<keyof typeof RadiologyExcelRules, unknown>

type DataPlain = typeof dataPlainExample & {
  radiologyGroupId: number
}

@Injectable()
export class ApiFileRadiologyUploadExcel {
  constructor(
    private dataSource: DataSource,
    private readonly radiologyManager: RadiologyManager,
    private readonly radiologyGroupRepository: RadiologyGroupRepository,
    private readonly radiologyGroupService: RadiologyGroupService
  ) { }

  async uploadExcel(options: { oid: number; userId: number; file: FileUploadDto }) {
    const { oid, userId, file } = options
    const time = Date.now()

    const excelDataGrid = await ExcelProcess.getData({
      file,
      excelRules: RadiologyExcelRules,
      validate: { maxSize: 5 * 1024 * 1024 },
    })

    const dataConvertList = excelDataGrid.map((item) => {
      const dataConvert = {}
      Object.keys(RadiologyExcelRules).forEach((key, index) => {
        dataConvert[key] = item[index]
      })
      return dataConvert as { [P in keyof typeof RadiologyExcelRules]: any }
    })

    const groupNameList = dataConvertList.map((i) => i.radiologyGroupName || '')
    const radiologyGroupList = await this.radiologyGroupService.createByGroupName(
      oid,
      groupNameList
    )
    const radiologyGroupMapName = ESArray.arrayToKeyValue(radiologyGroupList, 'name')

    const dataPlainList: DataPlain[] = dataConvertList.map((item, index) => {
      if (!item.radiologyCode) {
        throw new BusinessError(`Lỗi: Dòng ${index + 2}: Mã CĐHA không được để trống`)
      }
      let radiologyGroupId = 0
      const radiologyGroupName = item.radiologyGroupName
      if (radiologyGroupName) {
        radiologyGroupId = radiologyGroupMapName[radiologyGroupName]?.id || 0
      }
      const dataPlain: DataPlain = {
        _num: item._num || 0,
        radiologyCode: item.radiologyCode,
        name: item.name || '',
        radiologyGroupName: item.radiologyGroupName || '',
        radiologyGroupId,
        costPrice: item.costPrice || 0,
        price: item.price || 0,
      } satisfies DataPlain
      return dataPlain
    })

    await this.processDataPlainList({ oid, userId, dataPlainList, time })
  }

  async processDataPlainList(data: {
    oid: number
    userId: number
    dataPlainList: DataPlain[]
    time: number
  }) {
    const { oid, userId, dataPlainList, time } = data

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // Không cho cập nhật trùng radiologyCode
      const duplicatesBatchId = ESArray.checkDuplicate(dataPlainList, 'radiologyCode')
      duplicatesBatchId.forEach(({ value, indices }) => {
        const indicesString = indices.map((i) => i + 2) // +1 do bắt đầu từ 0
        throw new BusinessError(
          `Có trùng lặp mã CĐHA = ${value} ở dòng ${indicesString.toString()}`
        )
      })

      const radiologyCodeList = dataPlainList.map((i) => i.radiologyCode)
      const radiologyOriginList = await this.radiologyManager.findManyBy(manager, {
        oid,
        radiologyCode: { IN: radiologyCodeList },
      })
      const radiologyOriginMapCode = ESArray.arrayToKeyValue(radiologyOriginList, 'radiologyCode')

      // Phân biệt tạo mới hay cập nhật theo radiologyCode vì đã được gắn ở trên
      const dataPlainInsertList = dataPlainList.filter(
        (i) => !radiologyOriginMapCode[i.radiologyCode]
      )
      const dataPlainUpdateList = dataPlainList.filter(
        (i) => !!radiologyOriginMapCode[i.radiologyCode]
      )

      // === 1. Trường hợp 1: Tạo mới Radiology
      if (dataPlainInsertList.length) {
        const radiologyInsertList = dataPlainInsertList.map((plain) => {
          const radiologyInsert: RadiologyInsertType = {
            oid,
            radiologyCode: plain.radiologyCode,
            name: plain.name,
            radiologyGroupId: plain.radiologyGroupId,
            costPrice: plain.costPrice,
            price: plain.price,
            printHtmlId: 0,
            requestNoteDefault: '',
            descriptionDefault: '',
            resultDefault: '',
            customStyles: '',
            customVariables: '',
          }
          return radiologyInsert
        })

        await this.radiologyManager.insertManyAndReturnEntity(manager, radiologyInsertList)
      }

      // === 2. Trường hợp 2: Cập nhật Radiology
      if (dataPlainUpdateList.length) {
        await this.radiologyManager.bulkUpdate({
          manager,
          condition: { oid, id: { NOT: 0 } },
          compare: ['radiologyCode'],
          tempList: dataPlainUpdateList,
          update: ['name', 'radiologyGroupId', 'price', 'costPrice'],
          options: { requireEqualLength: true },
        })
      }
    })
  }
}
