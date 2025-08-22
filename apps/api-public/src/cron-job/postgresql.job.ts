import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { createReadStream, readdirSync, statSync } from 'fs'
import { lookup } from 'mime-types'
import { join } from 'path'
import { CacheDataService } from '../../../_libs/common/cache-data/cache-data.service'
import { GoogleDriverService } from '../../../_libs/transporter/google-driver/google-driver.service'

@Injectable()
export class PostgresqlJob {
  private readonly logger = new Logger(PostgresqlJob.name)

  constructor(
    private readonly cacheDataService: CacheDataService,
    private readonly googleDriverService: GoogleDriverService
  ) { }

  @Cron('0 0 19 * * *') // chạy vào 2h00 sáng hàng ngày (thằng cron chạy lúc 2h)
  async startBackupPostgres() {
    this.logger.debug('===== Start Backup Database Postgres =====')
  }

  @Cron('0 30 19 * * *') // chạy vào 2h30 sáng hàng ngày (thằng cron chạy lúc 2h)
  async startJobUploadPostgres() {
    this.logger.debug('===== Start Upload Database to GoogleDriver =====')
    const oid = 1

    const appDir = process.cwd()
    const backupDir = join(appDir, 'data', 'backup')
    const sqlFiles = readdirSync(backupDir)
      .filter((fileName) => fileName.endsWith('.sql'))
      .map((fileName) => {
        const fullPath = join(backupDir, fileName)
        const stats = statSync(fullPath)
        return { fileName, fullPath, mtime: stats.mtime }
      })
    if (sqlFiles.length === 0) {
      throw new Error('Không tìm thấy file .sql nào trong thư mục ./data/backup')
    }
    // Lấy file mới nhất dựa trên mtime
    const latestFile = sqlFiles.reduce((a, b) => (a.mtime > b.mtime ? a : b))
    const mimetype = lookup(latestFile.fullPath) || 'application/sql'
    const fileStream = createReadStream(latestFile.fullPath)

    const email = await this.cacheDataService.getEmailGoogleDriver(oid)
    const file = await this.googleDriverService.uploadFileStream({
      oid,
      fileStream,
      fileName: latestFile.fileName,
      mimetype,
      email,
    })
    return { data: { file } }
  }
}
