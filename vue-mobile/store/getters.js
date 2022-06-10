export default {
  accountList: state => state.accountList,

  currentAccountId: state => state.currentAccountId,

  currentAccount: state => {
    return state.accountList && state.accountList.find(account => account.id === state.currentAccountId) || null
  },

  currentFoldersTree: state => {
    const currentFolderList = state.folderLists && state.folderLists[state.currentAccountId]
    return currentFolderList ? currentFolderList.tree : []
  },

  currentFoldersCount: state => {
    const currentFolderList = state.folderLists && state.folderLists[state.currentAccountId]
    return currentFolderList ? currentFolderList.count : 0
  },

  currentFolder: state => {
    return state.currentFolder
  },

  isMessageListLoading: state => {
    return state.isMessageListLoading
  },

  currentMessageList: state => {
    return state.currentMessageList
  },
}
