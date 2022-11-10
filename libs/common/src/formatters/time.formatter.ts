export const timeToText = (time?: Date | string | number | null, pattern = 'DD/MM/YYYY', offset?: number): string => {
	if (time == null || time === '') return ''
	if (typeof time !== 'object') time = new Date(time)
	if (time.toString() === 'Invalid Date') return 'Invalid Date'

	if (offset == null) offset = time.getTimezoneOffset()

	const date = new Date(time.getTime() - offset * 60 * 1000)
	const rules = {
		YYYY: `${date.getUTCFullYear()}`,
		YY: `${date.getUTCFullYear()}`.slice(-2),
		MM: `0${date.getUTCMonth() + 1}`.slice(-2),
		DD: `0${date.getUTCDate()}`.slice(-2),
		hh: `0${date.getUTCHours()}`.slice(-2),
		mm: `0${date.getUTCMinutes()}`.slice(-2),
		ss: `0${date.getUTCSeconds()}`.slice(-2),
		xxx: `00${date.getUTCMilliseconds()}`.slice(-3),
	}

	let text = pattern
	Object.entries(rules).forEach(([key, value]) => {
		const re = new RegExp(key, 'g')
		text = text.replace(re, value)
	})

	return text
}

export const textToTime = (text: string, pattern: string): Date => {
	const iFullYear = pattern.indexOf('YYYY')
	const iMonth = pattern.indexOf('MM')
	const iDay = pattern.indexOf('DD')
	const iHours = pattern.indexOf('hh')
	const iMinutes = pattern.indexOf('mm')
	const iSeconds = pattern.indexOf('ss')
	const iMs = pattern.indexOf('xxx')

	const year = iFullYear !== -1 ? Number(text.slice(iFullYear, iFullYear + 4)) : 0
	const month = iMonth !== -1 ? Number(text.slice(iMonth, iMonth + 2)) : 0
	const date = iDay !== -1 ? Number(text.slice(iDay, iDay + 2)) : 0
	const hours = iHours !== -1 ? Number(text.slice(iHours, iHours + 2)) : 0
	const minutes = iMinutes !== -1 ? Number(text.slice(iMinutes, iMinutes + 2)) : 0
	const seconds = iSeconds !== -1 ? Number(text.slice(iSeconds, iSeconds + 2)) : 0
	const milliseconds = iMs !== -1 ? Number(text.slice(iMs, iMs + 3)) : 0

	const time = new Date()
	time.setFullYear(year)
	time.setMonth(month - 1)
	time.setDate(date)
	time.setHours(hours)
	time.setMinutes(minutes)
	time.setSeconds(seconds)
	time.setMilliseconds(milliseconds)

	return time
}
