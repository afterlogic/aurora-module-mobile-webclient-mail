<template>
  <div>
    <q-toolbar class="app-header search-toolbar">
      <div class="col app-header__left">
        <q-btn icon="close" @click="closeSearch" color="black" round flat dense />
      </div>
      <div class="col app-header__title">
        <span class="app-header__title-main" v-t="'COREMOBILEWEBCLIENT.LABEL_SEARCH'" />
        <span class="app-header__title-secondary">
          {{ folderName }}
        </span>
      </div>
      <div class="col app-header__right"></div>
    </q-toolbar>
    <q-toolbar class="search-toolbar__field">
      <q-input
        v-model="searchText"
        :placeholder="$t('COREMOBILEWEBCLIENT.LABEL_SEARCH')"
        autofocus
        borderless
        outlined
        dense
        class="search-toolbar__input"
        debounce="400"
      />
    </q-toolbar>
    <q-toolbar>
      <q-btn
        class="q-mx-auto"
        size="12px"
        flat
        no-caps
        text-color="blue"
        :label="$t('MAILWEBCLIENT.ACTION_OPEN_ADVANCED_SEARCH')"
        @click="openAdvancedSearch"
      >
      </q-btn>
      <AdvancedSearchDialog
        v-model="showAdvancedSearch"
        :defaultSearchText="searchText"
        @close="closeAdvancedSearch"
        @search="setSearchText"
      />
    </q-toolbar>
  </div>
</template>

<script>
import AdvancedSearchDialog from '../dialogs/AdvancedSearchDialog'

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

  components: {
    AdvancedSearchDialog,
  },

  data() {
    return {
      searchText: this.defaultSearchText,
      showAdvancedSearch: false,
    }
  },

  watch: {
    searchText() {
      this.$emit('updateSearchText', this.searchText)
    },
  },

  methods: {
    closeSearch() {
      this.$emit('closeSearch')
    },

    openAdvancedSearch() {
      this.showAdvancedSearch = true
    },

    closeAdvancedSearch() {
      this.showAdvancedSearch = false
    },

    setSearchText(searchText) {
      if (typeof searchText === 'string' && searchText !== this.searchText) {
        if (searchText === '') {
          this.closeSearch()
        } else {
          this.searchText = searchText
        }
      }
      this.showAdvancedSearch = false
    },
  },
}
</script>
