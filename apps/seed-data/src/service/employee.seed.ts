// import { Injectable } from '@nestjs/common'
// import {
//     randomDate,
//     randomEnum,
//     randomFullName,
//     randomPhoneNumber,
//     randomUsername,
// } from 'library/common/helpers/random.helper'
// import { encrypt } from 'library/common/helpers/string.helper'
// import { EGender, ERole } from 'library/database/common/variable'
// import { User } from 'library/database/entities'
// import { DataSource } from 'typeorm'

// @Injectable()
// export class UserSeed {
//     constructor(private readonly dataSource: DataSource) {}

//     createFactory(oid: number, number: number) {
//         const factoryList: User[] = []
//         for (let i = 0; i < number; i++) {
//             const gender = randomEnum<EGender>(EGender)
//             const fullName = randomFullName(gender)
//             const birthday = randomDate('1980-03-28', '2001-12-29')
//             const userName = randomUsername(fullName, birthday)
//             const password = '$2b$05$G17lx6yO8fK2iJK6tqX2XODsCrawFzSht5vJQjE7wlDJO0.4zxPxO' // Abc@123456'
//             const secret = encrypt('Abc@123456', userName)

//             const employee = new User()

//             employee.oid = oid
//             employee.phone = randomPhoneNumber()
//             employee.username = userName
//             employee.password = password
//             employee.secret = secret
//             employee.role = randomEnum<ERole>(ERole)
//             employee.gender = gender
//             employee.birthday = birthday.getTime()
//             employee.fullName = fullName

//             factoryList.push(employee)
//         }
//         return factoryList
//     }

//     async start(oid: number, number: number) {
//         const admin = new User()
//         admin.username = 'admin'
//         admin.oid = oid
//         admin.password = '$2b$05$G17lx6yO8fK2iJK6tqX2XODsCrawFzSht5vJQjE7wlDJO0.4zxPxO' // Abc@123456'
//         admin.role = ERole.Admin
//         await this.dataSource
//             .getRepository(User)
//             .upsert(admin, { skipUpdateIfNoValuesChanged: true, conflictPaths: {} })

//         const employeesDto = this.createFactory(oid, number)

//         // await this.dataSource.getRepository(User).save(employeesDto, { transaction: false })
//         await this.dataSource.getRepository(User).insert(employeesDto)
//     }
// }
