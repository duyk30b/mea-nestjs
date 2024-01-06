import { OmitType, PartialType } from '@nestjs/swagger'
import { plainToInstance } from 'class-transformer'
import { NoExtraProperties } from '../../../common/helpers/typescript.helper'
import { Receipt, ReceiptItem } from '../../entities'

export class ReceiptItemDto extends PartialType(OmitType(ReceiptItem, ['receiptId', 'receipt'])) {
    unit: string
    quantity: number
    productBatchId: number
}

export class ReceiptInsertDto extends PartialType(
    OmitType(Receipt, ['oid', 'receiptItems', 'status', 'paid', 'debt'])
) {
    receiptItems: ReceiptItemDto[] = []

    /* eslint-disable */
    static from<T extends ReceiptInsertDto, K extends ReceiptItemDto>(
        plain: NoExtraProperties<ReceiptInsertDto, T> & {
            receiptItems?: NoExtraProperties<ReceiptItemDto, K>[]
        }
    ): ReceiptInsertDto {
        const instance = plainToInstance(ReceiptInsertDto, plain, {
            exposeUnsetFields: false,
            excludeExtraneousValues: true,
            ignoreDecorators: true,
        })

        instance.receiptItems = plain.receiptItems.map((i) => {
            return plainToInstance(ReceiptItemDto, i, {
                exposeUnsetFields: false,
                excludeExtraneousValues: true,
                ignoreDecorators: true,
            })
        })
        return instance
    }
}

export class ReceiptUpdateDto extends PartialType(
    OmitType(Receipt, ['oid', 'receiptItems', 'status', 'distributorId', 'paid', 'debt'])
) {
    receiptItems: ReceiptItemDto[] = []

    /* eslint-disable */
    static from<T extends ReceiptUpdateDto, K extends ReceiptItemDto>(
        plain: NoExtraProperties<ReceiptUpdateDto, T> & {
            receiptItems?: NoExtraProperties<ReceiptItemDto, K>[]
        }
    ): ReceiptUpdateDto {
        const instance = plainToInstance(ReceiptUpdateDto, plain, {
            exposeUnsetFields: false,
            excludeExtraneousValues: true,
            ignoreDecorators: true,
        })

        instance.receiptItems = plain.receiptItems.map((i) => {
            return plainToInstance(ReceiptItemDto, i, {
                exposeUnsetFields: false,
                excludeExtraneousValues: true,
                ignoreDecorators: true,
            })
        })
        return instance
    }
}
