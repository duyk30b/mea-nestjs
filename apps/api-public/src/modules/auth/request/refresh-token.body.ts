import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined } from 'class-validator'

export class RefreshTokenBody {
    @ApiProperty({ name: 'refresh_token' })
    @Expose({ name: 'refresh_token' })
    @IsDefined()
    refreshToken: string
}
