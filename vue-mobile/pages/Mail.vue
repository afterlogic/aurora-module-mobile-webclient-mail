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
      'isUnifiedInbox',
      'isAllowedUnifiedInbox',
      'isFolderListLoading',
      'currentFoldersTree',
      'currentFoldersDelimiter',
      'currentFolder',
      'currentFilter',
      'isMessageListLoading',
      'isSelectMode',
    ]),

    accountIdFromRoute() {
      return parseInt(this.$route.params.accountId, 10)
    },

    folderFullNameFromRoute() {
      const folderPath = Array.isArray(this.$route.params.folderPath) ? this.$route.params.folderPath : []
      return folderPath.join(this.currentFoldersDelimiter)
    },
  },

  watch: {
    '$route.path': {
      handler: function () {
        const routeName = this.$route.name
        if (
          this.isAllowedUnifiedInbox &&
          (routeName === 'message-list-unified' || routeName === 'message-list-unified-filter')
        ) {
          this.showUnifiedInbox(true)
          const filter = this.$route.params.filter || ''
          if (filter !== this.currentFilter) {
            this.changeCurrentFilter(filter)
          }

          if (filter !== this.currentFilter) {
            this.$router.replace({ name: 'message-list-unified' })
          }
        } else if (routeName !== 'message-view') {
          this.showUnifiedInbox(false)

          if (this.accountIdFromRoute !== this.currentAccountId) {
            this.changeCurrentAccount(this.accountIdFromRoute)
          }

          if (this.folderFullNameFromRoute !== (this.currentFolder && this.currentFolder.fullName)) {
            this.changeCurrentFolder(this.folderFullNameFromRoute)
          }

          const filter = this.$route.params.filter || ''
          if (filter !== this.currentFilter) {
            this.changeCurrentFilter(filter)
          }

          if (
            this.accountIdFromRoute !== this.currentAccountId ||
            this.folderFullNameFromRoute !== (this.currentFolder && this.currentFolder.fullName) ||
            filter !== this.currentFilter
          ) {
            this.replaceRouteWithCurrentMessageList()
          }
        }
      },
      immediate: true,
    },

    currentAccountId() {
      this.asyncGetFolders()
    },

    currentFoldersTree() {
      this.changeCurrentFolder(this.folderFullNameFromRoute)
      if (this.currentFolder && this.folderFullNameFromRoute !== this.currentFolder.fullName) {
        this.replaceRouteWithCurrentMessageList()
      }
    },

    isUnifiedInbox() {
      this.asyncGetMessages()
    },

    currentFolder() {
      this.asyncGetMessages()
    },

    currentFilter() {
      this.asyncGetMessages()
    },
  },

  mounted() {
    this.asyncGetFolders()
  },

  methods: {
    ...mapActions('mailmobile', [
      'showUnifiedInbox',
      'changeCurrentAccount',
      'changeCurrentFolder',
      'changeCurrentFilter',
      'asyncGetFolders',
      'asyncGetMessages',
    ]),

    replaceRouteWithCurrentMessageList() {
      if (this.currentFolder) {
        this.$router.replace({
          name: 'message-list',
          params: {
            accountId: this.currentAccountId,
            folderPath: this.currentFolder.fullName.split(this.currentFoldersDelimiter),
          },
        })
      } else {
        this.$router.replace({
          name: 'message-list',
          params: { accountId: this.currentAccountId, folderPath: ['INBOX'] },
        })
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
