export default function () {
  return {
    accountList: [],
    isUnifiedInbox: false,
    currentAccountId: 0,

    isFolderListLoading: false,
    folderLists: {},
    currentFolder: null,

    isMessageListLoading: false,
    currentFilter: '',
    currentMessageList: [],

    isCurrentMessageLoading: false,
    currentMessageIdentifiers: null,
    currentMessageHeaders: null,
    currentMessage: null,
  }
}
