// import types from 'src/utils/types'
import { i18n } from 'src/boot/i18n';
const { t } = i18n.global

const parseMessage = (item) => {
  // item.loading = false
  item.isSelected = false
  return item
}

export const getParsedMessages = (items) => {
  const messages = []
  items.forEach((item) => {
    messages.push(parseMessage(item))
  })
  return messages
}

export const getFilteredItems = (items, key) => {
  return items.filter((item) => {
    if (item[key]) {
      return item
    }
  })
}