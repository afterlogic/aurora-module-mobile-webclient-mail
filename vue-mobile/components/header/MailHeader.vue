<template>
  <div>
    <SelectHeader v-if="isSelectHeader" :items="selectedMessages" />
    <ComposeHeader
      v-else-if="isComposeHeader"
      :folderName="folderName"
      :showSaveButton="showSaveButton"
      @executeAction="(...args) => { $emit('executeAction', ...args) }"
    />
    <ViewHeader v-else-if="isViewHeader" :folderName="folderName" />
    <SearchHeader
      v-else-if="isSearchHeader"
      :folderName="folderName"
      :defaultSearchText="searchText"
      @updateSearchText="updateSearchText"
      @closeSearch="closeSearch"
    />
    <DefaultHeader v-else :folderName="folderName" @openSearch="openSearch" />
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'pinia'
import { useMailStore } from '../../store/index-pinia'

import { FOLDER_TYPES } from '../../enums'

import DefaultHeader from './DefaultHeader'
import SelectHeader from './SelectHeader'
import SearchHeader from './SearchHeader'
import ViewHeader from './ViewHeader'
import ComposeHeader from './ComposeHeader'

export default {
  name: 'MailHeader',

  emits: ['executeAction'],

  components: {
    DefaultHeader,
    SelectHeader,
    SearchHeader,
    ViewHeader,
    ComposeHeader,
  },

  data() {
    return {
      isSearchHeader: false,
      searchText: '',
    }
  },

  computed: {
    ...mapState(useMailStore, ['isUnifiedInbox', 'currentFolder', 'currentSearchText', 'currentAccountId']),
    ...mapGetters(useMailStore, ['selectedMessages', 'getFolderByType']),

    folderName() {
      if (this.isUnifiedInbox) {
        return this.$t('MAILWEBCLIENT.LABEL_FOLDER_ALL_INBOXES')
      }
      return this.currentFolder?.displayName || ''
    },

    isViewHeader() {
      return this.$route.name === 'message-view'
    },

    isComposeHeader() {
      return ['message-compose', 'message-reply'].indexOf(this.$route.name) >= 0
    },

    isSelectHeader() {
      return this.selectedMessages.length > 0
    },

    showSaveButton() {
      return !!this.getFolderByType(this.currentAccountId, FOLDER_TYPES.DRAFTS)
    },
  },

  methods: {
    ...mapActions(useMailStore, [
      'changeCurrentSearchText',
      'changeMessageListPage',
      'asyncGetMessages',
    ]),

    openSearch() {
      this.isSearchHeader = true
      this.searchText = ''
    },

    updateSearchText(text) {
      this.searchText = text
      this.changeCurrentSearchText(this.searchText)
      this.changeMessageListPage(1)
      this.asyncGetMessages()
    },

    closeSearch() {
      this.isSearchHeader = false
      if (this.currentSearchText !== '') {
        this.updateSearchText('')
      }
    },
  },
}
</script>
