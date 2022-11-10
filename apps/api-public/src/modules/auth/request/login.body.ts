import { ApiProperty } from '@nestjs/swagger'
import { IsPhone } from '_libs/common/validate/class-validator.custom'
import { Expose } from 'class-transformer'
import { IsDefined, MinLength, Validate } from 'class-validator'

export class LoginBody {
    @ApiProperty({ name: 'org_phone', example: '0986021190' })
    @Expose({ name: 'org_phone' })
    @IsDefined()
    @Validate(IsPhone)
    orgPhone: string

    @ApiProperty({ example: 'admin' })
    @Expose()
    @IsDefined()
    @MinLength(4)
    username: string

    @ApiProperty({ example: 'Abc@123456' })
    @Expose()
    @IsDefined()
    @MinLength(6)
    password: string
}
