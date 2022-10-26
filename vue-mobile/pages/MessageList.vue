<template>
  <div v-if="currentFilter" style="position: absolute; z-index: 1; background: #a6dbed">
    currentFilter: {{ currentFilter }}
  </div>
  <div v-if="currentSearchText" style="position: absolute; z-index: 1; background: #c6f6c1; right: 0">
    currentSearchText: {{ currentSearchText }}
  </div>
  <EmptyFolder v-if="this.currentMessageList.length === 0" />
  <q-scroll-area v-else :thumb-style="{ width: '5px' }" class="contacts__list">
    <AppPullRefresh :refresh-action="asyncGetMessages">
      <q-list>
        <MessageItem v-for="message in currentMessageList" :key="message.uid" :message="message" class="mail" />
      </q-list>
    </AppPullRefresh>
  </q-scroll-area>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import AppPullRefresh from 'src/components/common/AppPullRefresh'

import MessageItem from '../components/message-list/MessageItem'
import EmptyFolder from '../components/message-list/EmptyFolder'

export default {
  name: 'MessageList',

  components: {
    AppPullRefresh,
    MessageItem,
    EmptyFolder,
  },

  computed: {
    ...mapGetters('mailmobile', ['currentFolder', 'currentSearchText', 'currentFilter', 'currentMessageList']),
  },

  methods: {
    ...mapActions('mailmobile', ['asyncGetMessages']),
  },
}
</script>

<style scoped>
.contacts__list {
  height: 100%;
}
</style>
