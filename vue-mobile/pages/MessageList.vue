<template>
  <div class="column fit message-list" data-test-id="mail-message-list">
  <div v-if="isUnseenFilter" class="list__info col-auto" data-test-id="mail-filter-banner">
    <span v-html="unseenFilterBannerText"></span>
    <div
      data-test-id="mail-filter-clear"
      @click="clearUnreadMessage"
      class="list__button"
    >
      {{ $t('MAILWEBCLIENT.ACTION_CLEAR_FILTER') }}
    </div>
  </div>

  <div v-if="isSearchBannerVisible" class="list__info col-auto">
    <span v-html="searchBannerContent"></span>
    <div v-if="showClearSearchButton" @click="clearSearch" class="list__button">
      {{ $t('COREWEBCLIENT.ACTION_CLEAR_SEARCH') }}
    </div>
  </div>

  <div v-if="isShowEmptyFolderButton" class="list__info col-auto">
    <div
      data-test-id="mail-empty-folder-button"
      @click="showEmptyFolderDialog"
      class="list__button list__button_with-icon"
    >
      <ActionIcon class="list__button-icon" icon="DeleteIcon" with-cross />
      {{ emptyFolderButtonLabel }}
    </div>
  </div>

  <EmptyFolder v-if="isListEmpty && !isUnseenFilter && !isSearch && !isInitialListLoading" class="col" />

  <AppListLoader v-else-if="isInitialListLoading" initial class="col" />

  <q-scroll-area
    v-else
    id="messages-list-scroll"
    ref="messagesScrollArea"
    :thumb-style="{ width: '5px' }"
    class="messages__list col"
  >
    <AppPullRefresh :refresh-action="reloadList">
      <MessageItem
        v-for="(item, index) in currentMessageList"
        :key="messageItemKey(item, index)"
        :message="item"
        class="mail"
        v-touch-hold.mouse="event => longPress(item, event)"
        :isSelectMode="isSelectMode"
        :selectItemHandler="selectItem"
      />
      <div
        v-if="currentMessageList.length > 0 && !isMessageListEndReached"
        v-intersection="messagesIntersectionBinding"
        class="messages__list-sentinel"
      >
        <AppListLoader v-if="isMessageListLoading" />
      </div>
    </AppPullRefresh>
  </q-scroll-area>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'pinia'
import { useMailStore } from '../store/index-pinia'

import AppPullRefresh from 'src/components/common/AppPullRefresh'
import AppListLoader from 'src/components/common/AppListLoader'
import MessageItem from '../components/message-list/MessageItem'
import EmptyFolder from '../components/message-list/EmptyFolder'
import ActionIcon from '../components/common/ActionIcon'
import eventBus from 'src/event-bus'
import TextUtils from 'src/utils/text'
import {
  formatSearchStringForDescription,
  getSearchBannerI18nKey,
  shouldHideClearSearch,
} from '../utils/search-description'
import { FOLDER_TYPES } from '../enums'

