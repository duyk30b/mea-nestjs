import { ExcelRuleType } from '@api-public/api/file-api/common/excel-process'

export const PaymentExcelRules = {
  _num: {
    title: 'STT',
    width: 5,
    type: 'number',
    required: false,
  },
  createdAt: {
    title: 'Thời gian',
    width: 20,
    type: 'date',
    required: true,
  },
  moneyDirection: {
    title: 'Loại',
    width: 12,
    type: 'string',
    required: true,
  },
  personType: {
    title: 'Đối tượng',
    width: 12,
    type: 'string',
    required: true,
  },
  personName: {
    title: 'Tên',
    width: 30,
    type: 'string',
    required: true,
  },
  walletName: {
    title: 'Ví thanh toán',
    width: 30,
    type: 'string',
    required: true,
  },
  cashierName: {
    title: 'Thu ngân',
    width: 24,
    type: 'string',
    required: true,
  },
  paymentActionType: {
    title: 'Hành động',
    width: 12,
    type: 'string',
    required: true,
  },
  voucherId: {
    title: 'Mã phiếu',
    width: 16,
    type: 'string',
    required: true,
  },
  paidTotalIn: {
    title: 'Tiền thu',
    width: 12,
    type: 'number',
    required: false,
  },
  paidTotalOut: {
    title: 'Tiền chi',
    width: 12,
    type: 'number',
    required: false,
  },
  debtTotal: {
    title: 'Ghi nợ',
    width: 12,
    type: 'number',
    required: false,
  },
  personOpenDebt: {
    title: 'Nợ đầu kỳ',
    width: 12,
    type: 'number',
    required: false,
  },
  personCloseDebt: {
    title: 'Nợ cuối kỳ',
    width: 12,
    type: 'number',
    required: false,
  },
  walletOpenMoney: {
    title: 'Ví đầu kỳ',
    width: 12,
    type: 'number',
    required: false,
  },
  walletCloseMoney: {
    title: 'Ví cuối kỳ',
    width: 12,
    type: 'number',
    required: false,
  },
  note: {
    title: 'Ghi chú',
    width: 30,
    type: 'string',
    required: false,
  },
} as const satisfies Record<string, ExcelRuleType>
