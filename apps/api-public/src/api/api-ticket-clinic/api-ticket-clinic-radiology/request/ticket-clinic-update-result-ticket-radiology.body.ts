import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsInt,
  IsNumber,
  IsObject,
  IsString,
  validateSync,
} from 'class-validator'
import * as DOMPurify from 'isomorphic-dompurify'
import { MultipleFileUpload } from '../../../../../../_libs/common/dto/file'
import { TicketUserBasicBody } from '../../api-ticket-clinic-user/request/ticket-clinic-update-user-list.body'

export class TicketRadiologyUpdateBody extends MultipleFileUpload {
  @ApiProperty({ example: 'Mổ viêm ruột thừa 2002' })
  @Expose()
  @Transform(({ value }) => DOMPurify.sanitize(value))
  @IsDefined()
  @IsString()
  description: string

  @ApiProperty({ example: 'Trước khi vào khám 5 ngày, bla...bla...' })
  @Expose()
  @IsDefined()
  @IsString()
  result: string

  @ApiProperty({ example: Date.now() })
  @Expose()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsDefined()
  @IsInt()
  startedAt: number
}

export class TicketClinicUpdateResultTicketRadiologyBody extends MultipleFileUpload {
  @ApiProperty({ type: String, example: JSON.stringify([3, 4]) })
  @Expose()
  @Transform(({ value }) => (value != null ? JSON.parse(value) : value))
  @IsDefined()
  @IsArray()
  @IsNumber({}, { each: true })
  imageIdsKeep: number[]

  @ApiProperty({ type: String, example: JSON.stringify([3, 4]) }) G
  @Expose()
  @Transform(({ value }) => (value != null ? JSON.parse(value) : value))
  @IsDefined()
  @IsArray()
  @IsNumber({}, { each: true })
  filesPosition: number[]

  @ApiProperty({
    type: 'string',
    example: JSON.stringify(<TicketUserBasicBody[]>[{ userId: 1, roleId: 2 }]),
  })
  @Expose()
  @Transform(({ value }) => {
    if (value === undefined) return undefined
    try {
      const err = []
      const result = JSON.parse(value).map((i: any) => {
        const instance = Object.assign(new TicketUserBasicBody(), i)
        const validate = validateSync(instance, {
          whitelist: true,
          forbidNonWhitelisted: true,
          skipMissingProperties: true,
        })
        if (validate.length) err.push(...validate)
        return instance
      })
      if (err.length) return JSON.stringify(err)
      else return result
    } catch (error) {
      return error.message
    }
  })
  @IsArray({
    message: ({ value }) =>
      `Validate TicketUserBasicBody failed. Value = ${JSON.stringify(value)}. Example: `
      + JSON.stringify(<TicketUserBasicBody[]>[{ userId: 1, roleId: 2 }]),
  })
  ticketUserList: TicketUserBasicBody[]

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => {
    if (value === undefined) return undefined
    try {
      const instance = Object.assign(new TicketRadiologyUpdateBody(), JSON.parse(value))
      const validate = validateSync(instance, {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true,
      })
      if (validate.length) return JSON.stringify(validate)
      return instance
    } catch (error) {
      return error.message
    }
  })
  @IsObject({
    message: ({ value }) =>
      `Validate imagesChange failed. Value = ${JSON.stringify(value)}. Example: `
      + JSON.stringify(<TicketRadiologyUpdateBody>{
        description: '',
        startedAt: Date.now(),
        result: '',
      }),
  })
  ticketRadiology: TicketRadiologyUpdateBody
}
