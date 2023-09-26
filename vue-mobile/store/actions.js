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

  asyncGetFolders: async ({ getters, dispatch, commit }, accountId = 0) => {
    if (accountId === 0) {
      accountId = getters['currentAccountId']
    }
    if (!getters['hasFolderList'](accountId)) {
      const parameters = { AccountID: accountId }
      commit('setFolderListLoading', true)
      const foldersData = await mailWebApi.getFolders(parameters)
      commit('setFolderListLoading', false)
      if (_.isObject(foldersData)) {
        const { accountId, namespace, tree, flatList, newFoldersFullNames } = foldersData
        commit('setFolderList', { accountId, namespace, tree, flatList, newFoldersFullNames })

        // wait until messages will be requested
        setTimeout(() => {
          if (getters['isAllowedUnifiedInbox']) {
            const account = getters['accountList'].find(
              (account) => account.includeInUnifiedMailbox && !getters['hasFolderList'](account.id)
            )
            if (account) {
              dispatch('asyncGetFolders', account.id)
            } else {
              dispatch('asyncGetUnifiedRelevantFoldersInformation')
            }
          } else {
            dispatch('asyncGetRelevantFoldersInformation')
          }
        })
      }
    }
  },

  asyncGetUnifiedRelevantFoldersInformation: async ({ commit, getters }) => {
    const newFoldersFullNames = getters['newFoldersFullNames']
    if (newFoldersFullNames.length > 0) {
      commit('clearNewFoldersFullNames')
      const parameters = {
        AccountsData: newFoldersFullNames.map((data) => ({
          AccountID: data.accountId,
          Folders: data.newFoldersFullNames,
          UseListStatusIfPossible: data.totalFoldersCount < 100 || data.newFoldersFullNames.length > 50,
        })),
      }
      const foldersData = await mailWebApi.getRelevantFoldersInformation(parameters, true)
      commit('setRelevantFoldersInformation', foldersData?.Accounts)
      commit('setRelevantUnifiedInboxInformation', foldersData?.Unified)
    }
  },

  asyncGetRelevantFoldersInformation: async ({ commit, getters }, foldersFullNames = []) => {
    const currentAccountId = getters['currentAccountId']
    if (foldersFullNames.length === 0) {
      foldersFullNames = getters['newFoldersFullNames'].find((data) => data.accountId === currentAccountId)
      commit('clearNewFoldersFullNames', currentAccountId)
    }
    if (foldersFullNames.length !== 0) {
      const parameters = {
        AccountID: currentAccountId,
        Folders: foldersFullNames,
        UseListStatusIfPossible: getters['currentFoldersCount'] < 100 || foldersFullNames.length > 50,
      }
      const foldersData = await mailWebApi.getRelevantFoldersInformation(parameters, false)
      commit('setRelevantFoldersInformation', [
        {
          AccountId: currentAccountId,
          Counts: foldersData?.Counts,
        },
      ])
    }
  },

  changeCurrentFolder: ({ commit }, folderFullName) => {
    commit('setCurrentFolder', folderFullName)
  },

  changeCurrentSearchText: ({ commit }, currentSearchText) => {
    commit('setCurrentSearchText', currentSearchText)
  },

  changeCurrentFilter: ({ commit }, currentFilter) => {
    commit('setCurrentFilter', currentFilter)
  },

  asyncGetMessages: async ({ getters, commit }) => {
    const page = getters['messageListPage']
    const itemsPerPage = 20

    const parameters = {
      Offset: ((page || 1) - 1) * itemsPerPage,
      Limit: itemsPerPage,
      Search: getters['currentSearchText'],
      Filters: getters['currentFilter'],
      SortBy: 'arrival',
      SortOrder: 1,
      UseThreading: false,
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
    const messages = await mailWebApi.getMessages(parameters, isUnifiedInbox, getters['isCurrentSearchInMultiFolders'])
    commit('setMessageListLoading', false)
    commit('setMessageList', {
      accountId: parameters.AccountID,
      folderFullName: parameters.Folder,
      list: messages,
      page: page
    })
  },

  changeMessageListPage: ({ commit }, page) => {
    commit('setMessagesListPage', page)
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
