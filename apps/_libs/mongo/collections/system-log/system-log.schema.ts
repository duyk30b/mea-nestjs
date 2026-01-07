import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ collection: 'SystemLog', timestamps: true })
export class SystemLog {
  @Prop()
  oid: number

  @Prop()
  uid: number

  @Prop()
  username: string

  @Prop()
  clientId: string

  @Prop()
  ip: string

  @Prop()
  browser: string

  @Prop()
  mobile: number

  @Prop({ type: String })
  apiMethod: 'GET' | 'POST' | 'NATS' | 'KAFKA'

  @Prop()
  prefixController: string // ví dụ như ticket, purchase-order

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

// Index không tự cập nhật khi sửa code, nó chỉ tạo lần đầu, nếu thay đổi cần chạy migration
SystemLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 } // Tự động xóa sau 30 ngày
)

export { SystemLogSchema }

export type SystemLogType = Omit<SystemLog, keyof Document<SystemLog>> & {
  _id: Types.ObjectId
  id?: string
}

export type SystemLogInsertType = Omit<SystemLogType, 'id' | '_id'>

export type SystemLogUpdateType = Omit<SystemLogType, 'id' | '_id'>
