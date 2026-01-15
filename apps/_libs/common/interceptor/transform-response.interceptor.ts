import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { I18nContext } from 'nestjs-i18n'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { I18nPath, I18nTranslations } from '../../../../assets/generated/i18n.generated'
import { RequestExternal } from '../request/external.request'

export type BaseResponse<T = any> = {
  data: T
  message?: I18nPath
  args?: Record<string, any>
}

export type FullResponse<T = any> = {
  success: boolean
  time: string
  statusCode: number
  meta: { oid: number; uid: number; clientId: string }
} & BaseResponse<T>

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const i18n = I18nContext.current<I18nTranslations>()
    return next.handle().pipe(
      map((reply: BaseResponse) => {
        const ctx = context.switchToHttp()
        const request = ctx.getRequest()
        const response = ctx.getResponse()
        const { external }: RequestExternal = request.raw

        const dataReply: FullResponse = {
          success: true,
          time: new Date().toISOString(),
          statusCode: response.statusCode,
          meta: { oid: external.oid, uid: external.uid, clientId: external.clientId },
          message: i18n.translate(reply?.message || 'common.Success', {
            args: reply?.args || {},
          }),
          data: reply?.data,
        }

        return dataReply
      })
    )
  }
}
