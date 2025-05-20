import { ApiProperty } from '@nestjs/swagger'

export class MultipleFileUpload {
  @ApiProperty({ type: Array, format: 'binary' })
  files: string[]
}

export class SingleFileUpload {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: string
}

export type FileUploadDto = {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  buffer: any
  size: number // tính theo bytes
}

export type ExcelColumUploadRulesType = {
  column: string
  width: number
  title: string
  type?: 'number' | 'string' | 'date'
  example: number | string | object
  required?: boolean
}