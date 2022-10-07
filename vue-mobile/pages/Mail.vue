<template>
  <main-layout>
    <template v-slot:drawer>
      <drawer-content />
    </template>
    <q-scroll-area :thumb-style="{ width: '5px' }" class="contacts__list" v-if="!isMessageListLoading && currentMessageList.length">
      <app-pull-refresh :refresh-action="asyncGetMessages">
        <q-list>
          <message-item 
            v-for="message in currentMessageList" 
            :key="message.unifiedUid"
            :message="message"
            :isSelectMode="isSelectMode"
            class="mail"
            :selectMessage="selectItem"
            v-touch-hold.mouse="event => longPress(message, event)" />
        </q-list>
<!--    <div style="height: 70px" class="full-width" />-->
      </app-pull-refresh>
    </q-scroll-area>

    <empty-folder v-if="isListEmpty" />

    <div class="q-mt-xl flex items-center justify-center" v-if="isMessageListLoading">
      <q-circular-progress indeterminate size="40px" color="primary" class="q-ma-md" />
    </div>
    <app-create-button @click="showCreateButtonsDialog" v-if="isShowCreateButtons">
      <compose-icon color="#fff" />
    </app-create-button>
  </main-layout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import MainLayout from 'src/layouts/MainLayout'
import DrawerContent from '../components/DrawerContent'
import MessageItem from '../components/message-list/MessageItem'
import EmptyFolder from '../components/message-list/EmptyFolder'

import AppPullRefresh from 'src/components/common/AppPullRefresh'
import AppCreateButton from 'src/components/common/AppCreateButton'
import ComposeIcon from '../components/icons/ComposeIcon'

import notification from 'src/utils/notification'

export default {
  name: 'Mail',

  components: {
    MainLayout,
    DrawerContent,
    MessageItem,
    EmptyFolder,
    AppPullRefresh,
    AppCreateButton,
    ComposeIcon,
  },

  data() {
    return {
      isSelectMode: false,
      appButtonPressed: false
    }
  },

  mounted () {
    this.asyncGetMessages()
  },

  watch: {
    currentFolder () {
      this.asyncGetMessages()
    },
    selectedMessages(items) {
      if (!items.length) {
        this.isSelectMode = false
      }
    },
  },

  computed: {
    ...mapGetters('mailmobile', [
      'currentFolder',
      'isMessageListLoading',
      'currentMessageList',
      'selectedMessages',
      'dialogComponent',
    ]),
    isListEmpty() {
      // return !this.currentMessageList.length && !this.loadingStatus
      return !this.currentMessageList.length
    },
    isShowCreateButtons() {
      // return this.currentHeader !== 'SearchHeader' && !this.isSelectMode
      return !this.isSelectMode
    },
  },

  methods: {
    ...mapActions('mailmobile', [
      'asyncGetMessages',
      'changeSelectStatus',
    ]),
    selectItem(item) {
      this.changeSelectStatus(item)
    },
    longPress(item) {
      this.isSelectMode = true
      this.selectItem(item)
    },
    showCreateButtonsDialog() {
      this.appButtonPressed = !this.appButtonPressed
      notification.showReport('Comming soon')
    },
  }
}
</script>

<style scoped>
.contacts__list {
  height: 100%;
}
</style>
