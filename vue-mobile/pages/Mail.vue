<template>
  <MainLayout>
    <template v-slot:drawer>
      <DrawerContent />
    </template>

    <q-linear-progress
      v-if="isFolderListLoading || isMessageListLoading"
      class="full-width"
      indeterminate
      track-color="grey-1"
      color="primary"
    />
    <router-view v-else></router-view>

    <AppCreateButton @click="showCreateButtonsDialog" v-if="!isSelectMode">
      <ComposeIcon color="#fff" />
    </AppCreateButton>
  </MainLayout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import notification from 'src/utils/notification'

import MainLayout from 'src/layouts/MainLayout'
import AppCreateButton from 'src/components/common/AppCreateButton'

import DrawerContent from '../components/DrawerContent'
import ComposeIcon from '../components/icons/ComposeIcon'

export default {
  name: 'Mail',

  components: {
    MainLayout,
    AppCreateButton,
    DrawerContent,
    ComposeIcon,
  },

  data() {
    return {
      appButtonPressed: false,
    }
  },

  computed: {
    ...mapGetters('mailmobile', [
      'currentAccountId',
      'isFolderListLoading',
      'currentFoldersTree',
      'currentFoldersDelimiter',
      'currentFolder',
      'currentFilter',
      'isMessageListLoading',
      'isSelectMode',
    ]),
  },

  watch: {
    '$route.params.accountId': {
      handler: async function () {
        this.setAccountFromRoute()
      },
      immediate: true,
    },

    '$route.params.folderPath': {
      handler: function () {
        this.setFolderFromRoute()
      },
      immediate: true,
    },

    '$route.params.filter': {
      handler: function () {
        this.setFilterFromRoute()
      },
      immediate: true,
    },

    currentFoldersTree() {
      this.setFolderFromRoute()
    },

    currentFolder() {
      this.asyncGetMessages()
    },

    currentFilter() {
      this.asyncGetMessages()
    },
  },

  methods: {
    ...mapActions('mailmobile', [
      'changeCurrentAccount',
      'changeCurrentFolder',
      'changeCurrentFilter',
      'asyncGetMessages',
    ]),

    setAccountFromRoute() {
      const parsedAccountId = parseInt(this.$route.params.accountId, 10)
      this.changeCurrentAccount(parsedAccountId)
      if (parsedAccountId !== this.currentAccountId) {
        if (this.currentFolder) {
          this.$router.replace(`/mail/${this.currentAccountId}/${this.currentFolder.fullName}/`)
        } else {
          this.$router.replace(`/mail/${this.currentAccountId}/INBOX/`)
        }
      }
    },

    setFolderFromRoute() {
      const folderPath = Array.isArray(this.$route.params.folderPath) ? this.$route.params.folderPath : []
      const folderFullName = folderPath.join(this.currentFoldersDelimiter)
      this.changeCurrentFolder(folderFullName)
      if (this.currentFolder && folderFullName !== this.currentFolder.fullName) {
        this.$router.replace(`/mail/${this.currentAccountId}/${this.currentFolder.fullName}/`)
      }
    },

    setFilterFromRoute() {
      const filter = this.$route.params.filter
      this.changeCurrentFilter(filter)
      if (this.currentFolder && filter !== this.currentFilter) {
        this.$router.replace(`/mail/${this.currentAccountId}/${this.currentFolder.fullName}/`)
      }
    },

    showCreateButtonsDialog() {
      this.appButtonPressed = !this.appButtonPressed
      notification.showReport('Comming soon')
    },
  },
}
</script>

<style scoped></style>
