import { CustomerGroupService } from '@api-public/api/master-data/customer_group/customer_group.service'
import { CustomerSourceService } from '@api-public/api/master-data/customer_source/customer_source.service'
import { FileUploadDto } from '@libs/common/dto/file'
import { ESArray } from '@libs/common/helpers'
import { BusinessError } from '@libs/database/common/error'
import { CustomerInsertType } from '@libs/database/entities/customer.entity'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '@libs/database/entities/payment.entity'
import {
  CustomerGroupRepository,
  CustomerRepository,
  CustomerSourceRepository,
  PaymentRepository,
  WalletRepository,
} from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ExcelProcess } from '../common/excel-process'
import { CustomerExcelRules } from './customer-excel.rule'

const dataPlainExample = {
  _num: 0,
  customerCode: '',
  customerGroupName: '',
  customerSourceName: '',
  fullName: '',
  phone: '',
  citizenIdCard: '',
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

type DataPlain = typeof dataPlainExample & {
  customerGroupId: string
  customerSourceId: number
}

@Injectable()
export class ApiFileCustomerUploadExcel {
  constructor(
    private dataSource: DataSource,
    private customerRepository: CustomerRepository,
    private customerGroupService: CustomerGroupService,
    private customerSourceService: CustomerSourceService,
    private paymentRepository: PaymentRepository,
    private walletRepository: WalletRepository
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

    const groupNameList = dataConvertList.map((i) => i.customerGroupName || '')
    const customerGroupList = await this.customerGroupService.createByGroupName(oid, groupNameList)
    const customerGroupMapName = ESArray.arrayToKeyValue(customerGroupList, 'name')

    const sourceNameList = dataConvertList.map((i) => i.customerSourceName || '')
    const customerSourceList = await this.customerSourceService.createBySourceName(
      oid,
      sourceNameList
    )
    const customerSourceMapName = ESArray.arrayToKeyValue(customerSourceList, 'name')

    const dataPlainList: DataPlain[] = dataConvertList.map((item, index) => {
      if (!item.customerCode) {
        throw new BusinessError(`Lỗi: Dòng ${index + 2}: Mã khách hàng không được để trống`)
      }

      let customerGroupId = '0'
      const customerGroupName = item.customerGroupName
      if (customerGroupName) {
        customerGroupId = customerGroupMapName[customerGroupName]?.id || '0'
      }

      let customerSourceId = 0
      const customerSourceName = item.customerSourceName
      if (customerSourceName) {
        customerSourceId = customerSourceMapName[customerSourceName]?.id || 0
      }

      const dataPlain: DataPlain = {
        _num: item._num || 0,
        customerCode: item.customerCode || '',
        customerGroupName: item.customerGroupName || '',
        customerSourceName: item.customerSourceName || '',
        fullName: item.fullName || '',
        phone: item.phone || '',
        citizenIdCard: item.citizenIdCard || '',
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

        customerGroupId,
        customerSourceId,
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
      const customerOriginList = await this.customerRepository.managerFindManyBy(manager, {
        oid,
        customerCode: { IN: customerCodeList },
      })
      const customerOriginMapCode = ESArray.arrayToKeyValue(customerOriginList, 'customerCode')

      // Phân biệt tạo mới hay cập nhật theo customerCode vì đã được gắn ở trên
      const dataPlainInsertList = dataPlainList.filter((i) => {
        return !customerOriginMapCode[i.customerCode]
      })
      const dataPlainUpdateList = dataPlainList.filter((i) => {
        return !!customerOriginMapCode[i.customerCode]
      })

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
            phone: plain.phone,
            debt: plain.debt || 0, // nếu khách hàng mới thì nợ = 0 khi không điền giá trị
            customerGroupId: plain.customerGroupId,
            customerSourceId: plain.customerSourceId,
            fullName: plain.fullName,
            birthday: plain.birthday,
            yearOfBirth: plain.yearOfBirth,
            gender: plain.gender,
            addressProvince: plain.addressProvince,
            addressWard: plain.addressWard,
            addressStreet: plain.addressStreet,
            facebook: plain.facebook,
            zalo: plain.zalo,
            relative: '',
            healthHistory: '',
            note: plain.note,
            citizenIdCard: plain.citizenIdCard,
            isHasTicket: 0,
            isActive: 1,
          }
          return customerInsert
        })

        await this.customerRepository.managerInsertMany(manager, customerInsertList)
      }

      // === 2. Trường hợp 2: Cập nhật Customer
      if (dataPlainUpdateList.length) {
        await this.customerRepository.managerBulkUpdate({
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
            customerGroupId: { cast: 'bigint' },
            customerSourceId: true,
            birthday: { cast: 'bigint' },
            yearOfBirth: true,
            gender: true,
            addressProvince: true,
            addressWard: true,
            addressStreet: true,
            facebook: true,
            zalo: true,
            citizenIdCard: true,
            note: true,
          },
          options: { requireEqualLength: true },
        })
      }

      if (dataChangeDebt.length) {
        const paymentInsertList = dataChangeDebt.map((i) => {
          const paymentInsert: PaymentInsertType = {
            oid,
            voucherType: PaymentVoucherType.Other,
            voucherId: '0',
            personType: PaymentPersonType.Customer,
            personId: i.customerId,

            createdAt: time,
            walletId: '0',
            paymentActionType: PaymentActionType.FixByExcel,
            moneyDirection: MoneyDirection.Other,
            note: 'Update Excel',

            hasPaymentItem: 0,
            paidTotal: 0,
            debtTotal: i.debtUpdate - i.debtOrigin,
            personOpenDebt: i.debtOrigin,
            personCloseDebt: i.debtUpdate,
            cashierId: userId,
            walletOpenMoney: 0,
            walletCloseMoney: 0,
          }
          return paymentInsert
        })

        await this.paymentRepository.managerInsertMany(manager, paymentInsertList)
      }
    })
  }
}
