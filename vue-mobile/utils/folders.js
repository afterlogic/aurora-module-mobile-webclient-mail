import { i18n } from 'boot/i18n'

import {FOLDER_TYPES} from '../enums'

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

function parseFolder(folderData, namespace, oldFolder) {
  const
    type = types.pInt(folderData.Type),
    name = types.pString(folderData.Name),
    fullName = types.pString(folderData.FullNameRaw),
    delimiter = types.pString(folderData.Delimiter)
  return {
    fullName,
    name,
    type,
    delimiter,
    namespaced: (fullName + delimiter) === namespace,
    displayName: getDisplayName(type, name),
    isSubscribed: !!folderData.isSubscribed,
    isSelectable: !!folderData.isSelectable,
    exists: !!folderData.exists,
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

      const newFolder = parseFolder(folderData, namespace, oldFolder)
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
