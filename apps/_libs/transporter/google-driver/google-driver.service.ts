import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { ReadStream } from 'fs'
import { OAuth2Client } from 'google-auth-library'
import { drive_v3, google } from 'googleapis'
import * as stream from 'stream'
import { FileUploadDto } from '../../../_libs/common/dto/file'
import { ESTimer } from '../../../_libs/common/helpers/time.helper'
import { GoogleDriverConfig } from './google-driver.config'

@Injectable()
export class GoogleDriverService {
  private logger = new Logger(GoogleDriverService.name)

  private cache: Record<
    string,
    {
      rootFolderId?: string
      refreshToken: string
      defaultFolderId?: string
      defaultFolderName?: string
    }
  > = {}

  constructor(
    @Inject(GoogleDriverConfig.KEY)
    private googleDriverConfig: ConfigType<typeof GoogleDriverConfig>
  ) {}

  public setCache(
    email: string,
    data: {
      rootFolderId?: string
      refreshToken: string
      defaultFolderId?: string
      defaultFolderName?: string
    }
  ) {
    this.cache[email] = data
  }

  private getRootFolderName() {
    return 'MEA.VN'
  }

  private getDefaultFolderName(oid: number) {
    return `MEA_${oid.toString().padStart(3, '000')}_${new Date().getFullYear()}`
  }

  private createOAuth2Client(): OAuth2Client {
    return new google.auth.OAuth2(
      this.googleDriverConfig.clientId,
      this.googleDriverConfig.clientSecret,
      this.googleDriverConfig.redirectURI
    )
  }

  private createDrive(email: string): drive_v3.Drive {
    if (!email || !this.cache[email]) {
      throw new Error('Chưa đăng nhập tài khoản Google Driver, email = ' + email)
    }
    const oAuth2Client = this.createOAuth2Client()
    oAuth2Client.setCredentials({ refresh_token: this.cache[email].refreshToken })
    const drive = google.drive({
      version: 'v3',
      auth: oAuth2Client,
    })
    return drive
  }

