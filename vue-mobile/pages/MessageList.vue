<template>
  <div class="column fit">
  <div v-if="isUnseenFilter" class="list__info">
    <span v-html="unseenFilterBannerText"></span>
    <div @click="clearUnreadMessage" class="list__button">
      {{ $t('MAILWEBCLIENT.ACTION_CLEAR_FILTER') }}
    </div>
  </div>

  <EmptyFolder v-if="isListEmpty && !isUnseenFilter" />
  
  <q-scroll-area id="messages-list-scroll" :thumb-style="{ width: '5px' }" class="messages__list col full-height">
    <AppPullRefresh :refresh-action="reloadList">
      <div class="messages__loader messages__loader_initial" v-if="isMessageListLoading && currentMessageList.length === 0">
        <q-spinner-dots color="primary" size="40px" />
      </div>
      <q-virtual-scroll
        v-else-if="currentMessageList.length > 0"
        ref="messagesVirtualScroll"
        :virtual-scroll-item-size="64"
        :items="currentMessageList"
        scroll-target="#messages-list-scroll > .scroll"
      >
        <template v-slot="{ item, index }">
          <MessageItem 
            :key="index"
            :message=item
            class="mail"
            v-touch-hold.mouse="event => longPress(item, event)"
            :isSelectMode="isSelectMode"
            :selectItemHandler="selectItem"
          />
        </template>
        <template #after>
          <div class="messages__loader" v-intersection="onIntersection" v-if="!isListEndReached">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
      </q-virtual-scroll>
    </AppPullRefresh>
  </q-scroll-area>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useMailStore } from '../store/index-pinia'

import AppPullRefresh from 'src/components/common/AppPullRefresh'
import MessageItem from '../components/message-list/MessageItem'
import EmptyFolder from '../components/message-list/EmptyFolder'
import eventBus from 'src/event-bus'
import TextUtils from 'src/utils/text'

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
      'isMessageListLoading',
      'isUnifiedInbox',
    ]),
    isUnseenFilter() {
      return this.currentFilter === 'unseen'
    },
    isListEmpty() {
      return this.currentMessageList.length == 0 && !this.isMessageListLoading
    },
    isListEndReached() {
      return this.currentMessageList.length === (this.currentFolder?.count ?? 0)
    },
    folderDisplayName() {
      if (this.isUnifiedInbox) {
        return this.$t('MAILWEBCLIENT.LABEL_FOLDER_ALL_INBOXES')
      }
      return this.currentFolder?.displayName || ''
    },
    searchStringForDescription() {
      return TextUtils.encodeHtml(
        (this.currentSearchText || '').replace(/(^|\s)folders:(all|sub)(\s|$)/, '')
      )
    },
    unseenFilterBannerText() {
      const folder = TextUtils.encodeHtml(this.folderDisplayName)
      const hasSearch = this.currentSearchText !== ''

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

    clearUnreadMessage() {
      this.$router.push({
        name: 'message-list',
        params: {},
      });
      eventBus.$emit('closeDrawer')
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
