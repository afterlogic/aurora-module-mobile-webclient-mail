export default function () {
  return {
    accountList: [],
    currentAccountId: 0,

    isFolderListLoading: false,
    folderLists: {},
    currentFolder: null,

    isMessageListLoading: false,
    currentFilter: '',
    currentMessageList: [],

    isCurrentMessageLoading: false,
    currentMessageUid: 0,
    currentMessageHeaders: null,
    currentMessage: null,
  }
}
