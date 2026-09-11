import { ExcelRuleType } from '@api-public/api/file-api/common/excel-process'

export const BatchExcelRules = {
  _num: {
    title: 'STT',
    width: 5,
    type: 'number',
    required: false,
  },
  productCode: {
    title: 'Mã sản phẩm',
    width: 20,
    type: 'string_number',
    required: false,
  },
  productName: {
    title: 'Tên sản phẩm',
    width: 40,
    type: 'string',
    required: true,
  },
  distributorName: {
    title: 'Tên nhà cung cấp',
    width: 30,
    type: 'string',
    required: false,
  },
  expiryDate: {
    title: 'Hạn sử dụng',
    width: 12,
    type: 'date',
    required: false,
  },
  quantity: {
    title: 'Số lượng',
    width: 12,
    type: 'number',
    required: true,
  },
  unitName: {
    title: 'Đơn vị',
    width: 12,
    type: 'string',
    required: false,
  },
  retailPrice: {
    title: 'Giá bán',
    width: 12,
    type: 'number',
    required: false,
  },
} as const satisfies Record<string, ExcelRuleType>
