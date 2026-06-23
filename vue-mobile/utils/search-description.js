import moment from 'moment'

const DATE_FORMAT_FOR_BACKEND = 'YYYY.MM.DD'
const DEFAULT_USER_DATE_FORMAT = 'MM/DD/YYYY'

function getDateFormatForMoment(dateFormat) {
  switch (dateFormat) {
    case 'MM/DD/YYYY':
      return 'MM/DD/YYYY'
    case 'DD/MM/YYYY':
      return 'DD/MM/YYYY'
    case 'DD Month YYYY':
      return 'DD MMMM YYYY'
    default:
      return DEFAULT_USER_DATE_FORMAT
  }
}

export function getSearchFoldersMode(searchText) {
  const text = searchText || ''
  if (/(^|\s)folders:all(\s|$)/.test(text)) {
    return 'all'
  }
  if (/(^|\s)folders:sub(\s|$)/.test(text)) {
    return 'sub'
  }
  return ''
}

export function formatSearchStringForDescription(searchText, userDateFormat = DEFAULT_USER_DATE_FORMAT) {
  const inputString = searchText || ''
  const userDateFormatMoment = getDateFormatForMoment(userDateFormat)
  const dateRegex = /date:([^/]*)(\/([^/]*))?/
  const match = inputString.match(dateRegex)

  let dateStart = ''
  let dateEnd = ''

  if (match) {
    const dateStartMoment = moment(match[1], DATE_FORMAT_FOR_BACKEND)
    dateStart = dateStartMoment.isValid() ? dateStartMoment.format(userDateFormatMoment) : match[1]

    const dateEndMoment = moment(match[3], DATE_FORMAT_FOR_BACKEND)
    dateEnd = dateEndMoment.isValid() ? dateEndMoment.format(userDateFormatMoment) : match[3]
  }

  let formattedInput = inputString
  if (dateStart || dateEnd) {
    const regex = /(\w+):(\S+)/g
    const matches = inputString.match(regex)
    const inputStringSplit = []

    if (matches) {
      matches.forEach((matchPart) => {
        const parts = matchPart.split(':')
        const secondPart = parts[0] === 'date' ? `${dateStart} - ${dateEnd}` : parts[1]
        inputStringSplit.push(`${parts[0]}:${secondPart}`)
      })
    }

    formattedInput = inputStringSplit.join(' ')
  }

  return formattedInput.replace(/(^|\s)folders:(all|sub)(\s|$)/, '').trim()
}

export function getSearchBannerI18nKey({ searchText, isUnifiedInbox }) {
  const mode = getSearchFoldersMode(searchText)
  const trimmedSearch = (searchText || '').trim()

  if (mode === 'sub') {
    if (isUnifiedInbox) {
      return 'INFO_SEARCH_UNIFIED_SUBFOLDERS_RESULT'
    }
    if (trimmedSearch === 'folders:sub') {
      return 'INFO_MESSAGES_FROM_SUBFOLDERS'
    }
    return 'INFO_SEARCH_SUBFOLDERS_RESULT'
  }

  if (mode === 'all') {
    if (isUnifiedInbox) {
      return 'INFO_SEARCH_UNIFIED_ALL_FOLDERS_RESULT'
    }
    if (trimmedSearch === 'folders:all') {
      return 'INFO_MESSAGES_FROM_ALL_FOLDERS'
    }
    return 'INFO_SEARCH_ALL_FOLDERS_RESULT'
  }

  return 'INFO_SEARCH_RESULT'
}

export function shouldHideClearSearch({ searchText, isStarredFolder }) {
  if (!isStarredFolder) {
    return false
  }

  return getSearchFoldersMode(searchText) === 'all' && (searchText || '').trim() === 'folders:all'
}