  public async getAuthUrl(options: { state: string }): Promise<{ url: string }> {
    const url = this.createOAuth2Client().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // bắt buộc confirm lại từ đầu để nhận refresh_token
      scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state: options.state, // thêm state như oid, uid để callback nhận về cũng có state
    })
    return { url }
  }

  public async logout(email: string) {
    this.cache[email] = null
  }

  public async loginCallback(query: { code: string; state: string; scope: string }) {
    const oid = Number(query.state)
    const oAuth2Client = this.createOAuth2Client()
    const { tokens } = await oAuth2Client.getToken(query.code)
    const refreshToken = tokens.refresh_token

    oAuth2Client.setCredentials({ refresh_token: refreshToken })

    const oauth2 = google.oauth2({
      auth: oAuth2Client,
      version: 'v2',
    })
    const userInfo = await oauth2.userinfo.get()
    const email = userInfo.data.email

    this.cache[email] = { refreshToken }
    const drive = this.createDrive(email)
    const rootFolder = await this.createRootFolder(drive)
    const defaultFolder = await this.createDefaultFolder(drive, {
      oid,
      rootFolderId: rootFolder.id,
    })

    this.cache[email] = {
      refreshToken,
      rootFolderId: rootFolder.id!,
      defaultFolderId: defaultFolder.id,
      defaultFolderName: defaultFolder.name,
    }
    return { email, refreshToken, oid }
  }

  private async createRootFolder(drive: drive_v3.Drive) {
    const rootFolderName = this.getRootFolderName()
    let rootFolder: { id: string; name: string }
    const folderList = await this.findFolderList(drive, { folderName: rootFolderName })
    rootFolder = folderList[0]
    if (!rootFolder) {
      rootFolder = await this.createFolder(drive, { folderName: rootFolderName })
    }
    return rootFolder
  }

  private async createDefaultFolder(
    drive: drive_v3.Drive,
    params: { oid: number; rootFolderId: string }
  ) {
    const { oid, rootFolderId } = params
    const defaultFolderName = this.getDefaultFolderName(oid)
    let defaultFolder: { id: string; name: string }
    const folderList = await this.findFolderList(drive, {
      folderName: defaultFolderName,
      parentId: rootFolderId,
    })
    defaultFolder = folderList[0]
    if (!defaultFolder) {
      defaultFolder = await this.createFolder(drive, {
        folderName: defaultFolderName,
        parentFolderId: rootFolderId,
      })
    }
    return defaultFolder
  }

  async getAllFolders(email: string) {
    const drive = this.createDrive(email)
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false and 'me' in owners",
      fields: 'nextPageToken, files(id, name, mimeType, trashed, parents, modifiedTime)',
    })
    const folderList = response.data.files as unknown as {
      id: string
      name: string
      mimeType: 'application/vnd.google-apps.folder'
      trashed: boolean
      parents: string[]
      modifiedTime: string
    }
    return folderList
  }

  private async findFolderList(
    drive: drive_v3.Drive,
    condition: { folderName?: string; parentId?: string }
  ) {
    const { folderName, parentId } = condition
    let queryString = ''
    if (folderName) queryString += ` and name='${folderName}'`
    if (parentId) queryString += ` and '${parentId}' in parents`

    const response = await drive.files.list({
      q:
        `mimeType='application/vnd.google-apps.folder' and trashed=false and 'me' in owners`
        + queryString,
      fields: 'nextPageToken, files(id, name, mimeType, trashed, parents, modifiedTime)',
    })

    const folderList = response.data.files as {
      id: string
      name: string
      mimeType: 'application/vnd.google-apps.folder'
      trashed: boolean
      parents: string[]
      modifiedTime: string
    }[]
    return folderList
  }

  private async createFolder(
    drive: drive_v3.Drive,
    params: { folderName: string; parentFolderId?: string }
  ) {
    const { folderName, parentFolderId } = params
    const response = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : [],
      },
    })
    const folder = response.data as {
      id: string
      name: string
      mimeType: 'application/vnd.google-apps.folder'
      kind: 'drive#file'
    }
    await drive.permissions.create({
      fileId: folder.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    })
    return folder
  }

  private async getById(drive: drive_v3.Drive, fileId: string) {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, parents, trashed, modifiedTime, size',
    })
    return response.data
  }

  private async trashById(drive: drive_v3.Drive, fileId: string) {
    const response = await drive.files.update({
      fileId,
      requestBody: { trashed: true },
    })
    const fileTrash = response.data as {
      id: string
      name: string
      mimeType: string
      kind: 'drive#file'
    }
    return fileTrash
  }

  private async deleteById(drive: drive_v3.Drive, fileId: string) {
    const response = await drive.files.update({
      fileId,
      requestBody: { trashed: true },
    })
    return response.data
  }

  public async trashMultipleFiles(options: { email: string; fileIds: string[]; oid: number }) {
    const { email, fileIds, oid } = options
    if (!fileIds.length) return { success: [], failed: [] }
    let drive: drive_v3.Drive
    try {
      this.logger.debug(
        `[OID=${oid}] GoogleDriver ${email} start trashMultipleFiles, with ${fileIds.length} file`
      )
      drive = this.createDrive(email)
    } catch (error) {
      return { success: [], failed: fileIds }
    }
    const promiseSettled = await Promise.allSettled(fileIds.map((id) => this.trashById(drive, id)))
    const result = { success: <string[]>[], failed: <string[]>[] }
    promiseSettled.forEach((i, index) => {
      if (i.status === 'fulfilled') {
        result.success.push(i.value.id)
      } else {
        this.logger.error('Google Driver trash file error: ' + index)
        this.logger.error(i)
        result.failed.push(fileIds[index])
      }
    })
    return result
  }

  public async deleteMultipleFiles(email: string, fileIds: string[]) {
    if (!fileIds.length) return { success: [], failed: [] }
    let drive: drive_v3.Drive
    try {
      drive = this.createDrive(email)
    } catch (error) {
      return { success: [], failed: fileIds }
    }
    const promiseSettled = await Promise.allSettled(fileIds.map((id) => this.deleteById(drive, id)))
    const result = { success: <string[]>[], failed: <string[]>[] }
    promiseSettled.forEach((i, index) => {
      if (i.status === 'fulfilled') {
        result.success.push(i.value.id)
      } else {
        this.logger.error('Google Driver trash file error: ' + index)
        this.logger.error(i)
        result.failed.push(fileIds[index])
      }
    })
    return result
  }

  private async createFileByStream(
    drive: drive_v3.Drive,
    options: {
      title: string
      parent: string
      stream: stream.PassThrough | ReadStream
      mimetype: string
    },
    permission?: {
      role: 'reader' | 'writer' | 'commenter'
      type: 'anyone' | 'user' | 'group'
      emailAddress?: string
      domain?: string
    }
  ) {
    const { title, parent, stream, mimetype } = options
    const response = await drive.files.create({
      requestBody: {
        name: title,
        parents: [parent],
        mimeType: mimetype,
      },
      media: {
        mimeType: mimetype,
        body: stream,
      },
      fields: 'id, name, mimeType, kind, size',
    })
    const file = response.data as {
      id: string
      name: string
      mimeType: string
      kind: 'drive#file'
      size: string
    }

    if (permission) {
      await drive.permissions.create({
        fileId: file.id,
        requestBody: {
          role: permission.role,
          type: permission.type,
          emailAddress: permission.emailAddress,
          domain: permission.domain,
        },
      })
    }
    return file
  }

  private async createFile(
    drive: drive_v3.Drive,
    options: {
      title: string
      parent: string
      buffer: Buffer
      mimetype: string
    }
  ) {
    const { title, parent, buffer, mimetype } = options
    const bufferStream = new stream.PassThrough()
    bufferStream.end(buffer)

    return this.createFileByStream(
      drive,
      {
        title,
        parent,
        stream: bufferStream,
        mimetype,
      },
      { role: 'reader', type: 'anyone' }
    )
  }

  public async uploadFileStream(options: {
    oid: number
    fileStream: stream.PassThrough | ReadStream
    fileName: string
    mimetype: string
    email: string
    permission?: {
      role: 'reader' | 'writer' | 'commenter'
      type: 'anyone' | 'user' | 'group'
      emailAddress?: string
      domain?: string
    }
  }) {
    const { fileStream, email, oid, fileName, mimetype, permission } = options
    if (!fileStream) return null
    this.logger.debug(
      `[OID=${oid}]-[START]-GoogleDriver ${email} uploadFileStream with file name ${fileName}`
    )
    const drive = this.createDrive(email)
    if (!this.cache[email].rootFolderId) {
      const rootFolder = await this.createRootFolder(drive)
      this.cache[email].rootFolderId = rootFolder.id
    }
    if (this.cache[email].defaultFolderName !== this.getDefaultFolderName(oid)) {
      const defaultFolder = await this.createDefaultFolder(drive, {
        oid,
        rootFolderId: this.cache[email].rootFolderId,
      })
      this.cache[email].defaultFolderId = defaultFolder.id
      this.cache[email].defaultFolderName = defaultFolder.name
    }
    const file = await this.createFileByStream(
      drive,
      {
        title: fileName,
        parent: this.cache[email].defaultFolderId,
        stream: fileStream,
        mimetype,
      },
      permission
    )
    this.logger.debug(
      `[OID=${oid}]-[SUCCESS]-GoogleDriver ${email} uploadFileStream with file name ${fileName}`
    )
    return file
  }

  public async uploadMultipleFiles(options: {
    files: FileUploadDto[]
    email: string
    oid: number
    customerId: number
  }) {
    const { files, email, oid, customerId } = options
    if (!files.length) return []
    this.logger.debug(
      `[OID=${oid}] GoogleDriver ${email} start uploadMultipleFiles, with ${files.length} file`
    )
    const drive = this.createDrive(email)

    if (!this.cache[email].rootFolderId) {
      const rootFolder = await this.createRootFolder(drive)
      this.cache[email].rootFolderId = rootFolder.id
    }

    if (this.cache[email].defaultFolderName !== this.getDefaultFolderName(oid)) {
      const defaultFolder = await this.createDefaultFolder(drive, {
        oid,
        rootFolderId: this.cache[email].rootFolderId,
      })
      this.cache[email].defaultFolderId = defaultFolder.id
      this.cache[email].defaultFolderName = defaultFolder.name
    }

    const now = Date.now()
    const data = await Promise.all(
      files.map((item, index) => {
        return this.createFile(drive, {
          buffer: item.buffer,
          mimetype: item.mimetype,
          parent: this.cache[email].defaultFolderId,
          title:
            oid
            + '-'
            + customerId
            + '-'
            + ESTimer.timeToText(now + index, 'YYYY-MM-DD-hh-mm-ss-xxx'),
        })
      })
    )

    return data
  }
}
