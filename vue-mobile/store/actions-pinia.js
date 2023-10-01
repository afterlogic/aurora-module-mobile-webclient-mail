import _ from 'lodash'

import accountsUtils from '../utils/accounts'
import mailWebApi from '../mail-web-api'
import settings from '../settings'
import { addMessageToCache, getMessageFromCache } from '../cache'

export default {
  parseAccounts(accountsData) {
    const parsedAccountsData = accountsUtils.parseAccounts(accountsData)
    // commit('setAccountList', parsedAccountsData.accountList)
    // commit('setCurrentAccountId', parsedAccountsData.currentAccountId)
    this.accountList = parsedAccountsData.accountList
    this.changeCurrentAccount(parsedAccountsData.currentAccountId)
  },

  showUnifiedInbox(isUnifiedInbox) {
    // commit('setUnifiedInbox', isUnifiedInbox)
    this.isUnifiedInbox = isUnifiedInbox
  },

  changeCurrentAccount(newAccountId) {
    // commit('setCurrentAccountId', accountId)
    const parsedNewAccountId = parseInt(newAccountId, 10)
    if (
      this.currentAccountId !== parsedNewAccountId &&
      Array.isArray(this.accountList) &&
      this.accountList.length > 0
    ) {
      if (this.accountList.find((account) => account.id === parsedNewAccountId)) {
        this.currentAccountId = parsedNewAccountId
      } else if (!this.accountList.find((account) => account.id === this.currentAccountId)) {
        this.currentAccountId = this.accountList[0].id
      }
    }
  },

  async asyncGetFolders(accountId = 0) {
    if (accountId === 0) {
      accountId = this.currentAccountId
    }
    if (!this.hasFolderList(accountId)) {
      const parameters = { AccountID: accountId }

      this.isFolderListLoading = true
      const foldersData = await mailWebApi.getFolders(parameters)
      this.isFolderListLoading = false

      if (_.isObject(foldersData)) {
        const { accountId, namespace, tree, flatList, newFoldersFullNames } = foldersData
        // commit('setFolderList', { accountId, namespace, tree, flatList, newFoldersFullNames })
        this.folderLists.set(accountId, {
          accountId,
          namespace,
          tree,
          flatList,
          count: flatList.length,
          newFoldersFullNames,
        })

        // wait until messages will be requested
        setTimeout(() => {
          if (this.isAllowedUnifiedInbox) {
            const account = this.accountList.find(
              (account) => account.includeInUnifiedMailbox && !this.hasFolderList(account.id)
            )
            if (account) {
              // dispatch('asyncGetFolders', account.id)
              this.asyncGetFolders(account.id)
            } else {
              // dispatch('asyncGetUnifiedRelevantFoldersInformation')
              this.asyncGetUnifiedRelevantFoldersInformation()
            }
          } else {
            // dispatch('asyncGetRelevantFoldersInformation')
            this.asyncGetRelevantFoldersInformation()
          }
        })
      }
    }
  },

  async asyncGetUnifiedRelevantFoldersInformation() {
    const newFoldersFullNames = this.newFoldersFullNames
    if (newFoldersFullNames.length > 0) {
      this.clearNewFoldersFullNames()
      const parameters = {
        AccountsData: newFoldersFullNames.map((data) => ({
          AccountID: data.accountId,
          Folders: data.newFoldersFullNames,
          UseListStatusIfPossible: data.totalFoldersCount < 100 || data.newFoldersFullNames.length > 50,
        })),
      }
      const foldersData = await mailWebApi.getRelevantFoldersInformation(parameters, true)
      // commit('setRelevantFoldersInformation', foldersData?.Accounts)
      // commit('setRelevantUnifiedInboxInformation', foldersData?.Unified)
      this.setRelevantFoldersInformation(foldersData?.Accounts)
      this.setRelevantUnifiedInboxInformation(foldersData?.Unified)
    }
  },

  setRelevantFoldersInformation(accountsFoldersData) {
    if (Array.isArray(accountsFoldersData)) {
      accountsFoldersData.forEach((accountFoldersData) => {
        const currentFolderList = this.folderLists.get(accountFoldersData.AccountId)
        if (currentFolderList && _.isObject(accountFoldersData.Counts)) {
          Object.keys(accountFoldersData.Counts).forEach((folderFullName) => {
            const folder = currentFolderList.flatList.find((folder) => folder.fullName === folderFullName)
            if (folder) {
              const [count, unseenCount, nextUid, hash] = accountFoldersData.Counts[folderFullName]
              folder.count = count
              folder.unseenCount = unseenCount
              folder.nextUid = nextUid
              folder.hash = hash
            }
          })
        }
      })
    }
  },

  setRelevantUnifiedInboxInformation(relevantUnifiedInboxInformation) {
    if (Array.isArray(relevantUnifiedInboxInformation)) {
      const [count, unseenCount, nextUid, hash] = relevantUnifiedInboxInformation
      this.unifiedInboxInfo.count = count
      this.unifiedInboxInfo.unseenCount = unseenCount
      this.unifiedInboxInfo.nextUid = nextUid
      this.unifiedInboxInfo.hash = hash
    }
  },

  async asyncGetRelevantFoldersInformation(foldersFullNames = []) {
    const currentAccountId = this.currentAccountId
    if (foldersFullNames.length === 0) {
      foldersFullNames = this.newFoldersFullNames.find((data) => data.accountId === currentAccountId)
      // commit('clearNewFoldersFullNames', currentAccountId)
      this.clearNewFoldersFullNames(currentAccountId)
    }
    if (foldersFullNames.length !== 0) {
      const parameters = {
        AccountID: currentAccountId,
        Folders: foldersFullNames,
        UseListStatusIfPossible: this.currentFoldersCount < 100 || foldersFullNames.length > 50,
      }
      const foldersData = await mailWebApi.getRelevantFoldersInformation(parameters, false)
      this.setRelevantFoldersInformation([
        {
          AccountId: currentAccountId,
          Counts: foldersData?.Counts,
        },
      ])
    }
  },

  clearNewFoldersFullNames(currentAccountId = 0) {
    this.folderLists.forEach((folderList) => {
      if (currentAccountId === 0 || currentAccountId === folderList.accountId) {
        folderList.newFoldersFullNames = []
      }
    })
  },

  changeCurrentFolder(folderFullName) {
    const currentFolderList = this.folderLists.get(this.currentAccountId)
    if (currentFolderList) {
      const { flatList } = currentFolderList
      let folder = flatList.find((folder) => folder.fullName === folderFullName)
      if (!folder) {
        folder = this.currentFolder
      }
      if (!folder) {
        folder = flatList.find((folder) => folder.type === FOLDER_TYPES.INBOX)
      }
      if (!folder && flatList.length > 0) {
        folder = flatList[0]
      }
      if (!this.currentFolder || folder.fullName !== this.currentFolder.fullName) {
        this.currentFolder = folder
      }
    }
  },

  changeCurrentSearchText(currentSearchText) {
    this.currentSearchText = currentSearchText
  },

  changeCurrentFilter(currentFilter) {
    this.currentFilter = currentFilter
  },

  async asyncGetMessages() {
    const page = this.messageListPage
    const itemsPerPage = 20

    const parameters = {
      Offset: ((page || 1) - 1) * itemsPerPage,
      Limit: itemsPerPage,
      Search: this.currentSearchText,
      Filters: this.currentFilter,
      SortBy: 'arrival',
      SortOrder: 1,
      UseThreading: false,
      InboxUidnext: '',
    }

    const isUnifiedInbox = this.isUnifiedInbox
    if (!isUnifiedInbox) {
      const currentFolder = this.currentFolder
      if (!currentFolder) {
        return
      }
      parameters.AccountID = currentFolder.accountId
      parameters.Folder = currentFolder.fullName
    }

    this.isMessageListLoading = true
    let messages = await mailWebApi.getMessages(parameters, isUnifiedInbox, this.isCurrentSearchInMultiFolders)
    this.isMessageListLoading = false
    if (this.isUnifiedInbox
      || (parameters.AccountID === this.currentFolder.accountId && parameters.Folder === this.currentFolder.fullName)
    ) {
      if (page > 1) {
        messages = this.currentMessageList.concat(messages)
      }

      this.currentMessageList = Array.isArray(messages) ? messages : []
    }
  },

  changeMessageListPage(page) {
    this.messageListPage = page
  },

  resetMessageList() {
    this.currentMessageList = []
  },

  resetSelectedItems() {
    this.selectedMessages.forEach((message) => {
      message.isSelected = false
    })
  },

  changeCurrentMessageIdentifiers(messageIdentifiers) {
    this.currentMessageIdentifiers = messageIdentifiers
    this.currentMessageHeaders =
      (messageIdentifiers &&
        this.currentMessageList.find(
          (messageListItem) =>
            messageListItem.accountId === messageIdentifiers.accountId &&
            messageListItem.folder === messageIdentifiers.folder &&
            messageListItem.uid === messageIdentifiers.uid
        ))
      || null
  },

  async asyncGetCurrentMessage() {
    const messageIdentifiers = this.currentMessageIdentifiers
    if (!messageIdentifiers) {
      return
    }

    const messageFromCache = getMessageFromCache(
      messageIdentifiers.accountId,
      messageIdentifiers.folder,
      messageIdentifiers.uid
    )
    if (messageFromCache) {
      this.currentMessage = messageFromCache
    } else {
      const parameters = {
        AccountID: messageIdentifiers.accountId,
        Folder: messageIdentifiers.folder,
        Uid: messageIdentifiers.uid,
        MessageBodyTruncationThreshold: settings.get('messageBodyTruncationThreshold'),
      }
      this.isCurrentMessageLoading = true
      const messageFromServer = await mailWebApi.getMessage(parameters)
      this.currentMessage = messageFromServer
      this.isCurrentMessageLoading = false
      addMessageToCache(
        messageIdentifiers.accountId,
        messageIdentifiers.folder,
        messageIdentifiers.uid,
        messageFromServer
      )
    }
  },
}
