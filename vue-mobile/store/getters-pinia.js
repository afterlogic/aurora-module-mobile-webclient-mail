import settings from '../settings'
import { isPagedListEndReached } from '../utils/paged-list-end'

export default {
  messageListItemsPerPage: () => 20,

  isMessageListEndReached: (state) => {
    const folderCount = state.isUnifiedInbox
      ? (state.unifiedInboxInfo?.count ?? 0)
      : (state.currentFolder?.count ?? 0)
    const totalCount = Math.max(state.numberOfMessages || 0, folderCount)

    return isPagedListEndReached({
      listLength: (state.currentMessageList || []).length,
      totalCount,
      lastPageCount: state.messageListLastPageCount || 0,
      itemsPerPage: 20,
    })
  },

  isAllowedUnifiedInbox() {
    if (!settings.get('allowUnifiedInbox')) {
      return false
    }
    const accountList = this.$state.accountList || []
    const includedAccounts = accountList.filter((account) => account.includeInUnifiedMailbox)
    return includedAccounts.length > 1
  },

  unifiedInboxUnseenCount: (state) => state.unifiedInboxInfo?.unseenCount ?? 0,

  currentAccount() {
    const accountList = this.$state.accountList || []
    return accountList.find((account) => account.id === this.$state.currentAccountId) || null
  },

  getAccount: (state) => {
    return (accountId) => (state.accountList || []).find((account) => account.id === accountId) || null
  },

  hasFolderList: (state) => {
    return (accountId) => state.folderLists.has(accountId)
  },

  newFoldersFullNames() {
    const accountList = this.$state.accountList || []
    return accountList
      .map((account) => {
        const folderList = this.$state.folderLists.get(account.id)
        return folderList && Array.isArray(folderList.newFoldersFullNames) && folderList.newFoldersFullNames.length > 0
          ? {
              accountId: folderList.accountId,
              newFoldersFullNames: folderList.newFoldersFullNames,
              totalFoldersCount: folderList.count,
            }
          : null
      })
      .filter((data) => data !== null)
  },

  currentFoldersTree: (state) => {
    const currentFolderList = state.folderLists.get(state.currentAccountId)
    return currentFolderList ? currentFolderList.tree : []
  },

  currentFoldersDelimiter: (state) => {
    const currentFolderList = state.folderLists.get(state.currentAccountId)
    return currentFolderList?.tree?.length > 0
      ? currentFolderList.tree[0].delimiter
      : '/'
  },

  getFoldersDelimiter: (state) => {
    return (accountId) => {
      const folderList = state.folderLists.get(accountId)
      return folderList?.tree?.length > 0 ? folderList.tree[0].delimiter : '/'
    }
  },

  getFolderDisplayName: (state) => {
    return (accountId, folderFullName) => {
      const folderList = state.folderLists.get(accountId)
      const folder = folderList?.flatList?.find((item) => item.fullName === folderFullName)
      return folder ? folder.displayName : folderFullName
    }
  },

  getFolderByType: (state) => {
    return (accountId, folderType) => {
      const folderList = state.folderLists.get(accountId)
      return folderList?.flatList?.find((folder) => folder.type === folderType)
    }
  },

  getFolderByFullName: (state) => {
    return (accountId, folderFullName) => {
      const folderList = state.folderLists.get(accountId)
      return folderList?.flatList?.find((folder) => folder.fullName === folderFullName) || null
    }
  },

  currentFoldersCount: (state) => {
    const currentFolderList = state.folderLists.get(state.currentAccountId)
    return currentFolderList ? currentFolderList.count : 0
  },

  selectedMessages() {
    return (this.$state.currentMessageList || []).filter((messageListItem) => messageListItem.isSelected)
  },

  isSelectMode() {
    return !!(this.$state.currentMessageList || []).find((messageListItem) => messageListItem.isSelected)
  },

  isCurrentSearchInMultiFolders: (state) => {
    const currentSearchText = state.currentSearchText || ''
    return (
      currentSearchText.indexOf('folders:sub') !== -1 || currentSearchText.indexOf('folders:all') !== -1
    )
  },
}
