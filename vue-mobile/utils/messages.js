import types from 'src/utils/types'

function getAccountId(unifiedUid, isUnifiedInbox, accountIdFromParameters = 0) {
  if (isUnifiedInbox) {
    const identifiers = unifiedUid.split(':')
    if (identifiers.length === 3) {
      return types.pInt(identifiers[0])
    }
  }
  return accountIdFromParameters
}

function parseMessageListItem(messageData, isUnifiedInbox, accountIdFromParameters) {
  const unifiedUid = types.pString(messageData.UnifiedUid)
  const accountId = getAccountId(unifiedUid, isUnifiedInbox, accountIdFromParameters)
  return {
    accountId,
    bcc: types.pObject(messageData.Bcc), // TODO: parse collection of addresses
    cc: types.pObject(messageData.Cc), // TODO: parse collection of addresses
    custom: types.pArray(messageData.Custom),
    downloadAsEmlUrl: types.pString(messageData.DownloadAsEmlUrl),
    draftInfo: types.pObject(messageData.DraftInfo),
    folder: types.pString(messageData.Folder),
    from: types.pObject(messageData.From), // TODO: parse collection of addresses
    hasAttachments: !!messageData.HasAttachments,
    hasIcalAttachment: !!messageData.HasIcalAttachment,
    hasVcardAttachment: !!messageData.HasVcardAttachment,
    hash: types.pString(messageData.Hash),
    importance: types.pInt(messageData.Importance), // TODO: use pEnum
    internalTimeStampInUTC: types.pInt(messageData.InternalTimeStampInUTC),
    isAnswered: !!messageData.IsAnswered,
    isFlagged: !!messageData.IsFlagged,
    isForwarded: !!messageData.IsForwarded,
    isSeen: !!messageData.IsSeen,
    messageId: types.pString(messageData.MessageId),
    receivedOrDateTimeStampInUTC: types.pInt(messageData.ReceivedOrDateTimeStampInUTC),
    replyTo: types.pObject(messageData.ReplyTo), // TODO: parse collection of addresses
    sender: types.pObject(messageData.Sender), // TODO: parse collection of addresses
    size: types.pInt(messageData.Size),
    subject: types.pString(messageData.Subject),
    textSize: types.pInt(messageData.TextSize),
    threads: types.pArray(messageData.Threads), // only in message list
    timeStampInUTC: types.pInt(messageData.TimeStampInUTC),
    to: types.pObject(messageData.To), // TODO: parse collection of addresses
    truncated: !!messageData.Truncated,
    uid: types.pInt(messageData.Uid),
    unsubscribe: types.pObject(messageData.Unsubscribe),
  }
}

export function parseMessageList(messageListData, isUnifiedInbox, accountIdFromParameters) {
  return messageListData.map((messageData) => {
    const message = parseMessageListItem(messageData, isUnifiedInbox, accountIdFromParameters)
    message.isSelected = false // TODO: this should be only in the MessageItem.vue
    return message
  })
}

export function parseMessage(messageData, accountIdFromParameters) {
  const message = parseMessageListItem(messageData, false, accountIdFromParameters)
  message.attachments = types.pObject(messageData.Attachments) // TODO: parse Attachments
  message.foundedCIDs = types.pArray(messageData.FoundedCIDs)
  message.foundedContentLocationUrls = types.pArray(messageData.FoundedContentLocationUrls)
  message.hasExternals = !!messageData.HasExternals
  message.headers = types.pString(messageData.Headers)
  message.html = types.pString(messageData.Html)
  message.inReplyTo = types.pString(messageData.InReplyTo)
  message.plain = types.pString(messageData.Plain)
  message.plainRaw = types.pString(messageData.PlainRaw)
  message.readingConfirmationAddressee = types.pString(messageData.ReadingConfirmationAddressee)
  message.references = types.pString(messageData.References)
  message.rtl = !!messageData.Rtl
  message.safety = !!messageData.Safety
  message.sensitivity = types.pInt(messageData.Sensitivity) // TODO: use pEnum
  return message
}
