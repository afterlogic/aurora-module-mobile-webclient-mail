<template>
  <div class="column fit">
  <div v-if="currentFilter" class="list__info">
    {{ currentSearchText 
      ? `${$t('FILESWEBCLIENT.LABEL_SEARCH_RESULTS')}: ${currentSearchText}`
      : $t('MAILWEBCLIENT.MOBILE_INFO_UNREAD_MESSAGES')
    }}
    <div @click="clearUnreadMessage" class="list__button">
      {{ $t('MAILWEBCLIENT.ACTION_CLEAR_FILTER') }}
    </div>
  </div>

  <EmptyFolder v-if="isListEmpty" />
  
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
import { mapState, mapActions, mapGetters } from 'pinia'
import { useMailStore } from '../store/index-pinia'

import AppPullRefresh from 'src/components/common/AppPullRefresh'
import MessageItem from '../components/message-list/MessageItem'
import EmptyFolder from '../components/message-list/EmptyFolder'
import eventBus from 'src/event-bus'

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
    ...mapState(useMailStore, ['currentFolder', 'currentSearchText', 'currentFilter', 'currentMessageList', 'messageListPage', 'isMessageListLoading']),
    isListEmpty() {
      return this.currentMessageList.length == 0 && !this.isMessageListLoading
    },
    isListEndReached() {
      return this.currentMessageList.length === (this.currentFolder?.count ?? 0)
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
