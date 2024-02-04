const messagesCache = new Map()

export function addMessageToCache(accountId, folder, uid, message) {
  const key = JSON.stringify({ accountId, folder, uid })
  messagesCache.set(key, message)
}

export function getMessageFromCache(accountId, folder, uid) {
  const key = JSON.stringify({ accountId, folder, uid })
  return messagesCache.get(key)
}

export function deleteMessageFromCache(accountId, folder, uid) {
  const key = JSON.stringify({ accountId, folder, uid })
  return messagesCache.delete(key)
}
