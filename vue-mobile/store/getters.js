import settings from '../settings'

export default {
  accountList: (state) => state.accountList,

  isAllowedUnifiedInbox: (state) => {
    if (settings.get('AllowUnifiedInbox')) {
      const includedAccounts = state.accountList.filter((account) => account.includeInUnifiedMailbox)
      return includedAccounts.length > 1
    }
    return false
  },

  isUnifiedInbox: (state) => state.isUnifiedInbox,

  currentAccountId: (state) => state.currentAccountId,

  currentAccount: (state) => {
    return (state.accountList && state.accountList.find((account) => account.id === state.currentAccountId)) || null
  },

  isFolderListLoading: (state) => {
    return state.isFolderListLoading
  },

  currentFoldersTree: (state) => {
    const currentFolderList = state.folderLists && state.folderLists[state.currentAccountId]
    return currentFolderList ? currentFolderList.tree : []
  },

  currentFoldersDelimiter: (state) => {
    const currentFolderList = state.folderLists && state.folderLists[state.currentAccountId]
    return currentFolderList && currentFolderList.tree && currentFolderList.tree.length > 0
      ? currentFolderList.tree[0].delimiter
      : '/'
  },

  getFoldersDelimiter: (state) => {
    return (accountId) => {
      const currentFolderList = state.folderLists && state.folderLists[accountId]
      return currentFolderList && currentFolderList.tree && currentFolderList.tree.length > 0
        ? currentFolderList.tree[0].delimiter
        : '/'
    }
  },

  currentFoldersCount: (state) => {
    const currentFolderList = state.folderLists && state.folderLists[state.currentAccountId]
    return currentFolderList ? currentFolderList.count : 0
  },

  currentFolder: (state) => {
    return state.currentFolder
  },

  currentFilter: (state) => {
    return state.currentFilter
  },

  isMessageListLoading: (state) => {
    return state.isMessageListLoading
  },

  currentMessageList: (state) => {
    return state.currentMessageList
  },

  selectedMessages: (state) => {
    return state.currentMessageList.filter((messageListItem) => messageListItem.isSelected)
  },

  isSelectMode: (state) => {
    return !!state.currentMessageList.find((messageListItem) => messageListItem.isSelected)
  },

  isCurrentMessageLoading: (state) => {
    return state.isCurrentMessageLoading
  },

  currentMessageIdentifiers: (state) => {
    return state.currentMessageIdentifiers
  },

  currentMessageHeaders: (state) => {
    return state.currentMessageHeaders
  },

  currentMessage: (state) => {
    return state.currentMessage
  },
}
