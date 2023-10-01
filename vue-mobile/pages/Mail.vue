<template>
  <MainLayout>
    <template v-slot:header>
      <MailHeader @executeAction="executeAction" />
    </template>

    <template v-slot:drawer>
      <DrawerContent />
    </template>

    <q-linear-progress
      v-if="isFolderListLoading"
      class="full-width"
      indeterminate
      track-color="grey-1"
      color="primary"
    />
    <router-view @interface="getRouterViewInterface" v-else></router-view>

    <AppCreateButton @click="showCreateButtonsDialog" v-if="isShowCreateButtons">
      <ComposeIcon color="#fff" />
    </AppCreateButton>
  </MainLayout>
</template>

<script>
import { mapActions, mapGetters } from 'pinia'
import { useMailStore } from '../store/index-pinia'

import MainLayout from 'src/layouts/MainLayout'
import AppCreateButton from 'src/components/common/AppCreateButton'

import MailHeader from '../components/header/MailHeader'
import DrawerContent from '../components/DrawerContent'
import ComposeIcon from '../components/icons/ComposeIcon'

export default {
  name: 'Mail',

  components: {
    MainLayout,
    AppCreateButton,
    MailHeader,
    DrawerContent,
    ComposeIcon,
  },

  data() {
    return {
      routerViewInterface: {},
    }
  },

  computed: {
    ...mapGetters(useMailStore, [
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

    isShowCreateButtons() {
      return (
        !this.isSelectMode
        && (
          this.$route.name === 'message-list'
          || this.$route.name === 'message-list-filter'
          || this.$route.name === 'message-list-unified'
          || this.$route.name === 'message-list-unified-filter'
        )
      )
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
        } else if (routeName !== 'message-view' && routeName !== 'message-compose') {
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
      this.resetMessageList()
      this.changeMessageListPage(1)
      this.asyncGetMessages()
    },

    currentFolder() {
      this.resetMessageList()
      this.changeMessageListPage(1)
      this.asyncGetMessages()
    },

    currentFilter() {
      this.resetMessageList()
      this.changeMessageListPage(1)
      this.asyncGetMessages()
    },
  },

  mounted() {
    this.asyncGetFolders()
  },

  methods: {
    ...mapActions(useMailStore, [
      'showUnifiedInbox',
      'changeCurrentAccount',
      'changeCurrentFolder',
      'changeCurrentFilter',
      'changeMessageListPage',
      'resetMessageList',
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
      this.$router.push({ name: 'message-compose' })
    },

    executeAction(actionName, ...args) {
      if (this.routerViewInterface[actionName]) {
        this.routerViewInterface[actionName](...args)
      }
    },

    getRouterViewInterface(routerViewInterface) {
      this.routerViewInterface = routerViewInterface
    },
  },
}
</script>

<style lang="scss">
.messages {
  &__list {
    height: 100%;
  }

  &__loader {
    display: flex;
    justify-content: center;
  }
}
.list {
  &__info {
    text-align: center;
    color: #969494;
    padding: 16px 32px 32px 32px;
  }
}
</style>
