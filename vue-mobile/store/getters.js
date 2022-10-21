export default {
  accountList: (state) => state.accountList,

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

  currentMessageUid: (state) => {
    return state.currentMessageUid
  },

  currentMessageHeaders: (state) => {
    return state.currentMessageHeaders
  },

  currentMessage: (state) => {
    return state.currentMessage
  },
}
