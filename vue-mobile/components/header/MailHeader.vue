<template>
  <div>
    <SelectHeader v-if="isSelectHeader" :items="selectedMessages" />
    <ComposeHeader
      v-else-if="isComposeHeader"
      :folderName="folderName"
      :showSaveButton="showSaveButton"
      @executeAction="(...args) => { $emit('executeAction', ...args) }"
    />
    <ViewHeader v-else-if="isViewHeader" />
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
import eventBus from 'src/event-bus'

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

    openSearch(searchText) {
      this.isSearchHeader = true
      this.searchText = searchText || this.currentSearchText || ''
    },

    onOpenSearch(searchText) {
      this.openSearch(searchText)
      if (searchText && searchText !== this.currentSearchText) {
        this.updateSearchText(searchText)
      } else if (this.currentSearchText) {
        this.changeMessageListPage(1)
        this.asyncGetMessages()
      }
    },

    updateSearchText(text) {
      this.searchText = text
      this.changeCurrentSearchText(text)
      this.changeMessageListPage(1)
      this.asyncGetMessages()
    },

    clearSearchAndReload() {
      this.searchText = ''
      this.isSearchHeader = false
      if (this.currentSearchText !== '') {
        this.changeCurrentSearchText('')
        this.changeMessageListPage(1)
        this.asyncGetMessages()
      }
    },

    closeSearch() {
      this.clearSearchAndReload()
    },
  },

  mounted() {
    eventBus.$on('clearSearch', this.clearSearchAndReload)
    eventBus.$on('openSearch', this.onOpenSearch)
  },

  beforeUnmount() {
    eventBus.$off('clearSearch', this.clearSearchAndReload)
    eventBus.$off('openSearch', this.onOpenSearch)
  },
}
</script>
