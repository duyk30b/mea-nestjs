import { ApiProperty } from '@nestjs/swagger'
import { IsGmail, IsPhone } from '_libs/common/transform-validate/class-validator.custom'
import { Expose } from 'class-transformer'
import { IsDefined, MinLength, Validate } from 'class-validator'

export class RegisterBody {
    @ApiProperty({ example: 'example-2@gmail.com' })
    @Expose()
    @IsDefined()
    @Validate(IsGmail)
    email: string

    @ApiProperty({ example: '0376899866' })
    @Expose()
    @IsDefined()
    @Validate(IsPhone)
    phone: string

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
