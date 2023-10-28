import { Module } from '@nestjs/common'
import { ConfigModule, ConfigType } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SqlConfig } from './sql.config'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(SqlConfig)],
      inject: [SqlConfig.KEY],
      useFactory: (sqlConfig: ConfigType<typeof SqlConfig>) => sqlConfig,
    }),
  ],
})
export class SqlModule {}
