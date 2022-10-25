import { FOLDER_TYPES } from '../enums'

export default {
  setAccountList: (state, accountList) => {
    state.accountList = accountList
  },

  setUnifiedInbox: (state, isUnifiedInbox) => {
    state.isUnifiedInbox = isUnifiedInbox
  },

  setCurrentAccountId: (state, newAccountId) => {
    const parsedNewAccountId = parseInt(newAccountId, 10)
    if (
      state.currentAccountId !== parsedNewAccountId &&
      Array.isArray(state.accountList) &&
      state.accountList.length > 0
    ) {
      if (state.accountList.find((account) => account.id === parsedNewAccountId)) {
        state.currentAccountId = parsedNewAccountId
      } else if (!state.accountList.find((account) => account.id === state.currentAccountId)) {
        state.currentAccountId = state.accountList[0].id
      }
    }
  },

  setFolderListLoading: (state, isFolderListLoading) => {
    state.isFolderListLoading = isFolderListLoading
  },

  setFolderList: (state, { accountId, namespace, tree, flatList }) => {
    state.folderLists[accountId] = {
      accountId,
      namespace,
      tree,
      flatList,
      count: flatList.length,
    }
  },

  setRelevantFoldersInformation: (state, relevantFoldersInformation) => {
    const currentFolderList = state.folderLists && state.folderLists[state.currentAccountId]
    if (currentFolderList && currentFolderList.flatList) {
      Object.keys(relevantFoldersInformation).forEach((folderFullName) => {
        const folder = currentFolderList.flatList.find((folder) => folder.fullName === folderFullName)
        if (folder) {
          const [count, unseenCount, nextUid, hash] = relevantFoldersInformation[folderFullName]
          folder.count = count
          folder.unseenCount = unseenCount
          folder.nextUid = nextUid
          folder.hash = hash
        }
      })
    }
  },

  setCurrentFolder: (state, folderFullName) => {
    const currentFolderList = state.folderLists && state.folderLists[state.currentAccountId]
    if (currentFolderList) {
      const { flatList } = currentFolderList
      let folder = flatList.find((folder) => folder.fullName === folderFullName)
      if (!folder) {
        folder = state.currentFolder
      }
      if (!folder) {
        folder = flatList.find((folder) => folder.type === FOLDER_TYPES.INBOX)
      }
      if (!folder && flatList.length > 0) {
        folder = flatList[0]
      }
      if (!state.currentFolder || folder.fullName !== state.currentFolder.fullName) {
        state.currentFolder = folder
      }
    }
  },

  setCurrentFilter: (state, currentFilter) => {
    state.currentFilter = currentFilter
  },

  setMessageListLoading: (state, isMessageListLoading) => {
    state.isMessageListLoading = isMessageListLoading
  },

  setMessageList: (state, { accountId, folderFullName, list }) => {
    if (
      state.isUnifiedInbox ||
      (accountId === state.currentFolder.accountId && folderFullName === state.currentFolder.fullName)
    ) {
      state.currentMessageList = list
    }
  },

  setSelectStatus: (state, message) => {
    message.isSelected = !message.isSelected
  },

  setCurrentMessageLoading: (state, isCurrentMessageLoading) => {
    state.isCurrentMessageLoading = isCurrentMessageLoading
  },

  setCurrentMessageIdentifiers: (state, messageIdentifiers) => {
    state.currentMessageIdentifiers = messageIdentifiers
    state.currentMessageHeaders =
      (messageIdentifiers &&
        state.currentMessageList.find(
          (messageListItem) =>
            messageListItem.accountId === messageIdentifiers.accountId &&
            messageListItem.folder === messageIdentifiers.folder &&
            messageListItem.uid === messageIdentifiers.uid
        )) ||
      null
  },

  setCurrentMessage: (state, currentMessage) => {
    state.currentMessage = currentMessage
  },
}
