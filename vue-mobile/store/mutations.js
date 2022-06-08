export default {
  setAccountList: (state, accountList) => {
    state.accountList = accountList
  },

  setCurrentAccountId: (state, currentAccountId) => {
    state.currentAccountId = currentAccountId
  },

  setFolderList: (state, {accountId, namespace, tree, flatList}) => {
    state.folderLists[accountId] = {accountId, namespace, tree, flatList, count: flatList.length}
  },
}
