<template>
  <div>
    <SelectHeader v-if="isSelectHeader" :items="selectedMessages" />
    <ComposeHeader
      v-else-if="isComposeHeader"
      :folderName="folderName"
      @executeAction="
        (...args) => {
          $emit('executeAction', ...args)
        }
      "
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
import { mapActions, mapGetters } from 'vuex'

import DefaultHeader from './DefaultHeader'
import SelectHeader from './SelectHeader'
import SearchHeader from './SearchHeader'
import ViewHeader from './ViewHeader'
import ComposeHeader from './ComposeHeader'

export default {
  name: 'MailHeader',

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
    ...mapGetters('mailmobile', ['isUnifiedInbox', 'currentFolder', 'currentSearchText', 'selectedMessages']),

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
      return this.$route.name === 'message-compose'
    },

    isSelectHeader() {
      return this.selectedMessages.length > 0
    },
  },

  methods: {
    ...mapActions('mailmobile', ['changeCurrentSearchText', 'asyncGetMessages']),

    openSearch() {
      this.isSearchHeader = true
      this.searchText = ''
    },

    updateSearchText(text) {
      this.searchText = text
      this.changeCurrentSearchText(this.searchText)
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
