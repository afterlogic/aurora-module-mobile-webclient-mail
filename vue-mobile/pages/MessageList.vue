<template>
  <div class="column fit message-list">
  <div v-if="isUnseenFilter" class="list__info col-auto">
    <span v-html="unseenFilterBannerText"></span>
    <div @click="clearUnreadMessage" class="list__button">
      {{ $t('MAILWEBCLIENT.ACTION_CLEAR_FILTER') }}
    </div>
  </div>

  <div v-if="isSearchBannerVisible" class="list__info col-auto">
    <span v-html="searchBannerContent"></span>
    <div v-if="showClearSearchButton" @click="clearSearch" class="list__button">
      {{ $t('COREWEBCLIENT.ACTION_CLEAR_SEARCH') }}
    </div>
  </div>

  <EmptyFolder v-if="isListEmpty && !isUnseenFilter && !isSearch" class="col" />
  
  <q-scroll-area
    v-else
    id="messages-list-scroll"
    :thumb-style="{ width: '5px' }"
    class="messages__list col"
  >
    <AppPullRefresh :refresh-action="reloadList">
      <div class="messages__loader messages__loader_initial" v-if="isInitialListLoading">
        <q-spinner-dots color="primary" size="40px" />
      </div>
      <template v-else>
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
          class="messages__loader"
          v-intersection="onIntersection"
          v-if="currentMessageList.length > 0 && !isListEndReached"
        >
          <q-spinner-dots v-if="isMessageListLoading" color="primary" size="40px" />
        </div>
      </template>
    </AppPullRefresh>
  </q-scroll-area>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'pinia'
import { useMailStore } from '../store/index-pinia'

import AppPullRefresh from 'src/components/common/AppPullRefresh'
import MessageItem from '../components/message-list/MessageItem'
import EmptyFolder from '../components/message-list/EmptyFolder'
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
    MessageItem,
    EmptyFolder,
  },

  data() {
    return {
      isSelectMode: false,
    }
  },

  computed: {
    ...mapState(useMailStore, [
      'currentFolder',
      'currentSearchText',
      'currentFilter',
      'currentMessageList',
      'messageListPage',
      'messageListLastPageCount',
      'isMessageListLoading',
      'isUnifiedInbox',
    ]),
    ...mapGetters(useMailStore, ['messageListItemsPerPage']),
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
    showClearSearchButton() {
      return !shouldHideClearSearch({
        searchText: this.currentSearchText,
        isStarredFolder: this.isStarredFolder,
      })
    },
    isListEmpty() {
      return this.currentMessageList.length == 0 && !this.isMessageListLoading
    },
    isListEndReached() {
      if (this.currentMessageList.length === 0) {
        return true
      }

      const itemsPerPage = this.messageListItemsPerPage ?? 20
      const hasFilterOrSearch = this.currentFilter !== '' || this.isSearch

      if (!hasFilterOrSearch && !this.isUnifiedInbox) {
        return this.currentMessageList.length >= (this.currentFolder?.count ?? 0)
      }

      return this.messageListLastPageCount < itemsPerPage
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

  methods: {
    ...mapActions(useMailStore, [
      'asyncGetMessages',
      'changeMessageListPage',
    ]),

    messageItemKey(item, index) {
      if (item?.uid && item?.folder) {
        return `${item.accountId}-${item.folder}-${item.uid}`
      }
      return index
    },

    clearUnreadMessage() {
      this.$router.push({
        name: 'message-list',
        params: {},
      });
      eventBus.$emit('closeDrawer')
    },

    clearSearch() {
      eventBus.$emit('clearSearch')
    },

    async reloadList() {
      this.changeMessageListPage(1)
      await this.asyncGetMessages()
    },
    onIntersection(data) {
      if (!this.isMessageListLoading && data.isIntersecting) {
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
</style>
