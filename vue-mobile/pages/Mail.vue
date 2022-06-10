<template>
  <main-layout>
    <template v-slot:drawer>
      <drawer-content />
    </template>
    <q-scroll-area :thumb-style="{ width: '5px' }" class="contacts__list" v-if="!isMessageListLoading && currentMessageList.length">
      <app-pull-refresh :refresh-action="asyncGetMessages">
        <q-list>
          <message-item v-for="message in currentMessageList" :key="message.unifiedUid" :message="message" class="contact" />
        </q-list>
<!--        <div style="height: 70px" class="full-width" />-->
      </app-pull-refresh>
    </q-scroll-area>
<!--    <empty-contacts v-if="isContactsEmpty" />-->
    <div class="q-mt-xl flex items-center justify-center" v-if="isMessageListLoading">
      <q-circular-progress indeterminate size="40px" color="primary" class="q-ma-md" />
    </div>
  </main-layout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import MainLayout from 'src/layouts/MainLayout'
import DrawerContent from '../components/DrawerContent'
import MessageItem from '../components/message-list/Messagetem'

export default {
  name: 'Mail',

  components: {
    MainLayout,
    DrawerContent,
    MessageItem,
  },

  computed: {
    ...mapGetters('mailmobile', [
      'currentFolder',
      'isMessageListLoading',
      'currentMessageList',
    ]),
  },

  watch: {
    currentFolder () {
      this.asyncGetMessages()
    },
  },

  mounted () {
    this.asyncGetMessages()
  },

  methods: {
    ...mapActions('mailmobile', [
      'asyncGetMessages',
    ]),
  }
}
</script>

<style scoped>
.contacts__list {
  height: 100%;
}
</style>
