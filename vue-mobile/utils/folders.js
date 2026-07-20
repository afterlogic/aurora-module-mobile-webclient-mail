import { i18n } from 'boot/i18n'

import {FOLDER_TYPES, STARRED_FOLDER_FULL_NAME, STARRED_FOLDER_FILTER} from '../enums'

import types from 'src/utils/types'

function getDisplayName(folderType, folderName, isUnifiedInbox = false) {
  if (isUnifiedInbox) {
    return i18n.global.tc('MAILWEBCLIENT.LABEL_FOLDER_ALL_INBOXES')
  }
  switch (folderType) {
    case FOLDER_TYPES.INBOX:
      return i18n.global.tc('MAILWEBCLIENT.LABEL_FOLDER_INBOX')
    case FOLDER_TYPES.SENT:
      return i18n.global.tc('MAILWEBCLIENT.LABEL_FOLDER_SENT')
    case FOLDER_TYPES.DRAFTS:
      return i18n.global.tc('MAILWEBCLIENT.LABEL_FOLDER_DRAFTS')
    case FOLDER_TYPES.TRASH:
      return i18n.global.tc('MAILWEBCLIENT.LABEL_FOLDER_TRASH')
    case FOLDER_TYPES.SPAM:
      return i18n.global.tc('MAILWEBCLIENT.LABEL_FOLDER_SPAM')
    default:
      return folderName
  }
}

function buildStarredFolder(accountId, delimiter, sourceFolderFullName) {
  // Folder names are not translated in the client, so Starred stays English too
  const displayName = STARRED_FOLDER_FULL_NAME
  return {
    accountId,
    fullName: STARRED_FOLDER_FULL_NAME,
    name: displayName,
    type: FOLDER_TYPES.STARRED,
    delimiter,
    namespaced: false,
    displayName,
    isSubscribed: true,
    isSelectable: true,
    exists: true,
    hasChanges: false,
    count: 0,
    unseenCount: 0,
    nextUid: '',
    hash: STARRED_FOLDER_FULL_NAME,
    subFolders: [],
    hasSubscribed: [],
    // Virtual folder: the real request goes to INBOX with the flagged filter
    isVirtual: true,
    virtualFilter: STARRED_FOLDER_FILTER,
    sourceFolderFullName,
  }
}

function parseFolder(accountId, folderData, namespace, oldFolder) {
  const
    type = types.pInt(folderData.Type),
    name = types.pString(folderData.Name),
    fullName = types.pString(folderData.FullNameRaw),
    delimiter = types.pString(folderData.Delimiter)
  return {
    accountId,
    fullName,
    name,
    type,
    delimiter,
    namespaced: (fullName + delimiter) === namespace,
    displayName: getDisplayName(type, name),
    isSubscribed: !!(folderData.IsSubscribed ?? folderData.isSubscribed),
    isSelectable: !!(folderData.IsSelectable ?? folderData.isSelectable),
    exists: !!(folderData.Exists ?? folderData.exists),
    hasChanges: oldFolder ? oldFolder.hasChanges : false,
    count: oldFolder ? oldFolder.count : 0,
    unseenCount: oldFolder ? oldFolder.unseenCount : 0,
    nextUid: oldFolder ? oldFolder.nextUid : '',
    hash: oldFolder ? oldFolder.hash : fullName,
    subFolders: [],
    hasSubscribed: []
  }
}

function parseFolders(accountId, result) {
  const
    namespace = types.pString(result.Namespace),
    foldersTree = types.pArray(result.Folders['@Collection']),
    flatList = [],
    oldFlatList = [],
    newFoldersFullNames = []

  function _recursive(foldersTree) {
    const newFoldersTree = []
    let hasSubscribed = false

    foldersTree.forEach(folderData => {
      const oldFolder = oldFlatList[folderData.FullNameRaw]
      delete oldFlatList[folderData.FullNameRaw]

      const newFolder = parseFolder(accountId, folderData, namespace, oldFolder)
      if (folderData.SubFolders && folderData.SubFolders['@Collection']) {
        const subFoldersData = _recursive(folderData.SubFolders['@Collection'])
        newFolder.subFolders = subFoldersData.tree
        newFolder.hasSubscribed = subFoldersData.hasSubscribed
      }
      hasSubscribed = hasSubscribed || newFolder.exists && newFolder.isSubscribed || newFolder.hasSubscribed

      if (!oldFolder) {
        newFoldersFullNames.push(newFolder.fullName)
      }
      newFoldersTree.push(newFolder)
      flatList.push(newFolder)
    })

    return {
      tree: newFoldersTree,
      hasSubscribed: hasSubscribed,
    }
  }

  let newFoldersData = _recursive(foldersTree)

  const inboxFolder = flatList.find((folder) => folder.type === FOLDER_TYPES.INBOX)
  if (inboxFolder) {
    const starredFolder = buildStarredFolder(accountId, inboxFolder.delimiter, inboxFolder.fullName)
    flatList.push(starredFolder)
    const inboxTreeIndex = newFoldersData.tree.findIndex((folder) => folder.type === FOLDER_TYPES.INBOX)
    if (inboxTreeIndex !== -1) {
      newFoldersData.tree.splice(inboxTreeIndex + 1, 0, starredFolder)
    } else {
      newFoldersData.tree.unshift(starredFolder)
    }
  }

  oldFlatList.forEach((folder, name) => {
    delete oldFlatList[name]
  })

  return {
    accountId,
    namespace,
    tree: newFoldersData.tree,
    flatList,
    newFoldersFullNames
  }
}

export default {
  parseFolders
}
