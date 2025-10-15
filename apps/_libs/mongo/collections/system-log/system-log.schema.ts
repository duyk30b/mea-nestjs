import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ collection: 'SystemLog', timestamps: true })
export class SystemLog {
  @Prop()
  ip: string

  @Prop()
  browser: string

  @Prop()
  mobile: number

  @Prop()
  uid: number

  @Prop()
  OID: number

  @Prop()
  username: string

  @Prop()
  type: string

  @Prop()
  method: string

  @Prop()
  url: string

  @Prop()
  errorMessage: string

  @Prop()
  timeMs: number

  @Prop()
  request: string

  @Prop({ type: Object })
  errorObject: object

  @Prop({ type: Object })
  query: object

  @Prop({ type: Object })
  body: object

  @Prop({ type: Object })
  controller: {
    className?: string
    funcName?: string
    subject?: string
    topic?: string
    partition?: number
    offset?: string
  }
}

const SystemLogSchema = SchemaFactory.createForClass(SystemLog)

export { SystemLogSchema }

export type SystemLogType = Omit<SystemLog, keyof Document<SystemLog>> & {
  _id: Types.ObjectId
  id?: string
}

export type SystemLogInsertType = Omit<SystemLogType, 'id' | '_id'>

export type SystemLogUpdateType = Omit<SystemLogType, 'id' | '_id'>
