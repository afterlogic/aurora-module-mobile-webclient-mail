import _ from 'lodash'

import accountsUtils from '../utils/accounts'
import mailWebApi from '../mail-web-api'
import settings from '../settings'
import { FOLDER_TYPES } from '../enums'
import { addMessageToCache, getMessageFromCache, deleteMessageFromCache } from '../cache'
import SendingUtils from '../utils/sending'
import core from 'src/core'
import types from 'src/utils/types'

export default {
  changeDialogComponent(dialogComponent) {
    console.log('changeDialogComponent store');
    this.dialogComponent = dialogComponent
  },
  parseAccounts(accountsData) {
    const parsedAccountsData = accountsUtils.parseAccounts(accountsData)
    this.accountList = parsedAccountsData.accountList

    if (this.accountList.length === 0) {
      this.currentAccountId = 0
      return
    }

    const hasCurrentAccount = this.accountList.some((account) => account.id === this.currentAccountId)
    this.currentAccountId = hasCurrentAccount
      ? this.currentAccountId
      : parsedAccountsData.currentAccountId
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
    let totalFoldersCount = this.currentFoldersCount
    if (foldersFullNames.length === 0) {
      const data = this.newFoldersFullNames.find((item) => item.accountId === currentAccountId)
      foldersFullNames = data?.newFoldersFullNames || []
      if (data) {
        totalFoldersCount = data.totalFoldersCount
      }
      this.clearNewFoldersFullNames(currentAccountId)
    }
    if (foldersFullNames.length !== 0) {
      const parameters = {
        AccountID: currentAccountId,
        Folders: foldersFullNames,
        UseListStatusIfPossible: totalFoldersCount < 100 || foldersFullNames.length > 50,
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
      if (
        !this.currentFolder
        || folder.fullName !== this.currentFolder.fullName
        || folder.accountId !== this.currentFolder.accountId
      ) {
        this.currentFolder = folder
        // Unread filter is per-folder view; do not carry it when switching folders.
        // Route can re-apply it (message-list-filter / unseen badge click).
        if (this.currentFilter === 'unseen') {
          this.currentFilter = ''
        }
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
    const itemsPerPage = this.messageListItemsPerPage ?? 20
    const isUnifiedInbox = this.isUnifiedInbox
    const requestSearch = this.currentSearchText
    const requestFilter = this.currentFilter

    const parameters = {
      Offset: ((page || 1) - 1) * itemsPerPage,
      Limit: itemsPerPage,
      Search: requestSearch,
      Filters: requestFilter,
      SortBy: 'arrival',
      SortOrder: 1,
      UseThreading: false,
      InboxUidnext: '',
    }

    let requestFolderFullName = ''
    let requestAccountId = null
    if (!isUnifiedInbox) {
      const currentFolder = this.currentFolder
      if (!currentFolder) {
        return
      }
      requestFolderFullName = currentFolder.fullName
      requestAccountId = currentFolder.accountId
      parameters.AccountID = currentFolder.accountId
      if (currentFolder.isVirtual) {
        // Virtual Starred folder: messages are fetched from the source folder (INBOX) with the flagged filter
        parameters.Folder = currentFolder.sourceFolderFullName
        parameters.Filters = currentFolder.virtualFilter
      } else {
        parameters.Folder = currentFolder.fullName
      }
    }

    if (page === 1) {
      this.currentMessageList = []
      this.messageListLastPageCount = 0
      this.numberOfMessages = 0
    }

    this.isMessageListLoading = true
    const result = await mailWebApi.getMessages(
      parameters,
      isUnifiedInbox,
      this.isCurrentSearchInMultiFolders
    )
    this.isMessageListLoading = false

    if (result === null) {
      return
    }

    const messages = result.messages || []
    const messageCount = result.messageCount || 0

    const isStillRelevant = page === this.messageListPage
      && requestSearch === this.currentSearchText
      && requestFilter === this.currentFilter
      && (
        isUnifiedInbox
          ? this.isUnifiedInbox
          : this.currentFolder
            && String(requestAccountId) === String(this.currentFolder.accountId)
            && requestFolderFullName === this.currentFolder.fullName
      )

    if (isStillRelevant) {
      this.currentMessageList = page > 1
        ? this.currentMessageList.concat(messages)
        : messages
      this.messageListLastPageCount = messages.length

      const folderCount = isUnifiedInbox
        ? (this.unifiedInboxInfo?.count ?? 0)
        : (this.currentFolder?.count ?? 0)
      this.numberOfMessages = Math.max(messageCount, folderCount)
    }
  },

  changeMessageListPage(page) {
    this.messageListPage = page
  },

  resetMessageList() {
    this.currentMessageList = []
    this.messageListLastPageCount = 0
    this.numberOfMessages = 0
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

    const { accountId, folder, uid } = messageIdentifiers

    this.isCurrentMessageLoading = true

    if (settings.get('markMessageSeenWhenViewing')) {
      const listItem = this.currentMessageHeaders
      const cachedMessage = getMessageFromCache(accountId, folder, uid)
      const sourceMessage = listItem || cachedMessage

      if (sourceMessage && !sourceMessage.isSeen) {
        await this.asyncSetMessagesSeen(uid, true, folder, accountId)
      }
    }

    const message = await this.asyncGetMessage(accountId, folder, uid)

    if (settings.get('markMessageSeenWhenViewing') && message && !message.isSeen) {
      await this.asyncSetMessagesSeen(uid, true, folder, accountId)
    }

    this.currentMessage = message
    if (message && !this.currentMessageHeaders) {
      this.currentMessageHeaders = message
    }
    this.isCurrentMessageLoading = false
  },

  async asyncGetMessage(accountId, folder, uid) {
    let message = getMessageFromCache(accountId, folder, uid)

    if (!message) {
      const parameters = {
        AccountID: accountId,
        Folder: folder,
        Uid: uid,
        MessageBodyTruncationThreshold: settings.get('messageBodyTruncationThreshold'),
      }
      message = await mailWebApi.getMessage(parameters)
      addMessageToCache(accountId, folder, uid, message)
    }

    return message || null
  },

  async fetchAllFolderMessageUids(accountId, folderFullName) {
    const uids = []
    const limit = 100
    let offset = 0

    while (true) {
      const result = await mailWebApi.getMessages(
        {
          AccountID: accountId,
          Folder: folderFullName,
          Offset: offset,
          Limit: limit,
          Search: '',
          Filters: '',
          SortBy: 'arrival',
          SortOrder: 1,
          UseThreading: false,
          InboxUidnext: '',
        },
        false,
        false,
      )

      const messages = result?.messages
      if (!Array.isArray(messages) || messages.length === 0) {
        break
      }

      messages.forEach((message) => {
        uids.push(message.uid)
      })

      if (messages.length < limit) {
        break
      }

      offset += messages.length
    }

    return uids
  },

  async asyncMoveMessagesToFolder(accountId, sourceFolder, destinationFolder, uids) {
    const batchSize = 100

    for (let i = 0; i < uids.length; i += batchSize) {
      const batch = uids.slice(i, i + batchSize)
      const result = await mailWebApi.moveMessages({
        AccountID: accountId,
        Folder: sourceFolder,
        ToFolder: destinationFolder,
        Uids: batch.join(','),
      })

      if (!result) {
        return false
      }
    }

    return true
  },

  async asyncClearFolder() {
    const currentFolder = this.currentFolder
    if (!currentFolder) {
      return false
    }

    if (currentFolder.type === FOLDER_TYPES.SPAM) {
      const trashFolder = this.getFolderByType(currentFolder.accountId, FOLDER_TYPES.TRASH)
      if (!trashFolder) {
        return false
      }

      const uids = await this.fetchAllFolderMessageUids(
        currentFolder.accountId,
        currentFolder.fullName,
      )

      if (uids.length === 0) {
        if ((currentFolder.count ?? 0) > 0) {
          return false
        }
      } else {
        const moved = await this.asyncMoveMessagesToFolder(
          currentFolder.accountId,
          currentFolder.fullName,
          trashFolder.fullName,
          uids,
        )

        if (!moved) {
          return false
        }

        trashFolder.count = (trashFolder.count ?? 0) + uids.length
        trashFolder.unseenCount = (trashFolder.unseenCount ?? 0) + (currentFolder.unseenCount ?? 0)
      }

      this.resetMessageList()
      this.changeMessageListPage(1)
      currentFolder.count = 0
      currentFolder.unseenCount = 0

      return true
    }

    if (currentFolder.type === FOLDER_TYPES.TRASH) {
      const result = await mailWebApi.clearFolder({
        AccountID: currentFolder.accountId,
        Folder: currentFolder.fullName,
      })

      if (!result) {
        return false
      }

      this.resetMessageList()
      this.changeMessageListPage(1)
      currentFolder.count = 0
      currentFolder.unseenCount = 0

      return true
    }

    return false
  },

  async asyncMoveMessages(params) {
    const sUids = params?.uids ? params?.uids.join(',') : ''
    const parameters = {
      AccountID: this.currentAccountId,
      Folder: params?.sourceFolder,
      ToFolder: params?.destinationFolder,
      Uids: sUids,
    }

    const result = await mailWebApi.moveMessages(parameters)

    return result
  },

  updateMessageSeenLocally(accountId, folder, uid, isSeen) {
    let becameSeen = false
    let becameUnseen = false

    const applySeen = (message) => {
      if (
        message
        && message.uid === uid
        && message.folder === folder
        && message.accountId === accountId
        && message.isSeen !== isSeen
      ) {
        if (!message.isSeen && isSeen) {
          becameSeen = true
        }
        if (message.isSeen && !isSeen) {
          becameUnseen = true
        }
        message.isSeen = isSeen
      }
    }

    this.currentMessageList.forEach(applySeen)
    applySeen(this.currentMessage)
    applySeen(this.currentMessageHeaders)

    const cachedMessage = getMessageFromCache(accountId, folder, uid)
    if (cachedMessage) {
      applySeen(cachedMessage)
    }

    const folderObj = this.getFolderByFullName(accountId, folder)
    if (becameSeen) {
      if (folderObj && folderObj.unseenCount > 0) {
        folderObj.unseenCount -= 1
      }

      if (this.isUnifiedInbox && this.unifiedInboxInfo?.unseenCount > 0) {
        this.unifiedInboxInfo.unseenCount -= 1
      }
    } else if (becameUnseen) {
      if (folderObj) {
        folderObj.unseenCount = (folderObj.unseenCount ?? 0) + 1
      }

      if (this.isUnifiedInbox && this.unifiedInboxInfo) {
        this.unifiedInboxInfo.unseenCount = (this.unifiedInboxInfo.unseenCount ?? 0) + 1
      }
    }
  },

  async asyncSetMessagesSeen(uid, setAction, folder, accountId = 0) {
    const messageFolder = folder
    if (!messageFolder) {
      return false
    }

    const parameters = {
      AccountID: accountId || this.currentAccountId,
      Folder: messageFolder,
      Uids: String(uid),
      SetAction: setAction,
    }

    const result = await mailWebApi.setMessagesSeen(parameters)

    if (result) {
      this.updateMessageSeenLocally(parameters.AccountID, messageFolder, uid, setAction)
    }

    return result
  },

  /**
   * Mark messages as read/unread (bulk or single), grouped by account+folder like desktop SetMessagesSeen.
   */
  async asyncSetMessagesSeenForMessages(messages, setAction) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return false
    }

    const groups = new Map()
    messages.forEach((message) => {
      if (!message) {
        return
      }
      const accountId = message.accountId || message.AccountID || this.currentAccountId
      const folder = message.folder || message.Folder
      const uid = message.uid
      if (!folder || uid === undefined || uid === null || uid === '') {
        return
      }
      const key = `${accountId}:${folder}`
      if (!groups.has(key)) {
        groups.set(key, { accountId, folder, uids: [], messages: [] })
      }
      const group = groups.get(key)
      group.uids.push(uid)
      group.messages.push(message)
    })

    if (groups.size === 0) {
      return false
    }

    let allSucceeded = true
    const updatedMessages = []

    for (const group of groups.values()) {
      const parameters = {
        AccountID: group.accountId,
        Folder: group.folder,
        Uids: group.uids.join(','),
        SetAction: setAction,
      }

      const result = await mailWebApi.setMessagesSeen(parameters)
      if (!result) {
        allSucceeded = false
        continue
      }

      group.uids.forEach((uid) => {
        this.updateMessageSeenLocally(group.accountId, group.folder, uid, setAction)
      })
      updatedMessages.push(...group.messages)
    }

    if (setAction && this.currentFilter === 'unseen' && updatedMessages.length > 0) {
      this.removeMessagesFromList(updatedMessages)
    }

    return allSucceeded
  },

  async asyncSetMessageFlagged(uid, flag, folder, accountId = 0) {
    const messageFolder = folder || (this.currentFolder?.isVirtual ? null : this.currentFolder?.fullName)
    if (!messageFolder) {
      return false
    }

    const parameters = {
      AccountID: accountId || this.currentAccountId,
      Folder: messageFolder,
      Uids: uid,
      SetAction: flag,
    }

    const result = await mailWebApi.setMessageFlagged(parameters)

    if (result && this.currentFolder?.isVirtual && !flag) {
      const message = this.currentMessageList.find(
        (item) => item.uid === uid && item.folder === messageFolder
      )
      if (message) {
        this.removeMessagesFromList([message])
      }
    }

    return result
  },

  removeMessagesFromList(messages) {
    messages.forEach((message) => {
      const accountId = message.accountId || message.AccountID
      const folder = message.folder || message.Folder

      deleteMessageFromCache(accountId, folder, message.uid)

      const itemIndex = this.currentMessageList.findIndex((item) => item.uid === message.uid)

      if (itemIndex !== -1) {
        this.currentMessageList.splice(itemIndex, 1)
      }
    })
  },

  isDraftsFolderCurrent(accountId, draftFolderFullName) {
    return (
      this.currentFolder &&
      this.currentFolder.accountId === accountId &&
      this.currentFolder.fullName === draftFolderFullName
    )
  },

  removeOldDraftFromList(accountId, draftFolderFullName, oldDraftUid) {
    const parsedOldDraftUid = parseInt(oldDraftUid, 10)

    if (!parsedOldDraftUid) {
      return
    }

    deleteMessageFromCache(accountId, draftFolderFullName, parsedOldDraftUid)

    const itemIndex = this.currentMessageList.findIndex(
      (item) =>
        item.accountId === accountId &&
        item.folder === draftFolderFullName &&
        item.uid === parsedOldDraftUid
    )

    if (itemIndex !== -1) {
      this.currentMessageList.splice(itemIndex, 1)
    }
  },

  async refreshAfterDraftSave({ accountId, draftFolderFullName, oldDraftUid }) {
    this.removeOldDraftFromList(accountId, draftFolderFullName, oldDraftUid)

    await this.asyncGetRelevantFoldersInformation([draftFolderFullName])

    if (this.isDraftsFolderCurrent(accountId, draftFolderFullName)) {
      this.changeMessageListPage(1)
      await this.asyncGetMessages()
    }
  },

  /**
   * After SendMessage the folder list stays stale until the user switches folders.
   * Reload page 1 of the current folder so Inbox (or whatever was open) shows new mail.
   */
  async refreshAfterMessageSend() {
    if (this.isUnifiedInbox || this.currentFolder) {
      this.changeMessageListPage(1)
      await this.asyncGetMessages()
    }
  },

  saveDraftOnNavigateBack(parameters) {
    if (!SendingUtils.hasSaveableContent(parameters)) {
      return
    }

    const accountId = parameters.AccountID
    const draftFolderFullName = parameters.DraftFolder
    const oldDraftUid = parameters.DraftUid
    const isDraftsFolderCurrent = this.isDraftsFolderCurrent(accountId, draftFolderFullName)

    if (isDraftsFolderCurrent) {
      this.resetMessageList()
      this.changeMessageListPage(1)
      this.isMessageListLoading = true
    }

    mailWebApi.saveMessage(parameters).then(async (result) => {
      if (result?.NewUid) {
        this.removeOldDraftFromList(accountId, draftFolderFullName, oldDraftUid)
        await this.asyncGetRelevantFoldersInformation([draftFolderFullName])
      }

      if (isDraftsFolderCurrent) {
        await this.asyncGetMessages()
      }
    })
  },

  setComposeToAddresses(toAddresses) {
    this.composeToAddresses = toAddresses || ''
  },

  takeComposeToAddresses() {
    const toAddresses = this.composeToAddresses
    this.composeToAddresses = ''
    return toAddresses
  },

  setComposeAttachments(attachments) {
    this.composeAttachments = Array.isArray(attachments) ? attachments : []
  },

  takeComposeAttachments() {
    const attachments = this.composeAttachments
    this.composeAttachments = []
    return attachments
  },

  setComposeSubject(subject) {
    this.composeSubject = subject || ''
  },

  takeComposeSubject() {
    const subject = this.composeSubject
    this.composeSubject = ''
    return subject
  },

  setComposeBody(body) {
    this.composeBody = body || ''
  },

  setComposeIsHtml(isHtml) {
    this.composeIsHtml = isHtml !== false
  },

  takeComposeBody() {
    const body = this.composeBody
    this.composeBody = ''
    return body
  },

  takeComposeIsHtml() {
    const isHtml = this.composeIsHtml
    this.composeIsHtml = true
    return isHtml
  },

  async asyncMoveCurrentMessage({ accountId, sourceFolder, destinationFolder, uid, message }) {
    const result = await this.asyncMoveMessagesToFolder(
      accountId,
      sourceFolder,
      destinationFolder,
      [uid],
    )

    if (result && message) {
      this.removeMessagesFromList([message])
    }

    return result
  },

  addAccountFromData(accountData) {
    const account = accountsUtils.parseAccountItem(accountData)
    const existingIndex = this.accountList.findIndex((item) => item.id === account.id)
    if (existingIndex === -1) {
      this.accountList.push(account)
    } else {
      this.accountList[existingIndex] = account
    }
    return account.id
  },

  async asyncRefreshAccounts() {
    const userId = types.pInt(core.appData?.User?.Id)
    if (!userId) {
      return false
    }

    const accounts = await mailWebApi.getAccounts({ UserId: userId })
    if (!Array.isArray(accounts)) {
      return false
    }

    this.parseAccounts(accounts)
    return true
  },

  async asyncCreateAccount({ friendlyName, email, password }) {
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    const trimmedFriendlyName = friendlyName.trim()

    if (!trimmedEmail || !trimmedPassword) {
      return null
    }

    const domain = trimmedEmail.split('@')[1]
    if (!domain) {
      return null
    }

    const serverResponse = await mailWebApi.getMailServerByDomain({
      Domain: domain,
      AllowWildcardDomain: true,
    })

    let server = null
    if (serverResponse?.Server) {
      if (serverResponse.FoundWithWildcard) {
        const defaultAccount = this.accountList[0]
        const mainEmail = defaultAccount?.email || ''
        const mainDomain = mainEmail.split('@')[1] || ''
        if (domain === mainDomain) {
          server = serverResponse.Server
        }
      } else {
        server = serverResponse.Server
      }
    }

    if (!server) {
      return { error: 'server_not_found' }
    }

    const serverId = types.pInt(server.Id ?? server.ServerId)
    const result = await mailWebApi.createAccount({
      FriendlyName: trimmedFriendlyName,
      Email: trimmedEmail,
      IncomingLogin: trimmedEmail,
      IncomingPassword: trimmedPassword,
      Server: { ServerId: serverId },
    })

    if (!result) {
      return { error: 'create_failed' }
    }

    const accountId = this.addAccountFromData(result)
    this.changeCurrentAccount(accountId)
    return { accountId }
  },
}
