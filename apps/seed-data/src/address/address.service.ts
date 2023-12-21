// import { randomFullName, randomItemsInArray, randomNumber } from 'library/common/helpers/random.helper'
// import { HttpsGet } from 'library/common/helpers/request.helper'
// import * as fs from 'fs'

// type Ward = {
//     name: string
// }

// type District = {
//     code: number
//     name: string
//     wards: Ward[]
// }

// type Province = {
//     code: number
//     name: string
//     districts: District[]
// }

// export interface AddressDto {
//     province?: string
//     district?: string
//     ward?: string
//     street?: string
// }

// const DIR = 'apps/seed-data/src/address'

// class Address {
//     provinces: Province[] = []

//     async init() {
//         try {
//             this.provinces = JSON.parse(fs.readFileSync(`${DIR}/address-min.json`, 'utf-8'))
//         } catch (error) {
//             console.log('🚀 ~ file: address.service.ts:29 ~ Address ~ initProvince ~ error', error)
//         }

//         if (this.provinces.length) return

//         const response = (await HttpsGet('https://provinces.open-api.vn/api/p/')) as string
//         this.provinces = JSON.parse(response)

//         await Promise.all(this.provinces.map((item) => this.initDistrict(item)))

//         fs.writeFileSync(`${DIR}/address.json`, JSON.stringify(this.provinces, null, 4))
//         fs.writeFileSync(`${DIR}/address-min.json`, JSON.stringify(this.provinces))
//     }

//     async initDistrict(province: Province) {
//         if (province.districts.length === 0) {
//             const response = (await HttpsGet(`https://provinces.open-api.vn/api/p/${province.code}?depth=3`)) as string
//             const data: Province = JSON.parse(response)
//             province.districts = data.districts
//         }
//     }

//     getRandomAddress(): AddressDto {
//         const province: Province = randomItemsInArray(this.provinces)
//         const district: District = randomItemsInArray(province.districts)
//         const ward: Ward = randomItemsInArray(district.wards)

//         const line = `${randomNumber(10, 999)}/${randomNumber(10, 999)} Đường ${randomFullName()}`
//         const hamlet = `Thôn ${randomFullName()}`
//         const street = randomItemsInArray([line, hamlet])

//         return {
//             province: province?.name,
//             district: district?.name,
//             ward: ward?.name,
//             street,
//         }
//     }
// }

// export const AddressData = new Address()
