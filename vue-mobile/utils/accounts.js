import types from 'src/utils/types'

function parseAccountItem(accountData) {
  const serverData = types.pObject(accountData.Server)
  const server = {
    id: types.pInt(serverData.Id),
    name: types.pInt(serverData.Name),
  }
  const foldersOrderData = types.pString(accountData.FoldersOrder)
  const foldersOrder = foldersOrderData ? JSON.parse(foldersOrderData) : []
  const id = types.pInt(accountData.AccountID || accountData.Id)

  return {
    id,
    email: types.pString(accountData.Email),
    foldersOrder,
    friendlyName: types.pString(accountData.FriendlyName),
    includeInUnifiedMailbox: types.pBool(accountData.IncludeInUnifiedMailbox),
    saveRepliesToCurrFolder: types.pBool(accountData.SaveRepliesToCurrFolder),
    server,
    showUnifiedMailboxLabel: types.pBool(accountData.ShowUnifiedMailboxLabel),
    signature: types.pString(accountData.Signature),
    unifiedMailboxLabelColor: types.pString(accountData.UnifiedMailboxLabelColor),
    unifiedMailboxLabelText: types.pString(accountData.UnifiedMailboxLabelText),
    useSignature: !!accountData.UseSignature,
    useThreading: types.pBool(accountData.UseThreading),
    useToAuthorize: types.pBool(accountData.UseToAuthorize),
  }
}

function parseAccounts(accountsData) {
  let currentAccountId = 0
  const accountList = accountsData.map((accountData) => {
    const account = parseAccountItem(accountData)
    if (currentAccountId === 0) {
      currentAccountId = account.id
    }
    return account
  })
  return {
    currentAccountId,
    accountList,
  }
}

function getAccountHolderDisplayName(account) {
  const friendlyName = types.pString(account?.friendlyName)
  if (friendlyName) {
    return friendlyName
  }

  const email = types.pString(account?.email)
  if (email) {
    const localPart = email.split('@')[0]
    return localPart || email
  }

  return ''
}

export default {
  parseAccounts,
  parseAccountItem,
  getAccountHolderDisplayName,
}
