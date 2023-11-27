import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNotEmpty, MinLength } from 'class-validator'

export class EmployeeCreateBody {
    @ApiProperty({ example: 'nhatduong2019' })
    @Expose()
    @IsDefined()
    @IsNotEmpty()
    username: string

    @ApiProperty({ example: 'Abc@123456' })
    @Expose()
    @IsDefined()
    @IsNotEmpty()
    @MinLength(6)
    password: string

    @ApiProperty({ example: 'Ngô Nhật Dương' })
    @Expose()
    fullName: string
}

export class EmployeeUpdateBody extends PartialType(EmployeeCreateBody) {}
