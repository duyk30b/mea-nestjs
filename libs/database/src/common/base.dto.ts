export interface PaginationDto<T> {
	page: number
	limit: number
	sortField?: keyof T
	sortType?: 'ASC' | 'DESC'
	searchField?: keyof T
	searchText?: string
}

export type ComparisonType = 'LIKE' | 'EQUAL'

export const escapeSearch = (str = '') => {
	return str.toLowerCase().replace(/[?%\\_]/gi, (x) => '\\' + x)
}
