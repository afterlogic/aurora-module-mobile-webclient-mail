<template>
  <div class="flex items-center justify-between q-pa-md q-pl-lg">
    <div class="text-grey">
      {{ accountsHeading }}
    </div>
  </div>

  <div class="q-pl-sm q-pt-sm">
    <account-item v-for="account in accountList" :key="account.id"
                  :account="account" :active="currentAccountId === account.id"
    />
  </div>

  <div class="flex items-center justify-between q-pa-md q-pl-lg">
    <div class="text-grey">
      {{ $t('MAILMOBILEWEBCLIENT.HEADING_FOLDERS') }}
    </div>
  </div>

  <div class="q-pl-sm">
    <folder-item v-for="folder in currentFoldersTree" :key="folder.fullName" :folder="folder" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import AccountItem from './drawer/AccountItem'
import FolderItem from './drawer/FolderItem'

export default {
  name: 'DrawerContent',

  components: {
    AccountItem,
    FolderItem,
  },

  computed: {
    ...mapGetters('mailmobile', [
      'accountList',
      'currentAccount',
      'currentFoldersTree',
    ]),

    currentAccountId () {
      return this.currentAccount && this.currentAccount.id || 0
    },

    accountsHeading () {
      return this.currentAccount && this.currentAccount.friendlyName || this.$t('MAILMOBILEWEBCLIENT.HEADING_ACCOUNTS')
    },
  },

  watch: {
    currentAccountId () {
      this.asyncGetFolders()
    },
  },

  mounted () {
    this.asyncGetFolders()
  },

  methods: {
    ...mapActions('mailmobile', [
      'asyncGetFolders',
    ]),

  }
};
</script>
<style>
.contacts__drawer-head {
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 25px;
  color: #969494;
}
</style>
