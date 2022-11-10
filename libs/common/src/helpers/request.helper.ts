import * as https from 'https'

export const HttpsGet = (url: string) => new Promise((resolve, reject) => {
	const request = https.get(url, (res) => {
		let data = ''
		res.on('data', (chunk) => data += chunk)
		res.on('end', () => resolve(data))
	})
	request.on('error', (err) => reject(err))
	request.end()
})
