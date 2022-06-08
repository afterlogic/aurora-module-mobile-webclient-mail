import types from 'src/utils/types'

function parseAccounts(accountsData) {
  let currentAccountId = 0
  const accountList = accountsData.map(accountData => {
    const
      serverData = types.pObject(accountData.Server),
      server = {
        id: types.pInt(serverData.Id),
        name: types.pInt(serverData.Name),
      },
      foldersOrderData = types.pString(accountData.FoldersOrder),
      foldersOrder = foldersOrderData ? JSON.parse(foldersOrderData) : [],
      id = types.pInt(accountData.Id)
    if (currentAccountId === 0) {
      currentAccountId = id
    }
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
      useSignature: types.pBool(accountData.UseSignature),
      useThreading: types.pBool(accountData.UseThreading),
      useToAuthorize: types.pBool(accountData.UseToAuthorize),
    }
  })
  return {
    currentAccountId,
    accountList
  }
}

export default {
  parseAccounts
}
