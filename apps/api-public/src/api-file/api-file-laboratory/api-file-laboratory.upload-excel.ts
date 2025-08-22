import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { ESArray } from '../../../../_libs/common/helpers'
import { BusinessError } from '../../../../_libs/database/common/error'
import {
  LaboratoryInsertType,
  LaboratoryValueType,
} from '../../../../_libs/database/entities/laboratory.entity'
import { LaboratoryGroupRepository, LaboratoryManager } from '../../../../_libs/database/repositories'
import { ApiLaboratoryGroupService } from '../../api/api-laboratory-group/api-laboratory-group.service'
import { ExcelProcess } from '../common/excel-process'
import { LaboratoryExcelRules } from './laboratory-excel.rule'

const dataPlainExample = {
  _num: 0,
  laboratoryCode: '',
  name: '',
  price: 0,
  costPrice: 0,
  laboratoryGroupName: '',
  unit: '',
  lowValue: 0,
  highValue: 0,
} satisfies Record<keyof typeof LaboratoryExcelRules, unknown>

type DataPlain = typeof dataPlainExample & {
  laboratoryGroupId: number
}

@Injectable()
export class ApiFileLaboratoryUploadExcel {
  constructor(
    private dataSource: DataSource,
    private readonly laboratoryManager: LaboratoryManager,
    private readonly laboratoryGroupRepository: LaboratoryGroupRepository,
    private readonly apiLaboratoryGroupService: ApiLaboratoryGroupService
  ) { }

  async uploadExcel(options: { oid: number; userId: number; file: FileUploadDto }) {
    const { oid, userId, file } = options
    const time = Date.now()

    const excelDataGrid = await ExcelProcess.getData({
      file,
      excelRules: LaboratoryExcelRules,
      validate: { maxSize: 5 * 1024 * 1024 },
    })

    const dataConvertList = excelDataGrid.map((item) => {
      const dataConvert = {}
      Object.keys(LaboratoryExcelRules).forEach((key, index) => {
        dataConvert[key] = item[index]
      })
      return dataConvert as { [P in keyof typeof LaboratoryExcelRules]: any }
    })

    const groupNameList = dataConvertList.map((i) => i.laboratoryGroupName || '')
    const laboratoryGroupList = await this.apiLaboratoryGroupService.createByGroupName(
      oid,
      groupNameList
    )
    const laboratoryGroupMapName = ESArray.arrayToKeyValue(laboratoryGroupList, 'name')

    const dataPlainList: DataPlain[] = dataConvertList.map((item, index) => {
      if (!item.laboratoryCode) {
        throw new BusinessError(`Lỗi: Dòng ${index + 2}: Mã xét nghiệm không được để trống`)
      }
      let laboratoryGroupId = 0
      const laboratoryGroupName = item.laboratoryGroupName
      if (laboratoryGroupName) {
        laboratoryGroupId = laboratoryGroupMapName[laboratoryGroupName]?.id || 0
      }
      const dataPlain: DataPlain = {
        _num: item._num || 0,
        laboratoryCode: item.laboratoryCode,
        name: item.name || '',
        price: item.price || 0,
        costPrice: item.costPrice || 0,
        laboratoryGroupName: item.laboratoryGroupName || '',
        laboratoryGroupId,
        lowValue: item.lowValue || 0,
        highValue: item.highValue || 0,
        unit: item.unit || '',
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
      // Không cho cập nhật trùng laboratoryCode
      const duplicatesBatchId = ESArray.checkDuplicate(dataPlainList, 'laboratoryCode')
      duplicatesBatchId.forEach(({ value, indices }) => {
        const indicesString = indices.map((i) => i + 2) // +1 do bắt đầu từ 0
        throw new BusinessError(
          `Có trùng lặp mã xét nghiệm = ${value} ở dòng ${indicesString.toString()}`
        )
      })

      const laboratoryCodeList = dataPlainList.map((i) => i.laboratoryCode)
      const laboratoryOriginList = await this.laboratoryManager.findManyBy(manager, {
        oid,
        laboratoryCode: { IN: laboratoryCodeList },
      })
      const laboratoryOriginMapCode = ESArray.arrayToKeyValue(
        laboratoryOriginList,
        'laboratoryCode'
      )

      // Phân biệt tạo mới hay cập nhật theo laboratoryCode vì đã được gắn ở trên
      const dataPlainInsertList = dataPlainList.filter(
        (i) => !laboratoryOriginMapCode[i.laboratoryCode]
      )
      const dataPlainUpdateList = dataPlainList.filter(
        (i) => !!laboratoryOriginMapCode[i.laboratoryCode]
      )

      // === 1. Trường hợp 1: Tạo mới Laboratory
      if (dataPlainInsertList.length) {
        const laboratoryInsertList = dataPlainInsertList.map((plain) => {
          const laboratoryInsert: LaboratoryInsertType = {
            oid,
            laboratoryCode: plain.laboratoryCode,
            name: plain.name,
            costPrice: plain.costPrice,
            price: plain.price,
            laboratoryGroupId: plain.laboratoryGroupId,
            priority: 0,
            level: 1,
            parentId: 0,
            valueType: LaboratoryValueType.Number,
            unit: plain.unit,
            lowValue: plain.lowValue,
            highValue: plain.highValue,
            options: '',
          }
          return laboratoryInsert
        })
        const laboratoryCreatedList = await this.laboratoryManager.insertManyAndReturnEntity(
          manager,
          laboratoryInsertList
        )

        await this.laboratoryManager.updateAndReturnEntity(
          manager,
          { oid, id: { IN: laboratoryCreatedList.map((i) => i.id) } },
          { parentId: () => '"id"' }
        )
      }

      // === 2. Trường hợp 2: Cập nhật Laboratory
      if (dataPlainUpdateList.length) {
        await this.laboratoryManager.bulkUpdate({
          manager,
          condition: { oid, id: { NOT: 0 } },
          compare: ['laboratoryCode'],
          tempList: dataPlainUpdateList,
          update: [
            'name',
            'laboratoryGroupId',
            'costPrice',
            'price',
            'lowValue',
            'highValue',
            'unit',
          ],
          options: { requireEqualLength: true },
        })
      }
    })
  }
}
