import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { ESArray } from '../../../../_libs/common/helpers'
import { BusinessError } from '../../../../_libs/database/common/error'
import {
  ProcedureInsertType,
  ProcedureType,
} from '../../../../_libs/database/entities/procedure.entity'
import { ProcedureGroupRepository, ProcedureManager } from '../../../../_libs/database/repositories'
import { ApiProcedureGroupService } from '../../api/api-procedure-group/api-procedure-group.service'
import { ExcelProcess } from '../common/excel-process'
import { ProcedureExcelRules } from './procedure-excel.rule'

const dataPlainExample = {
  _num: 0,
  code: '',
  name: '',
  price: 0,
  procedureGroupName: '',
} satisfies Record<keyof typeof ProcedureExcelRules, unknown>

type DataPlain = typeof dataPlainExample & {
  procedureGroupId: number
}

@Injectable()
export class ApiFileProcedureUploadExcel {
  constructor(
    private dataSource: DataSource,
    private readonly procedureManager: ProcedureManager,
    private readonly procedureGroupRepository: ProcedureGroupRepository,
    private readonly apiProcedureGroupService: ApiProcedureGroupService
  ) { }

  async uploadExcel(options: { oid: number; userId: number; file: FileUploadDto }) {
    const { oid, userId, file } = options
    const time = Date.now()

    const excelDataGrid = await ExcelProcess.getData({
      file,
      excelRules: ProcedureExcelRules,
      validate: { maxSize: 5 * 1024 * 1024 },
    })

    const dataConvertList = excelDataGrid.map((item) => {
      const dataConvert = {}
      Object.keys(ProcedureExcelRules).forEach((key, index) => {
        dataConvert[key] = item[index]
      })
      return dataConvert as { [P in keyof typeof ProcedureExcelRules]: any }
    })

    const groupNameList = dataConvertList.map((i) => i.procedureGroupName || '')
    const procedureGroupList = await this.apiProcedureGroupService.createByGroupName(
      oid,
      groupNameList
    )
    const procedureGroupMapName = ESArray.arrayToKeyValue(procedureGroupList, 'name')

    const dataPlainList: DataPlain[] = dataConvertList.map((item, index) => {
      if (!item.code) {
        throw new BusinessError(`Lỗi: Dòng ${index + 2}: Mã dịch vụ không được để trống`)
      }
      let procedureGroupId = 0
      const procedureGroupName = item.procedureGroupName
      if (procedureGroupName) {
        procedureGroupId = procedureGroupMapName[procedureGroupName]?.id || 0
      }
      const dataPlain: DataPlain = {
        _num: item._num || 0,
        code: item.code,
        name: item.name || '',
        price: item.price || 0,
        procedureGroupName: item.procedureGroupName || '',
        procedureGroupId,
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
      // Không cho cập nhật trùng code
      const duplicatesBatchId = ESArray.checkDuplicate(dataPlainList, 'code')
      duplicatesBatchId.forEach(({ value, indices }) => {
        const indicesString = indices.map((i) => i + 2) // +1 do bắt đầu từ 0
        throw new BusinessError(
          `Có trùng lặp mã dịch vụ = ${value} ở dòng ${indicesString.toString()}`
        )
      })

      const codeList = dataPlainList.map((i) => i.code)
      const procedureOriginList = await this.procedureManager.findManyBy(manager, {
        oid,
        code: { IN: codeList },
      })
      const procedureOriginMapCode = ESArray.arrayToKeyValue(procedureOriginList, 'code')

      // Phân biệt tạo mới hay cập nhật theo code vì đã được gắn ở trên
      const dataPlainInsertList = dataPlainList.filter((i) => !procedureOriginMapCode[i.code])
      const dataPlainUpdateList = dataPlainList.filter((i) => !!procedureOriginMapCode[i.code])

      // === 1. Trường hợp 1: Tạo mới Procedure
      if (dataPlainInsertList.length) {
        const procedureInsertList = dataPlainInsertList.map((plain) => {
          const procedureInsert: ProcedureInsertType = {
            oid,
            code: plain.code,
            name: plain.name,
            price: plain.price,
            procedureGroupId: plain.procedureGroupId,
            procedureType: ProcedureType.Basic,
            totalSessions: 1,
            gapHours: 0,
            gapHoursType: 0,
            isActive: 1,
          }
          return procedureInsert
        })

        await this.procedureManager.insertManyAndReturnEntity(manager, procedureInsertList)
      }

      // === 2. Trường hợp 2: Cập nhật Procedure
      if (dataPlainUpdateList.length) {
        await this.procedureManager.bulkUpdate({
          manager,
          condition: { oid, id: { NOT: 0 } },
          compare: ['code'],
          tempList: dataPlainUpdateList,
          update: ['name', 'price', 'procedureGroupId'],
          options: { requireEqualLength: true },
        })
      }
    })
  }
}
