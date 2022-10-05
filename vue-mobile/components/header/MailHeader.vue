<template>
  <div>
    <default-header v-if="isDefaultHeader" @openDrawer="$emit('openDrawer')" />
    <select-header v-if="isSelectHeader" :items="selectedMessages" />
    <!-- <search-header v-if="isSearchHeader" /> -->
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import DefaultHeader from './DefaultHeader'
import SelectHeader from './SelectHeader'
// import SearchHeader from './SearchHeader'

export default {
  name: 'MailHeader',
  
  components: {
    DefaultHeader,
    SelectHeader,
    // SearchHeader,
  },

  // beforeUnmount() {
  //   this.changeSearchText('')
  //   this.changeCurrentHeader('')
  // },

  computed: {
    ...mapGetters('mailmobile', ['currentHeader', 'selectedMessages']),
    isDefaultHeader() {
      return (
        !this.isSelectHeader
        // && !this.isSearchHeader
      )
    },
    isSelectHeader() {
      return this.selectedMessages.length > 0
    },
    // isSearchHeader() {
    //   return this.currentHeader === 'SearchHeader' && !this.isSelectHeader
    // },
  },

  methods: {
    ...mapActions('mailmobile', [
      'resetSelectedItems',
    ]),
    reset() {
      this.resetSelectedItems({ items: this.items })
    },
  },
}
</script>
