import _ from 'lodash'

import accountsUtils from '../utils/accounts'
import mailWebApi from '../mail-web-api'
import settings from '../settings'
import { addMessageToCache, getMessageFromCache } from '../cache'

export default {
  parseAccounts: ({ commit }, accountsData) => {
    const parsedAccountsData = accountsUtils.parseAccounts(accountsData)
    commit('setAccountList', parsedAccountsData.accountList)
    commit('setCurrentAccountId', parsedAccountsData.currentAccountId)
  },

  showUnifiedInbox: ({ commit }, isUnifiedInbox) => {
    commit('setUnifiedInbox', isUnifiedInbox)
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
    const parameters = {
      Offset: 0,
      Limit: 20,
      Search: '',
      Filters: getters['currentFilter'],
      SortBy: 'arrival',
      SortOrder: 1,
      UseThreading: true,
      InboxUidnext: '',
    }

    const isUnifiedInbox = getters['isUnifiedInbox']
    if (!isUnifiedInbox) {
      const currentFolder = getters['currentFolder']
      if (!currentFolder) {
        return
      }
      parameters.AccountID = currentFolder.accountId
      parameters.Folder = currentFolder.fullName
    }

    commit('setMessageListLoading', true)
    const messages = await mailWebApi.getMessages(parameters, isUnifiedInbox)
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

  changeCurrentMessageIdentifiers: ({ commit }, identifiers) => {
    commit('setCurrentMessageIdentifiers', identifiers)
  },

  asyncGetCurrentMessage: async ({ getters, commit }) => {
    const messageIdentifiers = getters['currentMessageIdentifiers']
    if (!messageIdentifiers) {
      return
    }

    const messageFromCache = getMessageFromCache(
      messageIdentifiers.accountId,
      messageIdentifiers.folder,
      messageIdentifiers.uid
    )
    if (messageFromCache) {
      commit('setCurrentMessage', messageFromCache)
    } else {
      const parameters = {
        AccountID: messageIdentifiers.accountId,
        Folder: messageIdentifiers.folder,
        Uid: messageIdentifiers.uid,
        MessageBodyTruncationThreshold: settings.get('messageBodyTruncationThreshold'),
      }
      commit('setCurrentMessageLoading', true)
      const messageFromServer = await mailWebApi.getMessage(parameters)
      commit('setCurrentMessage', messageFromServer)
      commit('setCurrentMessageLoading', false)
      addMessageToCache(
        messageIdentifiers.accountId,
        messageIdentifiers.folder,
        messageIdentifiers.uid,
        messageFromServer
      )
    }
  },
}
