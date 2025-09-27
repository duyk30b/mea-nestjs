import { ConsoleLogger } from '@nestjs/common'

export class NestLogger extends ConsoleLogger {
  private readonly ignoreContexts = [
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    // 'NestApplication',
  ]

  log(message: any, context?: string) {
    if (context && this.ignoreContexts.includes(context)) {
      return // bỏ qua log Nest core
    }
    super.log(message, context) // giữ nguyên style gốc
  }

  // error(message: string | any, stack?: string, context?: string) {
  //   const messageConvert =
  //     typeof message === 'string'
  //       ? message
  //         .split('\n')
  //         .map((line) => `\x1b[31m${line}\x1b[0m`)
  //         .join('\n')
  //       : message
  //   super.error(messageConvert, stack, context) // giữ nguyên style gốc
  // }
}
