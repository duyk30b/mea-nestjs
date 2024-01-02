import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined } from 'class-validator'

export class RefreshTokenBody {
    @ApiProperty({ name: 'refreshToken' })
    @Expose()
    @IsDefined()
    refreshToken: string
}
