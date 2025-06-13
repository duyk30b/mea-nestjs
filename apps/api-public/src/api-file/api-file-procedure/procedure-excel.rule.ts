import { ExcelRuleType } from '../common/excel-process'

export const ProcedureExcelRules = {
  _num: {
    title: 'STT',
    width: 5,
    type: 'number',
    required: false,
  },
  procedureCode: {
    title: 'Mã dịch vụ',
    width: 20,
    type: 'string_number',
    required: true,
  },
  name: {
    title: 'Tên dịch vụ',
    width: 50,
    type: 'string',
    required: true,
  },
  procedureGroupName: {
    title: 'Nhóm',
    width: 30,
    type: 'string',
    required: false,
  },
  price: {
    title: 'Giá',
    width: 12,
    type: 'number',
    required: true,
  },
} as const satisfies Record<string, ExcelRuleType>
