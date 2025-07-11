import { ExcelRuleType } from '../common/excel-process'

export const LaboratoryExcelRules = {
  _num: {
    title: 'STT',
    width: 5,
    type: 'number',
    required: false,
  },
  laboratoryCode: {
    title: 'Mã xét nghiệm',
    width: 20,
    type: 'string_number',
    required: true,
  },
  name: {
    title: 'Tên xét nghiệm',
    width: 50,
    type: 'string',
    required: true,
  },
  laboratoryGroupName: {
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
  lowValue: {
    title: 'Ngưỡng thấp',
    width: 12,
    type: 'number',
    required: false,
  },
  highValue: {
    title: 'Ngưỡng cao',
    width: 12,
    type: 'number',
    required: false,
  },
  unit: {
    title: 'Đơn vị',
    width: 12,
    type: 'string',
    required: false,
  },
} as const satisfies Record<string, ExcelRuleType>
