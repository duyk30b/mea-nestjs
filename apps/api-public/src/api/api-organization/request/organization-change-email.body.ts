import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsDefined, Validate } from 'class-validator'
import { IsGmail } from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class OrganizationChangeEmailBody {
  @ApiPropertyOptional({ name: 'email', example: 'vm@gmail.com' })
  @Transform(({ value }: { value: string }) => {
    const [mail, domain] = value.split('@')
    const mailFormat = mail.replace(/\./g, '').replace(/\+.*?$/g, '')
    return `${mailFormat}@${domain}`
  })
  @IsDefined()
  @Validate(IsGmail)
  email: string
}
