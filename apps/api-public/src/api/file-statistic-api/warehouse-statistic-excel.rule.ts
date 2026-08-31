import { ExcelRuleType } from '../../api-file/common/excel-process'

export const WarehouseStatisticExcelRules = {
  _num: {
    title: 'STT',
    width: 5,
    type: 'number',
    required: false,
  },
  warehouseCode: {
    title: 'Mã kho',
    width: 20,
    type: 'string_number',
    required: true,
  },
  warehouseName: {
    title: 'Tên kho',
    width: 40,
    type: 'string',
    required: true,
  },
  sumCostAmount: {
    title: 'Tổng vốn',
    width: 20,
    type: 'number',
    required: true,
  },
  sumRetailAmount: {
    title: 'Tổng dự kiến bán',
    width: 20,
    type: 'number',
    required: true,
  },
} as const satisfies Record<string, ExcelRuleType>
