<template>
  <div class="flex items-center justify-between q-pl-lg q-pt-lg">
    <div class="text-grey q-pt-sm">
      {{ accountsHeading }}
    </div>
  </div>

  <div class="q-pl-sm q-pt-lg">
    <AccountItem
      v-for="account in accountList"
      :key="account.id"
      :account="account"
      :selected="currentAccountId === account.id"
    />
  </div>

  <template v-if="isAllowedUnifiedInbox">
    <div class="flex items-center justify-between q-pa-md q-pl-lg">
      <div class="text-grey">
        {{ $t('MAILMOBILEWEBCLIENT.HEADING_UNIFIED_FOLDERS') }}
      </div>
    </div>

    <UnifiedInboxesItem />
  </template>

  <div class="flex items-center justify-between q-pa-md q-pl-lg">
    <div class="text-grey">
      {{ $t('MAILMOBILEWEBCLIENT.HEADING_FOLDERS') }}
    </div>
  </div>

  <div>
    <FolderItem v-for="folder in currentFoldersTree" :key="folder.fullName" :folder="folder" />
  </div>
</template>

<script>
import { mapGetters } from 'pinia'
import { useMailStore } from '../store/index-pinia'

import settings from '../settings'

import AccountItem from './drawer/AccountItem'
import FolderItem from './drawer/FolderItem'
import UnifiedInboxesItem from './drawer/UnifiedInboxesItem'

export default {
  name: 'DrawerContent',

  components: {
    AccountItem,
    FolderItem,
    UnifiedInboxesItem,
  },

  data() {
    return {}
  },

  computed: {
    ...mapGetters(useMailStore, [
      'accountList',
      'isAllowedUnifiedInbox',
      'currentAccount',
      'currentFoldersTree',
      'currentFolder',
    ]),

    currentAccountId() {
      return (this.currentAccount && this.currentAccount.id) || 0
    },

    accountsHeading() {
      return (
        (this.currentAccount && this.currentAccount.friendlyName) || this.$t('MAILMOBILEWEBCLIENT.HEADING_ACCOUNTS')
      )
    },
  },
}
</script>

<style lang="scss" scoped></style>
