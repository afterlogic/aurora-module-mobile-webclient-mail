import _ from 'lodash'

import accountsUtils from '../utils/accounts'
import mailWebApi from '../mail-web-api'
import { addMessageToCache, getMessageFromCache } from '../cache'

export default {
  parseAccounts: ({ commit }, accountsData) => {
    const parsedAccountsData = accountsUtils.parseAccounts(accountsData)
    commit('setAccountList', parsedAccountsData.accountList)
    commit('setCurrentAccountId', parsedAccountsData.currentAccountId)
  },

  changeCurrentAccount: ({ commit, getters }, accountId) => {
    commit('setCurrentAccountId', accountId)
  },

  asyncGetFolders: async ({ getters, dispatch, commit }) => {
    const parameters = {
      AccountID: getters['currentAccountId'],
    }
    commit('setFolderListLoading', true)
    const foldersData = await mailWebApi.getFolders(parameters)
    commit('setFolderListLoading', false)
    if (_.isObject(foldersData)) {
      const { accountId, namespace, tree, flatList, newFoldersFullNames } = foldersData
      commit('setFolderList', { accountId, namespace, tree, flatList })
      dispatch('asyncGetRelevantFoldersInformation', newFoldersFullNames)
    }
  },

  asyncGetRelevantFoldersInformation: async ({ commit, getters }, foldersFullNames) => {
    if (!_.isEmpty(foldersFullNames)) {
      const parameters = {
        AccountID: getters['currentAccountId'],
        Folders: foldersFullNames,
        UseListStatusIfPossible: getters['currentFoldersCount'] < 100 || foldersFullNames.length > 50,
      }
      const foldersData = await mailWebApi.getRelevantFoldersInformation(parameters)
      if (foldersData?.Counts) {
        commit('setRelevantFoldersInformation', foldersData.Counts)
      }
    }
  },

  changeCurrentFolder: ({ commit }, folderFullName) => {
    commit('setCurrentFolder', folderFullName)
  },

  changeCurrentFilter: ({ commit }, currentFilter) => {
    commit('setCurrentFilter', currentFilter)
  },

  asyncGetMessages: async ({ getters, commit }) => {
    const currentFolder = getters['currentFolder']
    if (!currentFolder) {
      return
    }

    const parameters = {
      AccountID: currentFolder.accountId,
      Folder: currentFolder.fullName,
      Offset: 0,
      Limit: 20,
      Search: '',
      Filters: getters['currentFilter'],
      SortBy: 'arrival',
      SortOrder: 1,
      UseThreading: true,
      InboxUidnext: '',
    }
    commit('setMessageListLoading', true)
    const messages = await mailWebApi.getMessages(parameters)
    commit('setMessageListLoading', false)
    commit('setMessageList', {
      accountId: parameters.AccountID,
      folderFullName: parameters.Folder,
      list: messages,
    })
  },

  changeSelectStatus: ({ commit }, message) => {
    commit('setSelectStatus', message)
  },

  changeCurrentMessageUid: ({ commit }, currentMessageUid) => {
    let parsedMessageUid = parseInt(currentMessageUid, 10)
    if (Number.isNaN(parsedMessageUid)) {
      parsedMessageUid = 0
    }
    commit('setCurrentMessageUid', parsedMessageUid)
  },

  asyncGetCurrentMessage: async ({ getters, commit }) => {
    const currentFolder = getters['currentFolder']
    const currentMessageUid = getters['currentMessageUid']
    if (!currentFolder || currentMessageUid === 0) {
      return
    }

    const messageFromCache = getMessageFromCache(currentFolder.accountId, currentFolder.fullName, currentMessageUid)
    if (messageFromCache) {
      commit('setCurrentMessage', messageFromCache)
    } else {
      const parameters = {
        AccountID: currentFolder.accountId,
        Folder: currentFolder.fullName,
        Uid: currentMessageUid,
        MessageBodyTruncationThreshold: 650000, // TODO: use the setting
      }
      commit('setCurrentMessageLoading', true)
      const messageFromServer = await mailWebApi.getMessage(parameters)
      commit('setCurrentMessage', messageFromServer)
      commit('setCurrentMessageLoading', false)
      addMessageToCache(currentFolder.accountId, currentFolder.fullName, currentMessageUid, messageFromServer)
    }
  },
}
