<template>
  <MainLayout>
    <template v-slot:header>
      <MailHeader @executeAction="executeAction" />
    </template>

    <template v-slot:drawer>
      <DrawerContent />
    </template>

    <div class="column fit">
      <AppListLoader
        v-if="isFolderListLoading && !isMessageContentRoute($route.name)"
        initial
        class="col"
      />
      <router-view
        v-if="!isFolderListLoading || isMessageContentRoute($route.name)"
        class="col fit"
        v-slot="{ Component, route }"
      >
      <component
        :is="Component"
        v-bind="isComposeRoute(route.name) ? { onInterface: getRouterViewInterface } : {}"
      />
    </router-view>
    </div>

    <AppCreateButton
      data-test-id="mail-compose-fab"
      @click="showCreateButtonsDialog"
      v-if="isShowCreateButtons"
    >
      <ComposeIcon color="#fff" />
    </AppCreateButton>
    
    <DialogsList />
  </MainLayout>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'pinia'
import { useMailStore } from '../store/index-pinia'

import MainLayout from 'src/layouts/MainLayout'
import AppCreateButton from 'src/components/common/AppCreateButton'

import MailHeader from '../components/header/MailHeader'
import DrawerContent from '../components/DrawerContent'
import DialogsList from '../components/DialogsList'

import ComposeIcon from '../components/icons/ComposeIcon'
import AppListLoader from 'src/components/common/AppListLoader'

export default {
  name: 'Mail',

  components: {
    MainLayout,
    AppCreateButton,
    MailHeader,
    DrawerContent,
    DialogsList,
    ComposeIcon,
    AppListLoader,
  },

  data() {
    return {
      routerViewInterface: {},
    }
  },

  computed: {
    ...mapState(useMailStore, ['currentAccountId', 'isUnifiedInbox', 'isFolderListLoading', 'currentFolder', 'currentFilter', 'isMessageListLoading']),
    ...mapGetters(useMailStore, ['isAllowedUnifiedInbox', 'currentFoldersTree', 'currentFoldersDelimiter', 'isSelectMode']),

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
        } else if (!this.isMessageContentRoute(routeName)) {
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
      if (this.isMessageContentRoute(this.$route.name)) {
        return
      }

      this.changeCurrentFolder(this.folderFullNameFromRoute)
      if (this.currentFolder && this.folderFullNameFromRoute !== this.currentFolder.fullName) {
        this.replaceRouteWithCurrentMessageList()
      }
    },

    isUnifiedInbox() {
      if (this.isMessageContentRoute(this.$route.name)) {
        return
      }

      this.changeMessageListPage(1)
      this.asyncGetMessages()
    },

    currentFolder() {
      if (this.isMessageContentRoute(this.$route.name)) {
        return
      }

      this.changeMessageListPage(1)
      this.asyncGetMessages()
    },

    currentFilter() {
      if (this.isMessageContentRoute(this.$route.name)) {
        return
      }

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
      'asyncGetFolders',
      'asyncGetMessages',
    ]),

    replaceRouteWithCurrentMessageList() {
      const params = {
        accountId: this.currentAccountId,
        folderPath: ['INBOX'],
      }

      if (this.currentFolder) {
        params.folderPath = this.currentFolder.fullName.split(this.currentFoldersDelimiter)
      }

      if (this.currentFilter) {
        this.$router.replace({
          name: 'message-list-filter',
          params: {
            ...params,
            filter: this.currentFilter,
          },
        })
      } else {
        this.$router.replace({
          name: 'message-list',
          params,
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

    isMessageContentRoute(routeName) {
      return routeName === 'message-compose'
        || routeName === 'message-reply'
        || routeName === 'message-view'
    },

    isComposeRoute(routeName) {
      return routeName === 'message-compose' || routeName === 'message-reply'
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
}
.list {
  &__info {
    text-align: center;
    color: #969494;
    padding: 16px 32px 32px 32px;
  }

  &__button {
      color: #469CF8;
      margin-top: 12px;
    }
}
</style>