export default {
  name: 'MessageList',

  components: {
    AppPullRefresh,
    AppListLoader,
    MessageItem,
    EmptyFolder,
    ActionIcon,
  },

  data() {
    return {
      isSelectMode: false,
      messagesIntersectionBinding: null,
    }
  },

  computed: {
    ...mapState(useMailStore, [
      'currentAccountId',
      'currentFolder',
      'currentSearchText',
      'currentFilter',
      'currentMessageList',
      'messageListPage',
      'isMessageListLoading',
      'isUnifiedInbox',
    ]),
    ...mapGetters(useMailStore, ['isMessageListEndReached', 'currentFoldersDelimiter']),
    isInitialListLoading() {
      return this.isMessageListLoading && this.messageListPage === 1
    },
    isUnseenFilter() {
      return this.currentFilter === 'unseen'
    },
    isSearch() {
      return (this.currentSearchText || '').trim() !== ''
    },
    isSearchBannerVisible() {
      return this.isSearch && !this.isUnseenFilter
    },
    isStarredFolder() {
      return this.currentFolder?.type === FOLDER_TYPES.STARRED
    },
    isSpamFolder() {
      return this.currentFolder?.type === FOLDER_TYPES.SPAM
    },
    isTrashFolder() {
      return this.currentFolder?.type === FOLDER_TYPES.TRASH
    },
    isShowEmptyFolderButton() {
      return (
        !this.isUnifiedInbox
        && (this.isSpamFolder || this.isTrashFolder)
        && (this.currentFolder?.count > 0 || this.currentMessageList.length > 0)
      )
    },
    emptyFolderButtonLabel() {
      if (this.isSpamFolder) {
        return this.$t('MAILWEBCLIENT.ACTION_EMPTY_SPAM')
      }
      if (this.isTrashFolder) {
        return this.$t('MAILWEBCLIENT.ACTION_EMPTY_TRASH')
      }
      return ''
    },
    showClearSearchButton() {
      return !shouldHideClearSearch({
        searchText: this.currentSearchText,
        isStarredFolder: this.isStarredFolder,
      })
    },
    isListEmpty() {
      return this.currentMessageList.length == 0 && !this.isMessageListLoading
    },
    folderDisplayName() {
      if (this.isUnifiedInbox) {
        return this.$t('MAILWEBCLIENT.LABEL_FOLDER_ALL_INBOXES')
      }
      return this.currentFolder?.displayName || ''
    },
    searchStringForDescription() {
      return TextUtils.encodeHtml(formatSearchStringForDescription(this.currentSearchText))
    },
    searchBannerText() {
      const folder = TextUtils.encodeHtml(this.folderDisplayName)
      const i18nKey = getSearchBannerI18nKey({
        searchText: this.currentSearchText,
        isUnifiedInbox: this.isUnifiedInbox,
      })

      return this.$t(`MAILWEBCLIENT.${i18nKey}`, {
        SEARCH: this.searchStringForDescription,
        FOLDER: folder,
      })
    },
    searchBannerContent() {
      if (this.isListEmpty) {
        return this.$t('MAILWEBCLIENT.INFO_SEARCH_EMPTY')
      }

      return this.searchBannerText
    },
    unseenFilterBannerText() {
      const folder = TextUtils.encodeHtml(this.folderDisplayName)
      const hasSearch = this.isSearch

      if (this.isListEmpty) {
        return hasSearch
          ? this.$t('MAILWEBCLIENT.INFO_NO_UNREAD_MESSAGES_FOUND')
          : this.$t('MAILWEBCLIENT.INFO_NO_UNREAD_MESSAGES')
      }

      if (hasSearch) {
        return this.$t('MAILWEBCLIENT.INFO_UNREAD_MESSAGES_SEARCH_RESULT', {
          SEARCH: this.searchStringForDescription,
          FOLDER: folder,
        })
      }

      return this.$t('MAILWEBCLIENT.INFO_UNREAD_MESSAGES', { FOLDER: folder })
    },
  },

  created() {
    this.messagesIntersectionBinding = {
      handler: this.onIntersection,
      cfg: {
        root: null,
        threshold: 0,
      },
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.syncMessagesScrollRoot()
    })
  },

  updated() {
    this.syncMessagesScrollRoot()
  },

  methods: {
    ...mapActions(useMailStore, [
      'asyncGetMessages',
      'changeMessageListPage',
      'changeDialogComponent',
    ]),

    syncMessagesScrollRoot() {
      const scrollRoot = this.$refs.messagesScrollArea?.getScrollTarget?.()
      if (!scrollRoot || scrollRoot === this.messagesIntersectionBinding.cfg.root) {
        return
      }

      this.messagesIntersectionBinding = {
        handler: this.onIntersection,
        cfg: {
          root: scrollRoot,
          threshold: 0,
        },
      }
    },

    messageItemKey(item, index) {
      if (item?.uid && item?.folder) {
        return `${item.accountId}-${item.folder}-${item.uid}`
      }
      return index
    },

    clearUnreadMessage() {
      if (this.isUnifiedInbox) {
        this.$router.push({ name: 'message-list-unified' })
      } else {
        this.$router.push({
          name: 'message-list',
          params: {
            accountId: this.currentAccountId,
            folderPath: (this.currentFolder?.fullName || 'INBOX').split(
              this.currentFoldersDelimiter
            ),
          },
        })
      }
      eventBus.$emit('closeDrawer')
    },

    clearSearch() {
      eventBus.$emit('clearSearch')
    },

    showEmptyFolderDialog() {
      this.changeDialogComponent({
        component: 'EmptyFolderDialog',
        folderType: this.currentFolder?.type,
      })
    },

    async reloadList() {
      this.changeMessageListPage(1)
      await this.asyncGetMessages()
    },

    onIntersection(data) {
      if (!this.isMessageListLoading && !this.isMessageListEndReached && data.isIntersecting) {
        this.changeMessageListPage(this.messageListPage + 1)
        this.asyncGetMessages()
      }
    },

    selectItem(message) {
      message.isSelected = !message.isSelected
    },

    longPress(message) {
      this.isSelectMode = true
      this.selectItem(message)
    },
  },
}
</script>

<style scoped lang="scss">
.message-list {
  min-height: 0;

  .messages__list {
    min-height: 0;
  }
}

.messages__list-sentinel {
  min-height: 1px;
}

.list__button_with-icon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.list__button-icon {
  flex-shrink: 0;
}
</style>
