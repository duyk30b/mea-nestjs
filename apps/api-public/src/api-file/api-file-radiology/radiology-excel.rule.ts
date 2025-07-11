import { ExcelRuleType } from '../common/excel-process'

export const RadiologyExcelRules = {
  _num: {
    title: 'STT',
    width: 5,
    type: 'number',
    required: false,
  },
  radiologyCode: {
    title: 'Mã phiếu',
    width: 20,
    type: 'string_number',
    required: true,
  },
  name: {
    title: 'Tên phiếu',
    width: 50,
    type: 'string',
    required: true,
  },
  radiologyGroupName: {
    title: 'Nhóm',
    width: 30,
    type: 'string',
    required: false,
  },
  costPrice: {
    title: 'Giá vốn',
    width: 12,
    type: 'number',
    required: false,
  },
  price: {
    title: 'Giá',
    width: 12,
    type: 'number',
    required: true,
  },
} as const satisfies Record<string, ExcelRuleType>
