import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { RedisService } from './redis.service'

@ApiTags('Redis')
@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) { }

  @Get('get/:key')
  @ApiParam({ name: 'key', example: 'demo', required: true })
  async get(@Param() { key }: { key: string }) {
    const value = await this.redisService.get(key)
    return { data: { key, value } }
  }

  @Get('get-keys')
  @ApiQuery({ name: 'pattern', example: 'TOKEN_', required: true })
  async getKeys(@Query() { pattern }: { pattern: string }) {
    const keys = await this.redisService.getKeys(pattern + '*')
    return { data: { keys } }
  }

  @Post('set')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string', example: 'demo' },
        value: { type: 'string', example: 'hah hah hah' },
        milliseconds: { type: 'number', example: 10000 },
      },
    },
  })
  async set(@Body() body: { key: string, value: string, milliseconds: number }) {
    const { key, value, milliseconds } = body
    // await this.redisService.set(key, value, { milliseconds })
    await this.redisService.set(key, value, { datetime: new Date(Date.now() + milliseconds) })
    return { data: { key, value } }
  }

  @Delete('del/:key')
  @ApiParam({ name: 'key', example: 'demo', required: true })
  async del(@Param('key') key: string) {
    await this.redisService.del(key)
    return { data: { key } }
  }
}
