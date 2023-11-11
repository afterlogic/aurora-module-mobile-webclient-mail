export default function () {
  return {
    dialogComponent: null,
    accountList: [],
    isUnifiedInbox: false,
    currentAccountId: 0,

    isFolderListLoading: false,
    folderLists: new Map(),
    currentFolder: null,
    unifiedInboxInfo: {
      count: 0,
      unseenCount: 0,
      nextUid: '',
      hash: '',
    },

    isMessageListLoading: false,
    currentSearchText: '',
    currentFilter: '',
    messageListPage: 1,
    currentMessageList: [],

    isCurrentMessageLoading: false,
    currentMessageIdentifiers: null,
    currentMessageHeaders: null,
    currentMessage: null,
  }
}
