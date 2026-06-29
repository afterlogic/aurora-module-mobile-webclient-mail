<template>
  <AccountSwitcher />

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

import AccountSwitcher from './drawer/AccountSwitcher'
import FolderItem from './drawer/FolderItem'
import UnifiedInboxesItem from './drawer/UnifiedInboxesItem'

export default {
  name: 'DrawerContent',

  components: {
    AccountSwitcher,
    FolderItem,
    UnifiedInboxesItem,
  },

  computed: {
    ...mapGetters(useMailStore, ['isAllowedUnifiedInbox', 'currentFoldersTree']),
  },
}
</script>
