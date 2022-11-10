import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { decrypt, encrypt, formatUrlEncode } from '_libs/common/helpers/string.helper'
import { ERole } from '_libs/database/common/variable'
import Employee from '_libs/database/entities/employee.entity'
import Organization from '_libs/database/entities/organization.entity'
import * as bcrypt from 'bcrypt'
import { DataSource } from 'typeorm'
import { EmailService } from '../../components/email/email.service'
import { JwtExtendService } from '../../components/jwt-extend/jwt-extend.service'
import { GlobalConfig, JwtConfig } from '../../environments'
import { ErrorMessage } from '../../exception-filters/exception.const'
import { ForgotPasswordBody } from './request/forgot-password.body'
import { ResetPasswordBody } from './request/reset-password.body'
import { RegisterBody } from './request/register.body'
import { LoginBody } from './request/login.body'

@Injectable()
export class AuthService {
	constructor(
		@Inject(GlobalConfig.KEY) private globalConfig: ConfigType<typeof GlobalConfig>,
		@Inject(JwtConfig.KEY) private jwtConfig: ConfigType<typeof JwtConfig>,
		private dataSource: DataSource,
		private jwtExtendService: JwtExtendService,
		private emailService: EmailService
	) { }

	async register(registerDto: RegisterBody): Promise<Employee> {
		const { email, phone, username, password } = registerDto

		const existOrg = await this.dataSource.manager.findOne(Organization, { where: [{ email }, { phone }] })
		if (existOrg) {
			if (existOrg.email === email && existOrg.phone === phone) {
				throw new HttpException(ErrorMessage.Register.ExistEmailAndPhone, HttpStatus.BAD_REQUEST)
			}
			else if (existOrg.email === email) {
				throw new HttpException(ErrorMessage.Register.ExistEmail, HttpStatus.BAD_REQUEST)
			}
			else if (existOrg.phone === phone) {
				throw new HttpException(ErrorMessage.Register.ExistPhone, HttpStatus.BAD_REQUEST)
			}
		}

		const hashPassword = await bcrypt.hash(password, 5)
		const employee = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const organizationSnap = manager.create(Organization, { phone, email, level: 1 })
			const organization = await manager.save(organizationSnap)

			const employeeSnap = manager.create(Employee, {
				oid: organization.id,
				username,
				password: hashPassword,
				secret: encrypt(password, username),
				role: ERole.Admin,
			})
			const employee = await manager.save(employeeSnap)
			employee.organization = organization
			return employee
		})

		return employee
	}

	async login(loginDto: LoginBody): Promise<Employee> {
		const [employee] = await this.dataSource.getRepository(Employee).find({
			relations: { organization: true },
			relationLoadStrategy: 'join',
			where: {
				username: loginDto.username,
				organization: { phone: loginDto.orgPhone },
			},
		})
		if (!employee) throw new HttpException(ErrorMessage.User.NotExist, HttpStatus.BAD_REQUEST)

		const checkPassword = await bcrypt.compare(loginDto.password, employee.password)
		if (!checkPassword) throw new HttpException(ErrorMessage.User.WrongPassword, HttpStatus.BAD_REQUEST)

		return employee
	}

	async loginDemo(): Promise<Employee> {
		const [employee] = await this.dataSource.getRepository(Employee).find({
			relations: { organization: true },
			relationLoadStrategy: 'query', // dùng join+findOne thì bị lỗi 2 câu query
			where: { id: 1, organization: { id: 1 } },
		})
		if (!employee) throw new HttpException(ErrorMessage.User.NotExist, HttpStatus.BAD_REQUEST)

		return employee
	}

	async forgotPassword(body: ForgotPasswordBody): Promise<any> {
		const organization = await this.dataSource.manager.findOne(
			Organization,
			{ where: { phone: body.orgPhone, email: body.email } }
		)
		if (!organization) throw new HttpException(ErrorMessage.Organization.NotExist, HttpStatus.BAD_REQUEST)

		const employee = await this.dataSource.manager.findOne(Employee, {
			where: {
				username: body.username,
				oid: organization.id,
			},
		})
		if (!employee) throw new HttpException(ErrorMessage.User.NotExist, HttpStatus.BAD_REQUEST)

		const token = encodeURIComponent(encrypt(employee.password, this.jwtConfig.accessKey, 30 * 60 * 1000))
		const link = `${this.globalConfig.domain}/auth/reset-password?token=${token}&org_phone=${body.orgPhone}&username=${body.username}&ver=1`

		await this.emailService.send({
			to: body.email,
			subject: '[Medihome] - Quên mật khẩu',
			from: 'medihome.vn@gmail.com',
			text: 'welcome', // plaintext body
			html: '<p>Bạn nhận được yêu cầu reset mật khẩu. Nhấn vào đường link sau để cập nhật mật khẩu mới: </p>'
				+ `<p><a href="${link}' + recovery_token + '">${link}</a></p>`
				+ '<p>Link sẽ bị vô hiệu hóa sau 30 phút</p>',
		})

		return { success: true }
	}

	async resetPassword(body: ResetPasswordBody): Promise<any> {
		const [employee] = await this.dataSource.getRepository(Employee).find({
			relations: { organization: true },
			where: {
				username: body.username,
				organization: { phone: body.orgPhone },
			},
		})
		if (!employee) throw new HttpException(ErrorMessage.User.NotExist, HttpStatus.BAD_REQUEST)

		let hash: string
		try {
			hash = decrypt(body.token, this.jwtConfig.accessKey)
		} catch (error) {
			throw new HttpException(ErrorMessage.Token.Expired, HttpStatus.BAD_REQUEST)
		}
		if (employee.password !== hash) {
			throw new HttpException(ErrorMessage.Token.Invalid, HttpStatus.BAD_REQUEST)
		}

		employee.password = await bcrypt.hash(body.password, 5)
		employee.secret = encrypt(body.password, body.username)
		await this.dataSource.manager.save(employee)
		return employee
	}

	async grantAccessToken(refreshToken: string, ip: string) {
		const { uid, oid } = this.jwtExtendService.verifyRefreshToken(refreshToken, ip)

		const [employee] = await this.dataSource.getRepository(Employee).find({
			relations: { organization: true },
			where: { id: uid, oid },
		})
		if (!employee) throw new HttpException(ErrorMessage.User.NotExist, HttpStatus.BAD_REQUEST)
		return this.jwtExtendService.createAccessToken(employee, ip)
	}
}
