import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsDefined, MinLength, Validate } from 'class-validator'
import {
  IsGmail,
  IsPhone,
} from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class ForgotPasswordBody {
  @ApiProperty({ example: '0376899866' })
  @Expose()
  @IsDefined()
  @Validate(IsPhone)
  organizationPhone: string

  @ApiProperty({ example: 'duycodecom@gmail.com' })
  @Expose()
  @Transform(({ value }: { value: string }) => {
    const [mail, domain] = value.split('@')
    const mailFormat = mail.replace(/\./g, '').replace(/\+.*?$/g, '')
    return `${mailFormat}@${domain}`
  })
  @IsDefined()
  @Validate(IsGmail)
  organizationEmail: string

  @ApiProperty({ example: 'admin' })
  @Expose()
  @IsDefined()
  @MinLength(4)
  username: string
}
