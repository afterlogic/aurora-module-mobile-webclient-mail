<template>
  <div class="flex items-center justify-between q-pl-lg q-pt-lg">
    <div class="text-grey q-pt-sm">
      {{ accountsHeading }}
    </div>
  </div>

  <div class="q-pl-sm q-pt-lg">
    <account-item 
      v-for="account in accountList"
      :key="account.id"
      :account="account"
      :selected="currentAccountId === account.id"
    />
  </div>

  <div class="flex items-center justify-between q-pa-md q-pl-lg">
    <div class="text-grey">
      {{ $t('MAILMOBILEWEBCLIENT.HEADING_FOLDERS') }}
    </div>
  </div>

  <div class="">
    <folder-item
      v-for="folder in currentFoldersTree"
      :key="folder.fullName"
      :folder="folder"
      :selected="currentFolderFullName === folder.fullName"
    />
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
      'currentFolder',
    ]),

    currentAccountId () {
      return this.currentAccount && this.currentAccount.id || 0
    },

    accountsHeading () {
      return this.currentAccount && this.currentAccount.friendlyName || this.$t('MAILMOBILEWEBCLIENT.HEADING_ACCOUNTS')
    },

    currentFolderFullName () {
      return this.currentFolder && this.currentFolder.fullName || ''
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
}
</script>

<style lang="scss" scoped>
</style>
