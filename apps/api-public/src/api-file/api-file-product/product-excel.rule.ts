import { ExcelRuleType } from '../common/excel-process'

export const ProductExcelRules = {
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
    required: true,
  },
  brandName: {
    title: 'Tên sản phẩm',
    width: 50,
    type: 'string',
    required: true,
  },
  batchId: {
    title: 'ID lô',
    width: 7,
    type: 'number',
    required: false,
  },
  lotNumber: {
    title: 'Số lô',
    width: 15,
    type: 'string_number',
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
    width: 10,
    type: 'number',
    required: true,
  },
  unitBasicName: {
    title: 'Đơn vị',
    width: 10,
    type: 'string',
    required: false,
  },
  costPrice: {
    title: 'Giá nhập',
    width: 12,
    type: 'number',
    required: true,
  },
  retailPrice: {
    title: 'Giá bán',
    width: 12,
    type: 'number',
    required: true,
  },
  costAmount: {
    title: 'Tổng vốn còn lại',
    width: 12,
    type: 'number',
    required: false,
  },
  substance: {
    title: 'Hoạt chất',
    width: 30,
    type: 'string',
    required: false,
  },
  productGroupName: {
    title: 'Nhóm',
    width: 24,
    type: 'string',
    required: false,
  },
  route: {
    title: 'Đường dùng',
    width: 12,
    type: 'string',
    required: false,
  },
  source: {
    title: 'Nguồn gốc',
    width: 12,
    type: 'string',
    required: false,
  },
} as const satisfies Record<string, ExcelRuleType>
