import { FOLDER_TYPES } from '../enums'

function assignCurrentFolder (state) {
  const currentFolderList = state.folderLists[state.currentAccountId]
  if (currentFolderList) {
    const flatList = currentFolderList.flatList
    let currentFolder = state.currentFolder
    if (currentFolder && currentFolder.accountId !== state.currentAccountId) {
      currentFolder = null
    }
    if (currentFolder && !flatList.find(folder => folder.fullName === currentFolder.fullName)) {
      currentFolder = null
    }
    if (!currentFolder) {
      currentFolder = flatList.find(folder => folder.type === FOLDER_TYPES.INBOX)
      if (!currentFolder && flatList.length > 0) {
        currentFolder = flatList[0]
      }
    }
    state.currentFolder = currentFolder
  } else {
    state.currentFolder = null
  }
}

export default {
  setAccountList: (state, accountList) => {
    state.accountList = accountList
  },

  setCurrentAccountId: (state, currentAccountId) => {
    if (state.currentAccountId !== currentAccountId) {
      state.currentAccountId = currentAccountId
      assignCurrentFolder(state)
    }
  },

  setFolderList: (state, {accountId, namespace, tree, flatList}) => {
    state.folderLists[accountId] = {accountId, namespace, tree, flatList, count: flatList.length}
    console.log(state.folderLists[accountId])
    if (accountId === state.currentAccountId) {
      assignCurrentFolder(state)
    }
  },

  setCurrentFolder: (state, folder) => {
    if (folder.accountId === state.currentAccountId) {
      state.currentFolder = folder
    }
  },

  setMessageListLoading: (state, isMessageListLoading) => {
    state.isMessageListLoading = isMessageListLoading
  },

  setMessageList: (state, { accountId, folderFullName, list }) => {
    if (accountId === state.currentFolder.accountId && folderFullName === state.currentFolder.fullName) {
      state.currentMessageList = list
    }
  },
}
