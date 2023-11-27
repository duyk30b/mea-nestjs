const _CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + '!@#$%^&*()_-[]{};\':",./<>?'

export const randomString = (length = 10, characters = _CHARSET): string => {
    let result = ''
    for (let i = 0; i < length; i += 1) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}

export const randomId = (): string => Date.now().toString(36) + randomString()

const generateCharset = (privateKey: string, charset = _CHARSET): string => {
    let tempString = charset
    let result = ''
    for (let i = 0; i < _CHARSET.length; i += 1) {
        const kIndex = i % privateKey.length
        const charCode = privateKey.charCodeAt(kIndex)
        const tIndex = charCode % tempString.length

        result = tempString[tIndex] + result
        tempString = tempString.substring(tIndex + 1) + tempString.substring(0, tIndex)
    }
    return result
}

export const encrypt = (rootString: string, privateKey?: string, expiryTime?: number): string => {
    if (!privateKey) privateKey = 'ABC123'
    const rootObject = { r: rootString, e: expiryTime != null ? Date.now() + expiryTime : null }
    const rootObjectJson = JSON.stringify(rootObject)
    let hash = generateCharset(privateKey)
    let result = ''
    for (let i = 0; i < rootObjectJson.length; i += 1) {
        hash = generateCharset(privateKey, hash)
        const index = _CHARSET.indexOf(rootObjectJson[i])
        if (index === -1) {
            result += rootObjectJson[i]
        } else {
            result += hash[index]
        }
    }
    return result
}

export const decrypt = (cipherText: string, privateKey?: string): string => {
    if (!privateKey) privateKey = 'ABC123'
    let hash = generateCharset(privateKey)
    let rootObjectJson = ''
    for (let i = 0; i < cipherText.length; i += 1) {
        hash = generateCharset(privateKey, hash)
        const index = hash.indexOf(cipherText[i])
        if (index === -1) {
            rootObjectJson += cipherText[i]
        } else {
            rootObjectJson += _CHARSET[index]
        }
    }

    let r: string, e: number
    try {
        const parse = JSON.parse(rootObjectJson)
        r = parse.r as string
        e = parse.e as number
    } catch (error: any) {
        throw new Error('invalid privateKey')
    }

    if (e != null && e < Date.now()) {
        throw new Error('String invalid expiry time')
    }
    return r
}

export const convertViToEn = (root: string): string =>
    root
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')

// export const formatNumber = (number: number, fixed = 3, part = 3, sec = ',', dec = '.') => {
//     const regex = '\\d(?=(\\d{' + part + '})+' + (fixed > 0 ? '\\D' : '$') + ')'
//     return number
//         .toFixed(fixed)
//         .replace('.', dec)
//         .replace(new RegExp(regex, 'g'), '$&' + sec)
// }

export const formatNumber = (number: number, part = 3, sec = ',', dec = '.') => {
    const numberStr = (number || 0).toString()
    const regex = '\\d(?=(\\d{' + part + '})+' + (numberStr.includes('.') ? '\\D' : '$') + ')'
    return numberStr.replace('.', dec).replace(new RegExp(regex, 'g'), '$&' + sec)
}

export const snakeCaseToCamelCase = (input: string) => input.replace(/(_\w)/g, (k) => k[1].toUpperCase())

export const camelCaseToSnakeCase = (input: string) => input.replace(/[A-Z]/g, (k) => `_${k.toLowerCase()}`)

export const formatUrlEncode = (text: string) => {
    // remove all symbol, keep: . * - _
    return text.replace(/[^a-zA-Z0-9_\-.*]+/g, '')
}
