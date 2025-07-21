import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { ESArray } from '../../../../_libs/common/helpers'
import { BusinessError } from '../../../../_libs/database/common/error'
import { CustomerInsertType } from '../../../../_libs/database/entities/customer.entity'
import {
  PaymentItemInsertType,
  PaymentVoucherItemType,
  PaymentVoucherType,
} from '../../../../_libs/database/entities/payment-item.entity'
import { PaymentPersonType } from '../../../../_libs/database/entities/payment.entity'
import { CustomerManager } from '../../../../_libs/database/managers'
import { PaymentItemManager } from '../../../../_libs/database/repositories'
import { ExcelProcess } from '../common/excel-process'
import { CustomerExcelRules } from './customer-excel.rule'

const dataPlainExample = {
  _num: 0,
  customerCode: '',
  fullName: '',
  phone: '',
  debt: 0,
  birthday: 0,
  yearOfBirth: 0,
  gender: 0,
  addressProvince: '',
  addressWard: '',
  addressStreet: '',
  facebook: '',
  zalo: '',
  note: '',
} satisfies Record<keyof typeof CustomerExcelRules, unknown>

type DataPlain = typeof dataPlainExample

@Injectable()
export class ApiFileCustomerUploadExcel {
  constructor(
    private dataSource: DataSource,
    private readonly customerManager: CustomerManager,
    private paymentItemManager: PaymentItemManager
  ) { }

  async uploadExcel(options: { oid: number; userId: number; file: FileUploadDto }) {
    const { oid, userId, file } = options
    const time = Date.now()

    const excelDataGrid = await ExcelProcess.getData({
      file,
      excelRules: CustomerExcelRules,
      validate: { maxSize: 5 * 1024 * 1024 },
    })

    const dataConvertList = excelDataGrid.map((item) => {
      const dataConvert = {}
      Object.keys(CustomerExcelRules).forEach((key, index) => {
        dataConvert[key] = item[index]
      })
      return dataConvert as { [P in keyof typeof CustomerExcelRules]: any }
    })

    const dataPlainList: DataPlain[] = dataConvertList.map((item, index) => {
      if (!item.customerCode) {
        throw new BusinessError(`Lỗi: Dòng ${index + 2}: Mã khách hàng không được để trống`)
      }
      const dataPlain: DataPlain = {
        _num: item._num || 0,
        customerCode: item.customerCode || '',
        fullName: item.fullName || '',
        phone: item.phone || '',
        debt: item.debt != null ? item.debt : null, // để nguyên vì có thể không cập nhật thông tin nợ
        birthday: item.birthday ? (item.birthday as Date).getTime() : null,
        yearOfBirth:
          item.yearOfBirth || (item.birthday ? new Date(item.birthday).getFullYear() : null),
        gender: [0, 1].includes(item.gender) ? item.gender : null,
        addressProvince: item.addressProvince || '',
        addressWard: item.addressWard || '',
        addressStreet: item.addressStreet || '',
        facebook: item.facebook || '',
        zalo: item.zalo || '',
        note: item.note || '',
      } satisfies DataPlain
      return dataPlain
    })

    await this.processDataPlainList({ oid, userId, dataPlainList, time })
  }

  async processDataPlainList(data: {
    oid: number
    userId: number
    dataPlainList: DataPlain[]
    time: number
  }) {
    const { oid, userId, dataPlainList, time } = data

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // Không cho cập nhật trùng customerCode
      const duplicatesBatchId = ESArray.checkDuplicate(dataPlainList, 'customerCode')
      duplicatesBatchId.forEach(({ value, indices }) => {
        const indicesString = indices.map((i) => i + 2) // +1 do bắt đầu từ 0
        throw new BusinessError(
          `Có trùng lặp mã khách hàng = ${value} ở dòng ${indicesString.toString()}`
        )
      })

      const customerCodeList = dataPlainList.map((i) => i.customerCode)
      const customerOriginList = await this.customerManager.findManyBy(manager, {
        oid,
        customerCode: { IN: customerCodeList },
      })
      const customerOriginMapCode = ESArray.arrayToKeyValue(customerOriginList, 'customerCode')

      // Phân biệt tạo mới hay cập nhật theo customerCode vì đã được gắn ở trên
      const dataPlainInsertList = dataPlainList.filter(
        (i) => !customerOriginMapCode[i.customerCode]
      )
      const dataPlainUpdateList = dataPlainList.filter(
        (i) => !!customerOriginMapCode[i.customerCode]
      )

      const dataChangeDebt = dataPlainUpdateList
        .map((i) => {
          const customerOrigin = customerOriginMapCode[i.customerCode]
          const debtUpdate = i.debt != null ? i.debt : customerOrigin.debt
          return {
            customerId: customerOrigin.id,
            debtOrigin: customerOrigin.debt,
            debtUpdate,
          }
        })
        .filter((i) => i.debtOrigin !== i.debtUpdate)

      // === 1. Trường hợp 1: Tạo mới Customer
      if (dataPlainInsertList.length) {
        const customerInsertList = dataPlainInsertList.map((plain) => {
          const customerInsert: CustomerInsertType = {
            oid,
            customerCode: plain.customerCode,
            fullName: plain.fullName,
            phone: plain.phone,
            debt: plain.debt || 0, // nếu khách hàng mới thì nợ = 0 khi không điền giá trị
            birthday: plain.birthday,
            gender: plain.gender,
            addressProvince: plain.addressProvince,
            addressWard: plain.addressWard,
            addressStreet: plain.addressStreet,
            facebook: plain.facebook,
            zalo: plain.zalo,
            customerSourceId: 0,
            yearOfBirth: plain.yearOfBirth,
            relative: '',
            healthHistory: '',
            note: plain.note,
            isActive: 1,
          }
          return customerInsert
        })

        await this.customerManager.insertManyAndReturnEntity(manager, customerInsertList)
      }

      // === 2. Trường hợp 2: Cập nhật Customer
      if (dataPlainUpdateList.length) {
        await this.customerManager.bulkUpdate({
          manager,
          condition: { oid, id: { NOT: 0 } },
          compare: ['customerCode'],
          tempList: dataPlainUpdateList,
          update: {
            fullName: true,
            phone: true,
            debt: (t: string, u: string) => ` CASE
                  WHEN "${t}"."debt" IS NOT NULL THEN "${t}"."debt"::bigint
                  ELSE "${u}"."debt"
                END`,
            birthday: { cast: 'bigint' },
            yearOfBirth: true,
            gender: true,
            addressProvince: true,
            addressWard: true,
            addressStreet: true,
            facebook: true,
            zalo: true,
            note: true,
          },
          options: { requireEqualLength: true },
        })
      }

      if (dataChangeDebt.length) {
        const paymentItemInsertList = dataChangeDebt.map((i) => {
          const paymentItemInsert: PaymentItemInsertType = {
            oid,
            note: 'Update Excel',
            paymentId: 0,
            paymentPersonType: PaymentPersonType.Customer,
            personId: i.customerId,
            createdAt: time,

            voucherType: PaymentVoucherType.Other,
            voucherId: 0,
            voucherItemType: PaymentVoucherItemType.Other,
            voucherItemId: 0,
            paymentInteractId: 0,

            paidAmount: -(i.debtUpdate - i.debtOrigin),
            debtAmount: i.debtUpdate - i.debtOrigin,
            openDebt: i.debtOrigin,
            closeDebt: i.debtUpdate,
            cashierId: userId,
          }
          return paymentItemInsert
        })

        await this.paymentItemManager.insertMany(manager, paymentItemInsertList)
      }
    })
  }
}
