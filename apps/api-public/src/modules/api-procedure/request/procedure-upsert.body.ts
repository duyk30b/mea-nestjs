import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsBoolean, IsDefined, IsNumber, IsString } from 'class-validator'

export class ProcedureCreateBody {
    @ApiProperty({ example: 'Truyền dịch 500ml' })
    @Expose()
    @IsDefined()
    @IsString()
    name: string // tên dịch vụ

    @ApiPropertyOptional({ example: 'Tiêm truyền' })
    @Expose()
    @IsString()
    group: string // nhóm dịch vụ

    @ApiPropertyOptional({ example: 105000 })
    @Expose()
    @IsNumber()
    price: number // Giá dịch vụ

    @ApiProperty()
    @Expose()
    @IsString()
    consumableHint: string // Vật tư tiêu hao sử dụng

    @ApiPropertyOptional({ example: true })
    @Expose()
    @IsBoolean()
    isActive: boolean
}

export class ProcedureUpdateBody extends PartialType(ProcedureCreateBody) {}
