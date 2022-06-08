import _ from 'lodash'

import accountsUtils from '../utils/accounts'
import mailWebApi from '../mail-web-api'

export default {
  parseAccounts: ({ commit }, accountsData) => {
    const parsedAccountsData = accountsUtils.parseAccounts(accountsData)
    commit('setAccountList', parsedAccountsData.accountList)
    commit('setCurrentAccountId', parsedAccountsData.currentAccountId)
  },

  changeCurrentAccount: ({ commit, getters }, account) => {
    console.log('account', account)
  },

  asyncGetFolders: async ({ getters, dispatch, commit }) => {
    const parameters = {
      AccountID: getters['currentAccountId']
    }
    const foldersData = await mailWebApi.getFolders(parameters)
    if (_.isObject(foldersData)) {
      const {accountId, namespace, tree, flatList, newFoldersFullNames} = foldersData
      commit('setFolderList', {accountId, namespace, tree, flatList})
      dispatch('asyncGetRelevantFoldersInformation', newFoldersFullNames)
    }
  },

  asyncGetRelevantFoldersInformation: async ({ commit, getters }, foldersFullNames) => {
    if (!_.isEmpty(foldersFullNames)) {
      // const parameters = {
      //   AccountID: getters['currentAccountId'],
      //   Folders: foldersFullNames,
      //   UseListStatusIfPossible: getters['currentFoldersCount'] < 100 || foldersFullNames.length > 50
      // }
      // const foldersData = await mailWebApi.getRelevantFoldersInformation(parameters)
    }
  },

  changeCurrentFolder: ({ commit, getters }, folder) => {
    console.log('folder', folder)
  },
}
