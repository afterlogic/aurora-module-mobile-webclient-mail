<template>
  <div>
    <q-toolbar class="app-header search-toolbar">
      <div class="col app-header__left">
        <q-btn icon="close" @click="closeSearch" color="black" round flat dense />
      </div>
      <div class="col app-header__title">
        <span class="app-header__title-main">
          {{ $t('CONTACTSMOBILEWEBCLIENT.LABEL_SEARCH') }}
        </span>
        <span class="app-header__title-secondary">
          {{ folderName }}
        </span>
      </div>
      <div class="col app-header__right"></div>
    </q-toolbar>
    <q-toolbar class="search-toolbar__field">
      <q-input
        v-model="searchText"
        :placeholder="$t('CONTACTSMOBILEWEBCLIENT.LABEL_SEARCH')"
        autofocus
        borderless
        outlined
        dense
        class="search-toolbar__input"
        debounce="400"
      />
    </q-toolbar>
  </div>
</template>

<script>
export default {
  name: 'SearchHeader',

  props: {
    folderName: {
      type: String,
      default: '',
    },
    defaultSearchText: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      searchText: this.defaultSearchText,
    }
  },

  watch: {
    searchText() {
      this.$emit('updateSearchText', this.searchText)
    },
  },

  methods: {
    async closeSearch() {
      this.$emit('closeSearch')
    },
  },
}
</script>
