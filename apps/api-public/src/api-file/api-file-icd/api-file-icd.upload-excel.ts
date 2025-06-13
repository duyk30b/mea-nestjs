import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { ICD } from '../../../../_libs/database/entities'
import { ICDRepository } from '../../../../_libs/database/repositories'
import { ExcelProcess, ExcelRuleType } from '../common/excel-process'

export const ProductExcelRules = {
  code: {
    title: 'Mã',
    width: 20,
    type: 'string',
    required: true,
  },
  name: {
    title: 'Tên',
    width: 50,
    type: 'string',
    required: true,
  },
} as const satisfies Record<string, ExcelRuleType>

const dataPlainExample = {
  code: '',
  name: '',
} satisfies Record<keyof typeof ProductExcelRules, unknown>

type DataPlain = typeof dataPlainExample

@Injectable()
export class ApiFileICDUploadExcel {
  constructor(private readonly icdRepository: ICDRepository) { }

  async uploadExcel(options: { oid: number; userId: number; file: FileUploadDto }) {
    const { oid, userId, file } = options

    const excelDataGrid = await ExcelProcess.getData({
      file,
      excelRules: ProductExcelRules,
      validate: { maxSize: 5 * 1024 * 1024 },
    })

    const dataConvertList = excelDataGrid.map((item) => {
      const dataConvert = {}
      Object.keys(ProductExcelRules).forEach((key, index) => {
        dataConvert[key] = item[index]
      })
      return dataConvert as { [P in keyof typeof ProductExcelRules]: any }
    })

    await this.processDataPlainList({ dataPlainList: dataConvertList })
  }

  async processDataPlainList(data: { dataPlainList: DataPlain[] }) {
    await this.icdRepository
      .getManager()
      .query(`TRUNCATE TABLE "${ICD.name}" RESTART IDENTITY CASCADE;`)
    await this.icdRepository.insertMany(data.dataPlainList)
    return { data: true }
  }
}
