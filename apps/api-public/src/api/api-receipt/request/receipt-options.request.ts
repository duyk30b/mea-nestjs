import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { ReceiptStatus } from '../../../../../_libs/database/common/variable'

export class ReceiptRelationQuery {
    @Expose()
    @IsBoolean()
    distributor: boolean

    @Expose()
    @IsBoolean()
    distributorPayments: boolean

    @Expose()
    @IsBoolean()
    receiptItems: boolean
}

export class ReceiptFilterQuery {
    @Expose()
    @IsNumber()
    distributorId: number

    @Expose()
    @Type(() => ConditionTimestamp)
    @ValidateNested({ each: true })
    time: ConditionTimestamp

    @Expose()
    @Type(() => ConditionTimestamp)
    @ValidateNested({ each: true })
    deleteTime: ConditionTimestamp

    @Expose()
    @IsEnum(ReceiptStatus)
    status: ReceiptStatus
}

export class ReceiptSortQuery extends SortQuery {}
