import modulesManager from 'src/modules-manager'
import eventBus from 'src/event-bus'

import { useMailStore } from '../store/index-pinia'
import { FOLDER_TYPES } from '../enums'

export function isSearchAvailable() {
  return modulesManager.isModuleAvailable('MailMobileWebclient')
}

export function searchMessagesInInbox(searchText, router) {
  if (!isSearchAvailable() || !searchText || !router) {
    return false
  }

  const mailStore = useMailStore()

  mailStore.showUnifiedInbox(false)
  mailStore.changeCurrentSearchText(searchText)
  mailStore.changeCurrentFilter('')
  mailStore.changeMessageListPage(1)

  const accountId = mailStore.currentAccountId
  const inboxFolder = mailStore.getFolderByType(accountId, FOLDER_TYPES.INBOX)
  const delimiter = mailStore.currentFoldersDelimiter || '/'
  const inboxFullName = inboxFolder?.fullName || 'INBOX'

  mailStore.changeCurrentFolder(inboxFullName)

  return router.push({
    name: 'message-list',
    params: {
      accountId,
      folderPath: inboxFullName.split(delimiter),
    },
  }).then(() => {
    eventBus.$emit('openSearch', searchText)
    return true
  }).catch(() => false)
}

export default {
  isSearchAvailable,
  searchMessagesInInbox,
}
