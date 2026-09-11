import { ExcelRuleType } from '@api-public/api/file-api/common/excel-process'

export const DistributorExcelRules = {
  _num: {
    title: 'STT',
    width: 5,
    type: 'number',
    required: false,
  },
  distributorCode: {
    title: 'Mã nhà cung cấp',
    width: 20,
    type: 'string_number',
    required: true,
  },
  fullName: {
    title: 'Tên nhà cung cấp',
    width: 40,
    type: 'string',
    required: true,
  },
  phone: {
    title: 'SĐT',
    width: 15,
    type: 'string',
    required: false,
  },
  debt: {
    title: 'Nợ',
    width: 12,
    type: 'number',
    required: false,
  },
} as const satisfies Record<string, ExcelRuleType>
