import { ExcelRuleType } from '../common/excel-process'

export const CustomerExcelRules = {
  _num: {
    title: 'STT',
    width: 5,
    type: 'number',
    required: false,
  },
  customerCode: {
    title: 'Mã khách hàng',
    width: 20,
    type: 'string_number',
    required: true,
  },
  fullName: {
    title: 'Tên khách hàng',
    width: 30,
    type: 'string',
    required: true,
  },
  phone: {
    title: 'SĐT',
    width: 15,
    type: 'string',
    required: false,
  },
  citizenIdCard: {
    title: 'CCCD',
    width: 20,
    type: 'string',
    required: false,
  },
  debt: {
    title: 'Nợ',
    width: 12,
    type: 'number',
    required: false,
  },
  birthday: {
    title: 'Ngày sinh',
    width: 15,
    type: 'date',
    required: false,
  },
  yearOfBirth: {
    title: 'Năm sinh',
    width: 10,
    type: 'number',
    required: false,
  },
  gender: {
    title: 'Giới tính',
    width: 5,
    type: 'number',
    required: false,
  },
  addressProvince: {
    title: 'Tỉnh',
    width: 20,
    type: 'string',
    required: false,
  },
  addressWard: {
    title: 'Xã',
    width: 20,
    type: 'string',
    required: false,
  },
  addressStreet: {
    title: 'Số nhà / thôn / đường',
    width: 20,
    type: 'string',
    required: false,
  },
  facebook: {
    title: 'Facebook',
    width: 40,
    type: 'string',
    required: false,
  },
  zalo: {
    title: 'Zalo',
    width: 40,
    type: 'string',
    required: false,
  },
  note: {
    title: 'Ghi chú',
    width: 30,
    type: 'string',
    required: false,
  },
} as const satisfies Record<string, ExcelRuleType>
