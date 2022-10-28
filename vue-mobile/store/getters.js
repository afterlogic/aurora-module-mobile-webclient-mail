import settings from '../settings'

export default {
  accountList: (state) => state.accountList,

  isAllowedUnifiedInbox: (state) => {
    if (settings.get('allowUnifiedInbox')) {
      const includedAccounts = state.accountList.filter((account) => account.includeInUnifiedMailbox)
      return includedAccounts.length > 1
    }
    return false
  },

  isUnifiedInbox: (state) => state.isUnifiedInbox,

  unifiedInboxUnseenCount: (state) => state.unifiedInboxInfo.unseenCount,

  currentAccountId: (state) => state.currentAccountId,

  currentAccount: (state) => {
    return (state.accountList && state.accountList.find((account) => account.id === state.currentAccountId)) || null
  },

  getAccount: (state) => {
    return (accountId) => state.accountList.find((account) => account.id === accountId) || null
  },

  isFolderListLoading: (state) => {
    return state.isFolderListLoading
  },

  hasFolderList: (state) => {
    return (accountId) => {
      return state.folderLists.has(accountId)
    }
  },

  newFoldersFullNames: (state) => {
    return state.accountList
      .map((account) => {
        const folderList = state.folderLists.get(account.id)
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
    return currentFolderList && currentFolderList.tree && currentFolderList.tree.length > 0
      ? currentFolderList.tree[0].delimiter
      : '/'
  },

  getFoldersDelimiter: (state) => {
    return (accountId) => {
      const folderList = state.folderLists.get(accountId)
      return folderList && folderList.tree && folderList.tree.length > 0 ? folderList.tree[0].delimiter : '/'
    }
  },

  getFolderDisplayName: (state) => {
    return (accountId, folderFullName) => {
      const folderList = state.folderLists.get(accountId)
      const folder = folderList && folderList.flatList.find((folder) => folder.fullName === folderFullName)
      return folder ? folder.displayName : folderFullName
    }
  },

  getFolderByType: (state) => {
    return (accountId, folderType) => {
      const folderList = state.folderLists.get(accountId)
      return folderList && folderList.flatList.find((folder) => folder.type === folderType)
    }
  },

  currentFoldersCount: (state) => {
    const currentFolderList = state.folderLists.get(state.currentAccountId)
    return currentFolderList ? currentFolderList.count : 0
  },

  currentFolder: (state) => {
    return state.currentFolder
  },

  currentSearchText: (state) => {
    return state.currentSearchText
  },

  isCurrentSearchInMultiFolders: (state) => {
    return (
      state.currentSearchText.indexOf('folders:sub') !== -1 || state.currentSearchText.indexOf('folders:all') !== -1
    )
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
